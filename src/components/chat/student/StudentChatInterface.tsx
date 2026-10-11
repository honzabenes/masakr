"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";

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
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    sendMessage,
    status: chatStatus,
  } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { data: { taskTitle, solution } },
    }),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isLoading = chatStatus === "submitted" || chatStatus === "streaming";
  const isError = chatStatus === "error";

  const handleSubmit = (text: string, image: string | null) => {
    const parts: any[] = [{ type: "text", text: text }];

    if (image) {
      const match = image.match(/^data:(image\/[a-zA-Z0-9]+);base64,(.+)$/);
      if (match) {
        parts.push({ 
          type: "file", 
          mediaType: match[1], 
          data: match[2] 
        });
      }
    }

    sendMessage({
      id: crypto.randomUUID(),
      role: "user",
      parts: parts,
    });
  };

  return (
    <main className="flex flex-col h-full w-full max-w-4xl rounded-md overflow-hidden bg-card text-card-foreground">
      <ChatActionBar status={status} />

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 md:px-6 md:pb-6 bg-background">
        <div className="flex flex-col space-y-6">
          {messages.map((msg) => {
            const textContent = msg.parts
              .filter((part) => part.type === "text")
              .map((part) => ("text" in part ? part.text : ""))
              .join("\n");
              
            const filePart = msg.parts.find(
              (part) => part.type === "file" && part.mediaType?.startsWith("image/")
            );

            let imageUrl: string | undefined = undefined;
            if (filePart) {
              if ("data" in filePart && typeof filePart.data === "string") {
                imageUrl = `data:${(filePart as any).mediaType || 'image/jpeg'};base64,${filePart.data}`;
              } else if ("url" in filePart && typeof filePart.url === "string") {
                imageUrl = filePart.url;
              }
            }

            const mappedMessage: Message = {
              id: msg.id,
              content: textContent,
              sender_type: msg.role === "user" ? "student" : "ai",
              image_url: imageUrl,
              created_at: new Date().toISOString(),
            };

            return (
              <ChatMessageBubble
                key={mappedMessage.id}
                message={mappedMessage}
              />
            );
          })}

          {isLoading && (
            <div className="text-sm text-muted-foreground animate-pulse text-center mt-4">
              AI přemýšlí...
            </div>
          )}
          {isError && (
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
        setInput={setInput}
        handleSubmit={handleSubmit}
      />
    </main>
  );
}