import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/services/auth";
import {
  getConversationByIdForUser,
  submitConversation,
} from "@/lib/services/conversations";
import { getTaskWithSolutionForAi } from "@/lib/services/tasks";
import {
  getMessagesByConversationId,
  createMessage,
} from "@/lib/services/messages";
import { buildSocraticSystemPrompt } from "@/lib/ai/system-prompts";
import { MAX_CHAT_MESSAGES } from "@/lib/constants/chat";

const MessagePartSchema = z.union([
  z
    .object({
      type: z.literal("text"),
      text: z
        .string()
        .max(2500, "Zpráva překračuje maximální délku 2500 znaků."),
    })
    .loose(),
  z
    .object({
      type: z.literal("file"),
      mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]),
      url: z
        .string()
        .max(7 * 1024 * 1024)
        .refine(
          (val) => /^data:image\/(jpeg|png|webp);base64,/.test(val),
          "Nepodporovaný formát obrázku.",
        ),
    })
    .loose(),
  z
    .object({
      type: z.string(),
    })
    .loose(),
]);

const UIMessageSchema = z
  .object({
    id: z.string().optional(),
    role: z.enum(["user", "assistant", "system"]),
    parts: z.array(MessagePartSchema).min(1),
  })
  .loose();

const ChatRequestSchema = z.object({
  messages: z.array(UIMessageSchema).min(1),
  data: z.object({
    taskId: z.string().uuid(),
    conversationId: z.string().uuid(),
  }),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser(supabase);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsedBody = ChatRequestSchema.safeParse(await req.json());
    if (!parsedBody.success) {
      return Response.json(
        {
          error: "Invalid request payload",
          details: parsedBody.error.format(),
        },
        { status: 400 },
      );
    }

    const { messages, data } = parsedBody.data;

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

    if (!isRevisionReply && conversation.message_count >= MAX_CHAT_MESSAGES) {
      await submitConversation(supabase, conversation.id, user.id);
      return Response.json({ error: "Message limit reached" }, { status: 429 });
    }

    const lastUserMessage = messages[messages.length - 1];

    const userTextPart = lastUserMessage.parts.find(
      (p): p is { type: "text"; text: string } => p.type === "text",
    );

    const imagePart = lastUserMessage.parts.find(
      (
        p,
      ): p is {
        type: "file";
        mediaType: "image/jpeg" | "image/png" | "image/webp";
        url: string;
      } => p.type === "file" && "url" in p,
    );

    const studentContent = userTextPart?.text?.trim() ?? "";

    if (!studentContent && !imagePart) {
      return Response.json({ error: "Prázdná zpráva" }, { status: 400 });
    }

    await createMessage({
      conversationId: conversation.id,
      senderType: "student",
      senderId: user.id,
      content: studentContent || "[Přiložený obrázek postupu]",
    });

    const wouldAiExceedLimit =
      conversation.message_count + 1 >= MAX_CHAT_MESSAGES;

    if (isRevisionReply || wouldAiExceedLimit) {
      await submitConversation(supabase, conversation.id, user.id);
      const emptyStream = createUIMessageStream({
        execute: () => {},
      });
      return createUIMessageStreamResponse({ stream: emptyStream });
    }

    const taskContext = await getTaskWithSolutionForAi(conversation.task_id);
    if (!taskContext) {
      throw new Error("Chat task configuration is incomplete");
    }

    const dbHistory = await getMessagesByConversationId(
      supabase,
      conversation.id,
    );

    const currentUserContent: Array<
      { type: "text"; text: string } | { type: "image"; image: string }
    > = [];

    if (studentContent) {
      currentUserContent.push({ type: "text", text: studentContent });
    }

    if (imagePart) {
      currentUserContent.push({ type: "image", image: imagePart.url });
    }

    const trustedModelMessages: Parameters<typeof streamText>[0]["messages"] = [
      ...dbHistory.map((m) => ({
        role:
          m.sender_type === "student"
            ? ("user" as const)
            : ("assistant" as const),
        content: m.content,
      })),
      {
        role: "user" as const,
        content: currentUserContent,
      },
    ];

    const result = streamText({
      model: openai("gpt-4o"),
      system: buildSocraticSystemPrompt(taskContext),
      messages: trustedModelMessages,
      onFinish: async ({ text }) => {
        const aiContent = text.trim();
        if (aiContent) {
          await createMessage({
            conversationId: conversation.id,
            senderType: "ai",
            senderId: null,
            content: aiContent,
          });

          if (conversation.message_count + 2 >= MAX_CHAT_MESSAGES) {
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
