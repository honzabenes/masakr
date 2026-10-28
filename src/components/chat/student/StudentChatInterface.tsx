"use client";

import { useRef, useEffect, useMemo, useState, useTransition } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ChatActionBar from "./ChatActionBar";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatInputArea from "./ChatInputArea";
import { submitTaskAction } from "@/app/actions/conversations";
import type { ConversationStatus, Message } from "@/types";

const MAX_MESSAGES = 6;

export interface StudentChatInterfaceProps {
  taskId: string;
  conversationId: string;
  taskTitle: string;
  taskDescription: string;
  status: ConversationStatus;
  initialMessages: Message[];
}

export default function StudentChatInterface({
  taskId,
  conversationId,
  taskTitle,
  taskDescription,
  status: initialStatus,
  initialMessages,
}: StudentChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [currentStatus, setCurrentStatus] =
    useState<ConversationStatus>(initialStatus);
  const [isPendingSubmit, startSubmitTransition] = useTransition();

  const initialTaskMessage: Message = useMemo(
    () => ({
      id: "initial-task-msg",
      content: taskDescription,
      sender_type: "ai",
      created_at: new Date().toISOString(),
    }),
    [taskDescription],
  );

  const teacherMessageIds = useMemo(() => {
    return new Set(
      initialMessages
        .filter((m) => m.sender_type === "teacher")
        .map((m) => m.id),
    );
  }, [initialMessages]);

  const formattedInitialMessages: UIMessage[] = useMemo(() => {
    return initialMessages.map((msg) => ({
      id: msg.id,
      role: msg.sender_type === "student" ? "user" : "assistant",
      parts: [{ type: "text", text: msg.content }],
    }));
  }, [initialMessages]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { data: { taskId, conversationId } },
      }),
    [taskId, conversationId],
  );

  const {
    messages,
    sendMessage,
    status: chatStatus,
    error,
  } = useChat({
    transport,
    messages: formattedInitialMessages,
  });

  const isSubmitting = chatStatus === "submitted" || chatStatus === "streaming";
  const isLimitReached =
    currentStatus !== "needs_revision" && messages.length >= MAX_MESSAGES - 1;

  const effectiveStatus: ConversationStatus =
    isLimitReached && !isSubmitting && currentStatus !== "finished"
      ? "submitted"
      : currentStatus;

  const handleManualSubmit = () => {
    startSubmitTransition(async () => {
      await submitTaskAction(conversationId, taskId);
      setCurrentStatus("submitted");
    });
  };

  const handleSendMessage = async (text: string, files?: FileList) => {
    const willClose =
      currentStatus === "needs_revision" ||
      messages.length + 1 >= MAX_MESSAGES - 1;

    await sendMessage({ text, ...(files ? { files } : {}) });

    if (willClose) {
      setCurrentStatus("submitted");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const mapUIMessageToMessage = (msg: UIMessage): Message => {
    let textContent = "";
    let imageUrl: string | undefined = undefined;

    for (const part of msg.parts) {
      if (part.type === "text") {
        textContent += part.text;
      } else if (part.type === "file" && part.mediaType.startsWith("image/")) {
        imageUrl = part.url;
      }
    }

    const senderType =
      msg.role === "user"
        ? "student"
        : teacherMessageIds.has(msg.id)
          ? "teacher"
          : "ai";

    return {
      id: msg.id,
      content: textContent,
      sender_type: senderType,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
    };
  };

  return (
    <main className="flex flex-col h-full w-full max-w-4xl rounded-md overflow-hidden bg-card text-card-foreground">
      <ChatActionBar
        status={effectiveStatus}
        taskTitle={taskTitle}
        onSubmit={handleManualSubmit}
        isSubmittingTask={isPendingSubmit}
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 md:px-6 md:pb-6 bg-background">
        <div className="flex flex-col space-y-6">
          <ChatMessageBubble message={initialTaskMessage} />

          {messages.map((msg) => (
            <ChatMessageBubble
              key={msg.id}
              message={mapUIMessageToMessage(msg)}
            />
          ))}

          {isSubmitting && (
            <div className="text-sm text-muted-foreground animate-pulse text-center mt-4">
              AI přemýšlí...
            </div>
          )}

          {error && !isLimitReached && (
            <div className="text-sm text-destructive text-center mt-4">
              Došlo k chybě při komunikaci s AI.
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInputArea
        status={effectiveStatus}
        isLimitReached={isLimitReached}
        input={input}
        onInputChange={setInput}
        onSubmit={handleSendMessage}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}
