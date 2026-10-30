"use client";

import { useState, useTransition } from "react";
import { AlertTriangle, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTaskAction } from "@/app/actions/tasks";
import TaskBasicInfoCard from "./TaskBasicInfoCard";
import TaskSolutionCard from "./TaskSolutionCard";

export default function CreateTaskForm() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isScanningOcr, setIsScanningOcr] = useState(false);

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
      {formError && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
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
