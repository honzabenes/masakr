import { Bot, GraduationCap } from "lucide-react";
import type { Message } from "@/types";

export interface ChatMessageBubbleProps {
  message: Message;
}

export default function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isStudent = message.sender_type === "student";
  const isAi = message.sender_type === "ai";
  const isAdmin = message.sender_type === "admin";

  return (
    <div
      className={`flex md:gap-3 max-w-[90%] md:max-w-[85%] ${
        isStudent
          ? "self-end flex-col items-end md:flex-row-reverse md:items-start"
          : "self-start flex-col items-start md:flex-row md:items-start"
      }`}
    >
      {/* AVATARS */}
      {!isStudent && (
        <div
          className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-md flex items-center justify-center ${
            isAi
              ? "bg-muted text-muted-foreground"
              : "bg-orange-100 text-orange-700 border border-orange-200"
          }`}
        >
          {isAi ? (
            <Bot className="w-5 h-5 md:w-6 md:h-6" />
          ) : (
            <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
          )}
        </div>
      )}

      {/* MESSAGE BUBBLE */}
      <div
        className={`flex flex-col space-y-2 p-3 md:p-4 text-sm md:text-base leading-relaxed ${
          isStudent
            ? "bg-primary text-primary-foreground rounded-lg md:rounded-tr-sm"
            : isAi
              ? "bg-card border-border text-card-foreground rounded-lg md:rounded-tl-sm"
              : "bg-orange-50 border-2 border-orange-400 text-orange-950 rounded-lg md:rounded-tl-sm"
        }`}
      >
        {isAdmin && (
          <span className="text-[10px] md:text-xs font-bold text-orange-700 uppercase tracking-wider mb-1">
            Zpráva od učitele
          </span>
        )}

        <span>{message.content}</span>

        {message.image_url && (
          <img
            src={message.image_url}
            alt="Obrázek k řešení"
            className="mt-2 md:mt-3 rounded-md border border-border/50 max-h-48 md:max-h-64 object-cover"
          />
        )}
      </div>
    </div>
  );
}
