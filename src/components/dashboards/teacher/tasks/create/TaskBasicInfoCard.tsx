"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { validateImageFile } from "@/lib/utils/image";
import { cn } from "@/lib/utils";

const AVAILABLE_GRADES = [
  { value: "5", label: "5" },
  { value: "7", label: "7" },
  { value: "9", label: "9" },
] as const;

export type PublishMode = "immediate" | "scheduled";

interface TaskBasicInfoCardProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  onError: (message: string | null) => void;
}

export default function TaskBasicInfoCard({
  description,
  onDescriptionChange,
  onError,
}: TaskBasicInfoCardProps) {
  const [selectedGrades, setSelectedGrades] = useState<string[]>(["5"]);
  const [publishMode, setPublishMode] = useState<PublishMode>("immediate");
  const [taskImagePreview, setTaskImagePreview] = useState<string | null>(null);
  const taskFileInputRef = useRef<HTMLInputElement>(null);

  const toggleGrade = (grade: string) => {
    setSelectedGrades((prev) => {
      if (prev.includes(grade)) {
        if (prev.length <= 1) return prev;
        return prev.filter((g) => g !== grade);
      }
      return [...prev, grade];
    });
  };

  const handleTaskImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (taskImagePreview) URL.revokeObjectURL(taskImagePreview);

    if (!file) {
      setTaskImagePreview(null);
      return;
    }

    const validationError = validateImageFile(file, "Obrázek zadání");
    if (validationError) {
      onError(validationError);
      e.target.value = "";
      setTaskImagePreview(null);
      return;
    }

    onError(null);
    setTaskImagePreview(URL.createObjectURL(file));
  };

  const clearTaskImage = () => {
    if (taskImagePreview) URL.revokeObjectURL(taskImagePreview);
    setTaskImagePreview(null);
    if (taskFileInputRef.current) taskFileInputRef.current.value = "";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-semibold">Základní informace</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 text-gray-600">
        {/* TASK NUMBER*/}
        <div className="flex flex-col gap-1.5 max-w-75">
          <label htmlFor="task_number" className="text-sm font-medium">
            Číslo úlohy
          </label>
          <Input
            id="task_number"
            name="task_number"
            required
            type="number"
            min={1}
            placeholder="Např. 101"
          />
        </div>

        {/* TASK TITLE */}
        <div className="flex flex-col gap-1.5 max-w-100">
          <label htmlFor="title" className="text-sm font-medium">
            Název úlohy
          </label>
          <Input
            id="title"
            name="title"
            required
            placeholder="Např. Přítok a odtok nádrže"
          />
        </div>

        {/* GRADE SELECTION */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Určeno pro ročníky</span>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_GRADES.map((grade) => {
              const isSelected = selectedGrades.includes(grade.value);
              return (
                <label
                  key={grade.value}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md border text-sm font-medium cursor-pointer select-none",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-background text-foreground border-border hover:bg-accent",
                  )}
                >
                  <input
                    type="checkbox"
                    name="grade_levels"
                    value={grade.value}
                    checked={isSelected}
                    onChange={() => toggleGrade(grade.value)}
                    className="sr-only"
                  />
                  <span>{grade.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* PUBLICATION */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium">Publikace úlohy</span>
          <input type="hidden" name="publish_mode" value={publishMode} />
          <input
            type="hidden"
            name="is_published"
            value={publishMode === "immediate" ? "on" : "off"}
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPublishMode("immediate")}
              className={cn(
                "px-4 py-2 rounded-md border text-sm font-medium cursor-pointer",
                publishMode === "immediate"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background text-foreground border-border hover:bg-accent",
              )}
            >
              Ihned
            </button>
            <button
              type="button"
              onClick={() => setPublishMode("scheduled")}
              className={cn(
                "px-4 py-2 rounded-md border text-sm font-medium cursor-pointer",
                publishMode === "scheduled"
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-background text-foreground border-border hover:bg-accent",
              )}
            >
              Naplánovat
            </button>
          </div>

          {publishMode === "scheduled" && (
            <div className="flex flex-col gap-1.5 max-w-75 pt-1">
              <label
                htmlFor="publish_at"
                className="text-xs text-muted-foreground"
              >
                Datum a čas publikace
              </label>
              <Input
                id="publish_at"
                name="publish_at"
                type="datetime-local"
                required
              />
            </div>
          )}
        </div>

        {/* DUE DATE */}
        <div className="flex flex-col gap-2 max-w-75">
          <label htmlFor="due_date" className="text-sm font-medium">
            Termín odevzdání
          </label>
          <Input id="due_date" name="due_date" type="datetime-local" />
        </div>

        {/* TASK DESCRIPTION */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-medium">
            Text zadání úlohy
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Zadejte plné znění matematické úlohy..."
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>

        {/* TASK IMAGE */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">
            Obrázek k zadání (volitelné)
          </label>
          <input
            ref={taskFileInputRef}
            type="file"
            name="task_image"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleTaskImageChange}
            className="hidden"
          />
          {!taskImagePreview ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => taskFileInputRef.current?.click()}
              className="py-8 max-w-80 border-border text-gray-600 hover:text-primary hover:bg-primary/10 hover:border-primary/40"
            >
              <Upload className="h-4 w-4 mr-2" />
              Vybrat soubor
            </Button>
          ) : (
            <div className="relative inline-block w-fit mt-1">
              <Image
                src={taskImagePreview}
                alt="Náhled zadání"
                width={160}
                height={160}
                unoptimized
                className="h-28 w-auto rounded-md object-contain"
              />
              <button
                type="button"
                onClick={clearTaskImage}
                aria-label="Odstranit obrázek zadání"
                className="absolute -top-2 -right-2 rounded-full p-1 bg-card border border-border shadow-xs hover:bg-muted cursor-pointer"
              >
                <X className="h-3.5 w-3.5 text-foreground" />
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
