"use client";

import { useState, useRef } from "react";
import { Send, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConversationStatus } from "@/types";

export interface ChatInputAreaProps {
  status: ConversationStatus;
}

export default function ChatInputArea({ status }: ChatInputAreaProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="p-3 md:p-4 pt-0 md:pt-0 bg-card shrink-0">
      {status !== "in_progress" ? (
        <div className="p-4 md:p-6 text-center text-sm md:text-base text-muted-foreground bg-muted/50 rounded-2xl border border-dashed border-border/60">
          Úkol byl odevzdán a{" "}
          {status === "submitted" ? "čeká na hodnocení." : "ohodnocen."}
        </div>
      ) : (
        <div className="flex flex-col w-full bg-muted/40 border border-border rounded-2xl p-2 md:p-3 focus-within:ring-1 focus-within:ring-primary/80 transition-shadow">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInput}
            rows={1}
            placeholder="Napsat zprávu..."
            className="w-full resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-[16px] md:text-base px-2 py-1 max-h-32 md:max-h-48 overflow-y-auto"
          />

          <div className="flex items-center justify-between mt-2">
            {/* LOAD BUTTON */}
            <div>
              <input type="file" accept="image/*" className="hidden" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 md:h-12 md:w-12 rounded-full shrink-0 text-muted-foreground hover:text-primary hover:bg-muted"
              >
                <Paperclip className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </div>

            {/* SEND BUTTON */}
            <Button
              disabled={!inputValue.trim()}
              className="h-10 w-10 md:h-12 md:w-12 rounded-full shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5 ml-0.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
