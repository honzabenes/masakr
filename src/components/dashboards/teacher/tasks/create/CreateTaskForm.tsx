"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createTaskAction } from "@/app/actions/tasks";
import TaskBasicInfoCard from "./TaskBasicInfoCard";
import TaskSolutionCard from "./TaskSolutionCard";
import { ErrorDialog } from "@/components/ui/error-dialog";

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
    <>
      <ErrorDialog
        error={formError}
        onClose={() => setFormError(null)}
        title="Chyba při zpracování"
      />

      <div className="flex flex-col gap-6 pb-12">
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
    </>
  );
}
