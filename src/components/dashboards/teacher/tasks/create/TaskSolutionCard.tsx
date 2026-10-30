"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Wand2, Loader2, X, AlertTriangle, Eye, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import LatexPreview from "./LatexPreview";
import { compressImageToBase64, validateImageFile } from "@/lib/utils/image";
import { cn } from "@/lib/utils";

const LATEX_SNIPPETS = [
  { label: "Zlomek", snippet: "\\frac{a}{b}" },
  { label: "Odmocnina", snippet: "\\sqrt{x}" },
  { label: "Mocnina", snippet: "x^{2}" },
  { label: "Násobení", snippet: "\\cdot " },
  { label: "Rovnice (blok)", snippet: "\n$$\n\n$$\n" },
];

interface TaskSolutionCardProps {
  taskDescription: string;
  isScanningOcr: boolean;
  onScanningChange: (scanning: boolean) => void;
  onError: (message: string | null) => void;
}

export default function TaskSolutionCard({
  taskDescription,
  isScanningOcr,
  onScanningChange,
  onError,
}: TaskSolutionCardProps) {
  const [solutionText, setSolutionText] = useState("");
  const [pedagogicalNotes, setPedagogicalNotes] = useState("");
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");
  const [solutionImagePreview, setSolutionImagePreview] = useState<
    string | null
  >(null);
  const [ocrWarning, setOcrWarning] = useState<string | null>(null);

  const solutionFileInputRef = useRef<HTMLInputElement>(null);
  const solutionTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSolutionImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (solutionImagePreview) URL.revokeObjectURL(solutionImagePreview);

    if (!file) {
      setSolutionImagePreview(null);
      return;
    }

    const validationError = validateImageFile(file, "Fotka vzorového řešení");
    if (validationError) {
      onError(validationError);
      e.target.value = "";
      setSolutionImagePreview(null);
      return;
    }

    onError(null);
    setOcrWarning(null);
    setSolutionImagePreview(URL.createObjectURL(file));
    onScanningChange(true);

    try {
      const compressedBase64 = await compressImageToBase64(file);

      const response = await fetch("/api/teacher/parse-solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: compressedBase64,
          taskDescription,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Chyba při komunikaci s AI OCR.");
      }

      if (result.step_by_step_solution) {
        setSolutionText(result.step_by_step_solution);
      }

      if (result.suggested_pedagogical_notes && !pedagogicalNotes.trim()) {
        setPedagogicalNotes(result.suggested_pedagogical_notes);
      }

      if (!result.is_legible || result.unclear_parts) {
        setOcrWarning(
          result.unclear_parts ??
            "Některé části rukopisu byly hůře čitelné. Zkontrolujte prosím vygenerovaný přepis.",
        );
      }
    } catch (err) {
      onError(
        err instanceof Error
          ? err.message
          : "Nepodařilo se automaticky přepsat fotku řešení.",
      );
    } finally {
      onScanningChange(false);
    }
  };

  const clearSolutionImage = () => {
    if (solutionImagePreview) URL.revokeObjectURL(solutionImagePreview);
    setSolutionImagePreview(null);
    setOcrWarning(null);
    if (solutionFileInputRef.current) solutionFileInputRef.current.value = "";
  };

  const insertLatexSnippet = (snippet: string) => {
    const textarea = solutionTextareaRef.current;
    if (!textarea) {
      setSolutionText((prev) => prev + snippet);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const updated =
      solutionText.substring(0, start) + snippet + solutionText.substring(end);

    setSolutionText(updated);
    setEditorTab("write");

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPosition = start + snippet.length;
      textarea.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  return (
    <Card className="ring ring-border">
      <CardHeader>
        <CardTitle className="font-semibold">Vzorové řešení</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        <input
          ref={solutionFileInputRef}
          type="file"
          name="solution_image"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleSolutionImageChange}
          disabled={isScanningOcr}
          className="hidden"
        />

        <div
          role="button"
          tabIndex={isScanningOcr ? -1 : 0}
          onClick={() =>
            !isScanningOcr && solutionFileInputRef.current?.click()
          }
          onKeyDown={(e) => {
            if (!isScanningOcr && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              solutionFileInputRef.current?.click();
            }
          }}
          className={cn(
            "w-full p-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 flex flex-col items-center justify-center text-center gap-1.5 select-none",
            isScanningOcr
              ? "opacity-70 cursor-not-allowed"
              : "cursor-pointer hover:bg-primary/10 hover:border-primary/60",
          )}
        >
          {isScanningOcr ? (
            <>
              <Loader2 className="h-5 w-5 text-primary animate-spin mb-1" />
              <span className="text-sm font-medium text-primary">
                Přepisuji do LaTeXu...
              </span>
              <span className="text-xs text-muted-foreground">
                AI právě čte a formátuje vyfocený rukopis.
              </span>
            </>
          ) : (
            <>
              <span className="text-sm font-medium flex items-center justify-center gap-2 text-primary">
                <Wand2 className="h-4 w-4 shrink-0" />
                Automatický přepis z fotky papíru
              </span>
              <span className="text-xs text-muted-foreground max-w-md">
                Nahrajte vyfocený postup. AI řešení přečte a předvyplní editor
                níže.
              </span>
            </>
          )}
        </div>

        {/* IMAGE PREVIEW AND WARNINGS */}
        {solutionImagePreview && (
          <div className="flex flex-col sm:flex-row items-start gap-4 p-3 rounded-lg border bg-muted/20">
            <div className="relative shrink-0">
              <Image
                src={solutionImagePreview}
                alt="Fotka vzorového řešení"
                width={120}
                height={120}
                unoptimized
                className="h-28 w-auto rounded-md object-contain"
              />
              <button
                type="button"
                onClick={clearSolutionImage}
                aria-label="Odstranit fotku řešení"
                className="absolute -top-2 -right-2 rounded-full p-1 bg-card border border-border shadow-xs hover:bg-muted cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="flex flex-col gap-1.5 text-sm">
              {ocrWarning ? (
                <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{ocrWarning}</span>
                </div>
              ) : (
                !isScanningOcr && (
                  <span className="text-xs text-muted-foreground">
                    Zkontrolujte a případně upravte vygenerovaný LaTeX přepis v
                    editoru níže.
                  </span>
                )
              )}
            </div>
          </div>
        )}

        {/* EDITOR */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="solution_text" className="text-sm font-medium">
              Strukturované vzorové řešení (Markdown / LaTeX)
            </label>

            <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
              <button
                type="button"
                onClick={() => setEditorTab("write")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium cursor-pointer",
                  editorTab === "write"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Code2 className="h-3.5 w-3.5" />
                Editor
              </button>
              <button
                type="button"
                onClick={() => setEditorTab("preview")}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium cursor-pointer",
                  editorTab === "preview"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Eye className="h-3.5 w-3.5" />
                Náhled
              </button>
            </div>
          </div>

          {/* LATEX BUTTONS */}
          <div className="flex flex-wrap items-center gap-1.5 py-1">
            <span className="text-xs text-muted-foreground mr-1">
              Vložit LaTeX:
            </span>
            {LATEX_SNIPPETS.map((item) => (
              <Button
                key={item.label}
                type="button"
                variant="outline"
                size="xs"
                onClick={() => insertLatexSnippet(item.snippet)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <textarea
            ref={solutionTextareaRef}
            id="solution_text"
            name="solution_text"
            required
            rows={10}
            value={solutionText}
            onChange={(e) => setSolutionText(e.target.value)}
            placeholder="Zapište nebo nechte pomocí AI vygenerovat postup řešení krok za krokem..."
            className={cn(
              "w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              editorTab === "preview" && "hidden",
            )}
          />

          {editorTab === "preview" && <LatexPreview content={solutionText} />}
        </div>

        {/* NOTES FOR AI */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="pedagogical_notes" className="text-sm font-medium">
            Pedagogické poznámky pro AI lektora (volitelné)
          </label>
          <Input
            id="pedagogical_notes"
            name="pedagogical_notes"
            value={pedagogicalNotes}
            onChange={(e) => setPedagogicalNotes(e.target.value)}
            placeholder="Např. Děti často zapomínají převést minuty na hodiny. Naveď je nejprve na sjednocení jednotek."
          />
        </div>
      </CardContent>
    </Card>
  );
}
