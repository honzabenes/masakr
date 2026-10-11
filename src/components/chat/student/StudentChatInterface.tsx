"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type FileUIPart, type UIMessage } from "ai";

import ChatActionBar from "./ChatActionBar";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatInputArea from "./ChatInputArea";
import type { ConversationStatus, Message } from "@/types";

export interface StudentChatInterfaceProps {
  taskTitle: string;
  solution: string;
  status: ConversationStatus;
}

export default function StudentChatInterface({
  taskTitle,
  solution,
  status,
}: StudentChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { data: { taskTitle, solution } },
      }),
    [solution, taskTitle],
  );

  const { messages, sendMessage, status: chatStatus, error } = useChat({
    transport,
  });
  const isSubmitting = chatStatus === "submitted" || chatStatus === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="flex flex-col h-full w-full max-w-4xl rounded-md overflow-hidden bg-card text-card-foreground">
      <ChatActionBar status={status} />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 md:px-6 md:pb-6 bg-background">
        <div className="flex flex-col space-y-6">
          {messages.map((msg: UIMessage) => {
            const text = msg.parts
              .filter(
                (
                  part,
                ): part is Extract<
                  UIMessage["parts"][number],
                  { type: "text" }
                > => part.type === "text",
              )
              .map((part) => part.text)
              .join("");
            const imagePart = msg.parts.find(
              (part): part is FileUIPart =>
                part.type === "file" && part.mediaType.startsWith("image/"),
            );
            const mappedMessage: Message = {
              id: msg.id,
              content: text,
              sender_type: msg.role === "user" ? "student" : "ai",
              image_url: imagePart?.url,
              created_at: new Date().toISOString(),
            };

            return (
              <ChatMessageBubble
                key={mappedMessage.id}
                message={mappedMessage}
              />
            );
          })}

          {isSubmitting && (
            <div className="text-sm text-muted-foreground animate-pulse text-center mt-4">
              AI přemýšlí...
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive text-center mt-4">
              Došlo k chybě při komunikaci s AI.
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInputArea
        status={status}
        input={input}
        onInputChange={setInput}
        onSubmit={async (text, files) => {
          await sendMessage({ text, ...(files ? { files } : {}) });
        }}
        isSubmitting={isSubmitting}
      />
    </main>
  );
}
