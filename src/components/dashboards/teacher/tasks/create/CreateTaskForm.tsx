"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertTriangle, Loader2, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTaskAction } from "@/app/actions/tasks";
import TaskBasicInfoCard from "./TaskBasicInfoCard";
import TaskSolutionCard from "./TaskSolutionCard";

export default function CreateTaskForm() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isScanningOcr, setIsScanningOcr] = useState(false);

  useEffect(() => {
    if (!formError) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFormError(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [formError]);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createTaskAction(formData);
      if (result?.error) {
        setFormError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* ERROR DIALOG */}
      {formError && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="error-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setFormError(null)}
        >
          <div
            className="relative w-full max-w-md rounded-xl bg-card border border-border p-6 shadow-lg flex flex-col gap-4 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setFormError(null)}
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
                  Chyba při zpracování
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {formError}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <TaskBasicInfoCard
          description={description}
          onDescriptionChange={setDescription}
          onError={setFormError}
        />

        <TaskSolutionCard
          taskDescription={description}
          isScanningOcr={isScanningOcr}
          onScanningChange={setIsScanningOcr}
          onError={setFormError}
        />

        <div className="flex items-center justify-end gap-3 p-2 rounded-xl">
          <Button
            type="submit"
            disabled={isPending || isScanningOcr}
            className="py-6 px-4"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ukládám úlohu...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Vytvořit úlohu
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
