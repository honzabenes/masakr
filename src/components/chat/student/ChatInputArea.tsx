"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConversationStatus } from "@/types";
import { validateImageFile } from "@/lib/utils/image";
import { ErrorDialog } from "@/components/ui/error-dialog";

export interface ChatInputAreaProps {
  status: ConversationStatus;
  isLimitReached?: boolean;
  onSubmit: (text: string, files?: FileList) => Promise<void>;
  isSubmitting: boolean;
}

export default function ChatInputArea({
  status,
  isLimitReached = false,
  onSubmit,
  isSubmitting,
}: ChatInputAreaProps) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    const validationError = validateImageFile(file, "Obrázek");
    if (validationError) {
      setError(validationError);
      e.target.value = "";
      return;
    }

    const copiedFiles = new DataTransfer();
    copiedFiles.items.add(file);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFiles(copiedFiles.files);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
    textareaRef.current?.focus();
  };

  const clearImage = () => {
    setFiles(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!input.trim() && !files) || isSubmitting) return;

    const text = input.trim();
    const selectedFiles = files ?? undefined;

    setInput("");
    clearImage();
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      await onSubmit(text, selectedFiles);
    } catch (err) {
      setError("Při odesílání zprávy došlo k chybě.");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      e.currentTarget.form?.requestSubmit();
    }
  };

  const isActive =
    status === "needs_revision" ||
    ((status === "not_started" || status === "in_progress") && !isLimitReached);

  return (
    <>
      <ErrorDialog
        error={error}
        onClose={() => setError(null)}
        title="Nahrávání obrázku"
      />

      <div className="p-2 bg-card shrink-0">
        {!isActive ? (
          <div className="p-4 md:p-6 text-center text-sm md:text-base text-muted-foreground bg-muted/50 rounded-2xl border border-dashed border-border/60">
            {status === "finished"
              ? "Úkol byl ohodnocen a uzavřen učitelem."
              : isLimitReached
                ? "Dosáhl jsi maximálního počtu zpráv. Učitel se na tvou práci brzy podívá."
                : "Úkol byl odevzdán a čeká na kontrolu od učitele."}
          </div>
        ) : (
          <form
            onSubmit={submitForm}
            className="flex flex-col w-full bg-muted/40 border border-border rounded-2xl p-2 md:p-3 focus-within:ring-1 focus-within:ring-primary/80 transition-shadow"
          >
            {previewUrl && (
              <div className="mt-2 mb-2 px-2">
                <div className="relative inline-block">
                  <Image
                    src={previewUrl}
                    alt="Náhled"
                    width={80}
                    height={80}
                    unoptimized
                    className="h-20 w-auto rounded-lg object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 rounded-full p-1 bg-gray-100 border hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-700" />
                  </button>
                </div>
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={input}
              maxLength={2500}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Napsat zprávu..."
              className="w-full resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-[16px] md:text-base px-2 py-1 max-h-32 md:max-h-48 overflow-y-auto custom-scrollbar"
            />
            <div className="flex items-center justify-between mt-2">
              <div>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 w-10 md:h-12 md:w-12 rounded-full shrink-0 text-muted-foreground hover:text-primary hover:bg-muted"
                >
                  <Paperclip className="w-5 h-5 md:w-6 md:h-6" />
                </Button>
              </div>
              <Button
                type="submit"
                disabled={(!input.trim() && !files) || isSubmitting}
                className="h-10 w-10 md:h-12 md:w-12 rounded-full shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5 ml-0.5" />
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
