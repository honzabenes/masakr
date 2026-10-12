"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Send, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConversationStatus } from "@/types";

export interface ChatInputAreaProps {
  status: ConversationStatus;
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (text: string, files?: FileList) => Promise<void>;
  isSubmitting: boolean;
}

export default function ChatInputArea({
  status,
  input,
  onInputChange,
  onSubmit,
  isSubmitting,
}: ChatInputAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<FileList | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const file = fileList[0];

    if (!file.type.startsWith("image/")) {
      alert("Lze nahrávat pouze obrázky.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Obrázek je příliš velký (max 5 MB).");
      e.target.value = "";
      return;
    }

    const copiedFiles = new DataTransfer();
    for (const selectedFile of fileList) {
      copiedFiles.items.add(selectedFile);
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFiles(copiedFiles.files);
    setPreviewUrl(URL.createObjectURL(file));
    e.target.value = "";
  };

  const clearImage = () => {
    setFiles(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const submitForm = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if ((!input.trim() && !files) || isSubmitting) return;

    const text = input.trim();
    const selectedFiles = files ?? undefined;

    onInputChange("");
    clearImage();
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    await onSubmit(text, selectedFiles);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      form?.requestSubmit();
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
        <form
          onSubmit={submitForm}
          className="flex flex-col w-full bg-muted/40 border border-border rounded-2xl p-2 md:p-3 focus-within:ring-1 focus-within:ring-primary/80 transition-shadow"
        >
          {/* IMAGE PREVIEW */}
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
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Napsat zprávu..."
            className="w-full resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-[16px] md:text-base px-2 py-1 max-h-32 md:max-h-48 overflow-y-auto"
          />

          <div className="flex items-center justify-between mt-2">
            <div>
              <input
                type="file"
                accept="image/*"
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
  );
}
