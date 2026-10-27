// app/api/chat/route.ts
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";

import { getCurrentUser } from "@/lib/services/auth";
import { getConversationByIdForUser } from "@/lib/services/conversations";
import { getTaskWithSolutionForAi } from "@/lib/services/tasks";
import { buildSocraticSystemPrompt } from "@/lib/ai/system-prompts";
import { createClient } from "@/lib/supabase/server";

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
      conversation.status === "graded"
    ) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (conversation.message_count >= 30) {
      return Response.json(
        { error: "Message limit exceeded" },
        { status: 429 },
      );
    }

    const taskContext = await getTaskWithSolutionForAi(conversation.task_id);

    if (!taskContext) {
      throw new Error("Chat task configuration is incomplete");
    }

    const result = streamText({
      model: openai("gpt-4o"),
      system: buildSocraticSystemPrompt(taskContext),
      messages: await convertToModelMessages(messages),
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
