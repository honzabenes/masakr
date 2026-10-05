import ChatActionBar from "./ChatActionBar";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatInputArea from "./ChatInputArea";

import type { Message, ConversationStatus } from "@/types";

export interface StudentChatInterfaceProps {
  taskTitle: string;
  status: ConversationStatus;
  messages: Message[];
}

export default function StudentChatInterface({
  status,
  messages,
}: StudentChatInterfaceProps) {
  return (
    <main className="flex flex-col h-full w-full max-w-4xl rounded-md overflow-hidden bg-card text-card-foreground">
      {/* ACTION BAR */}
      <ChatActionBar status={status} />

      {/* MESSAGES */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 md:px-6 md:pb-6 bg-background">
        <div className="flex flex-col space-y-6">
          {messages.map((msg) => (
            <ChatMessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      </div>

      {/* INPUT FIELD */}
      <ChatInputArea status={status} />
    </main>
  );
}
