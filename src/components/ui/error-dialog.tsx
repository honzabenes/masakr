"use client";

import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ErrorDialogProps {
  error: string | null;
  onClose: () => void;
  title?: string;
}

export function ErrorDialog({
  error,
  onClose,
  title = "Chyba",
}: ErrorDialogProps) {
  useEffect(() => {
    if (!error) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [error, onClose]);

  if (!error) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="error-dialog-title"
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl bg-card border border-border p-6 shadow-lg flex flex-col gap-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Zavřít upozornění"
          className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="rounded-full bg-destructive/10 p-2.5 text-destructive shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex flex-col gap-1 pr-6">
            <h3
              id="error-dialog-title"
              className="text-base font-semibold text-foreground"
            >
              {title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {error}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
