import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";

import { getCurrentUser } from "@/lib/services/auth";
import {
  getConversationByIdForUser,
  submitConversation,
} from "@/lib/services/conversations";
import { getTaskWithSolutionForAi } from "@/lib/services/tasks";
import { createMessage } from "@/lib/services/messages";
import { buildSocraticSystemPrompt } from "@/lib/ai/system-prompts";
import { createClient } from "@/lib/supabase/server";

const MAX_MESSAGES = 6;

type ChatRequest = {
  messages: UIMessage[];
  data?: {
    taskId?: string;
    conversationId?: string;
  };
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser(supabase);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, data } = (await req.json()) as ChatRequest;

    if (
      !Array.isArray(messages) ||
      typeof data?.taskId !== "string" ||
      typeof data.conversationId !== "string"
    ) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const conversation = await getConversationByIdForUser(
      supabase,
      data.conversationId,
      user.id,
    );

    if (
      !conversation ||
      conversation.task_id !== data.taskId ||
      conversation.status === "submitted" ||
      conversation.status === "finished"
    ) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const isRevisionReply = conversation.status === "needs_revision";

    if (!isRevisionReply && conversation.message_count >= MAX_MESSAGES) {
      await submitConversation(supabase, conversation.id, user.id);
      return Response.json({ error: "Message limit reached" }, { status: 429 });
    }

    const lastUserMessage = messages[messages.length - 1];
    const userTextPart = lastUserMessage?.parts?.find(
      (p): p is Extract<typeof p, { type: "text" }> => p.type === "text",
    );
    const studentContent = userTextPart?.text?.trim() ?? "";

    if (studentContent) {
      await createMessage({
        conversationId: conversation.id,
        senderType: "student",
        senderId: user.id,
        content: studentContent,
      });
    }

    const limitExceeded = conversation.message_count + 2 >= MAX_MESSAGES;

    if (isRevisionReply || limitExceeded) {
      await submitConversation(supabase, conversation.id, user.id);
      return Response.json({ status: "submitted" }, { status: 200 });
    }

    const taskContext = await getTaskWithSolutionForAi(conversation.task_id);

    if (!taskContext) {
      throw new Error("Chat task configuration is incomplete");
    }

    const result = streamText({
      model: openai("gpt-4o"),
      system: buildSocraticSystemPrompt(taskContext),
      messages: await convertToModelMessages(messages),
      onFinish: async ({ text }) => {
        const aiContent = text.trim();
        if (aiContent) {
          await createMessage({
            conversationId: conversation.id,
            senderType: "ai",
            senderId: null,
            content: aiContent,
          });

          if (conversation.message_count + 2 >= MAX_MESSAGES) {
            await submitConversation(supabase, conversation.id, user.id);
          }
        }
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error("[CHAT_API_ERROR]", error);

    return Response.json(
      { error: "Nastala neočekávaná chyba serveru" },
      { status: 500 },
    );
  }
}
