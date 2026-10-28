"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Wand2,
  Loader2,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Code2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createTaskAction } from "@/app/actions/tasks";
import { cn } from "@/lib/utils";

const AVAILABLE_GRADES = [
  { value: "5", label: "5" },
  { value: "7", label: "7" },
  { value: "9", label: "9" },
] as const;

const LATEX_SNIPPETS = [
  { label: "Zlomek", snippet: "\\frac{a}{b}" },
  { label: "Odmocnina", snippet: "\\sqrt{x}" },
  { label: "Mocnina", snippet: "x^{2}" },
  { label: "Násobení", snippet: "\\cdot " },
  { label: "Rovnice (blok)", snippet: "\n$$\n\n$$\n" },
];

/**
 * Zmenší a zkomprimuje obrázek na klientovi před posláním do OCR API,
 * aby nedocházelo k přetížení requestu u 12Mpx fotek z telefonu.
 */
async function compressImageToBase64(
  file: File,
  maxDim = 1600,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context není dostupný."));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Nepodařilo se načíst obrázek."));
    };

    img.src = objectUrl;
  });
}

export default function CreateTaskPage() {
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  // Stavy formuláře
  const [selectedGrades, setSelectedGrades] = useState<string[]>(["5"]);
  const [description, setDescription] = useState("");
  const [solutionText, setSolutionText] = useState("");
  const [pedagogicalNotes, setPedagogicalNotes] = useState("");
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");

  // Náhledy obrázků a AI OCR stav
  const [taskImagePreview, setTaskImagePreview] = useState<string | null>(null);
  const [solutionImagePreview, setSolutionImagePreview] = useState<
    string | null
  >(null);
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrWarning, setOcrWarning] = useState<string | null>(null);

  const taskFileInputRef = useRef<HTMLInputElement>(null);
  const solutionFileInputRef = useRef<HTMLInputElement>(null);
  const solutionTextareaRef = useRef<HTMLTextAreaElement>(null);

  const toggleGrade = (grade: string) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade],
    );
  };

  const handleTaskImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (taskImagePreview) URL.revokeObjectURL(taskImagePreview);

    if (!file) {
      setTaskImagePreview(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Obrázek zadání je příliš velký (max. 5 MB).");
      e.target.value = "";
      setTaskImagePreview(null);
      return;
    }

    setFormError(null);
    setTaskImagePreview(URL.createObjectURL(file));
  };

  const clearTaskImage = () => {
    if (taskImagePreview) URL.revokeObjectURL(taskImagePreview);
    setTaskImagePreview(null);
    if (taskFileInputRef.current) taskFileInputRef.current.value = "";
  };

  const handleSolutionImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (solutionImagePreview) URL.revokeObjectURL(solutionImagePreview);

    if (!file) {
      setSolutionImagePreview(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Fotka vzorového řešení je příliš velká (max. 5 MB).");
      e.target.value = "";
      setSolutionImagePreview(null);
      return;
    }

    setFormError(null);
    setOcrWarning(null);
    setSolutionImagePreview(URL.createObjectURL(file));
    setIsScanningOcr(true);

    try {
      const compressedBase64 = await compressImageToBase64(file);

      const response = await fetch("/api/teacher/parse-solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: compressedBase64,
          taskDescription: description,
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
      setFormError(
        err instanceof Error
          ? err.message
          : "Nepodařilo se automaticky přepsat fotku řešení.",
      );
    } finally {
      setIsScanningOcr(false);
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    if (selectedGrades.length === 0) {
      setFormError("Vyberte alespoň jeden ročník.");
      return;
    }

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createTaskAction(formData);
      if (result?.error) {
        setFormError(result.error);
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-12 mt-4">
      {formError && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* BASIC INFORMATION */}
        <Card>
          <CardHeader>
            <CardTitle className="font-semibold">Základní informace</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-5 text-gray-600">
            {/* TASK NUMBER */}
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

            {/* TASK GRADE SELECTION */}
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

            {/* TASK DEADLINE */}
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
                onChange={(e) => setDescription(e.target.value)}
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
                  className="py-10 border-border text-gray-600 hover:text-primary hover:bg-primary/10 hover:border-primary/40"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Vybrat soubor
                </Button>
              ) : (
                <div className="relative inline-flex items-center gap-3 p-2 border rounded-lg bg-muted/30 w-fit">
                  <Image
                    src={taskImagePreview}
                    alt="Náhled zadání"
                    width={64}
                    height={64}
                    unoptimized
                    className="h-16 w-auto rounded object-cover border"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={clearTaskImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* MODEL SOLUTION */}
        <Card className="ring-1 ring-border mt-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 font-semibold">
                  <span>Vzorové řešení</span>
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            {/* PHOTO UPLOAD FOR AI OCR */}
            <div className="p-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium flex items-center gap-2 text-primary">
                  <Wand2 className="h-4 w-4" />
                  Automatický přepis z fotky papíru
                </span>
                <span className="text-xs text-muted-foreground">
                  Nahrajte vyfocený postup. AI řešení přečte a předvyplní editor
                  níže.
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <input
                  ref={solutionFileInputRef}
                  type="file"
                  name="solution_image"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleSolutionImageChange}
                  disabled={isScanningOcr}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isScanningOcr}
                  onClick={() => solutionFileInputRef.current?.click()}
                >
                  {isScanningOcr ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Přepisuji do LaTeXu...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Vybrat fotku řešení
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* NÁHLED FOTKY ŘEŠENÍ A VAROVÁNÍ ČITELNOSTI */}
            {solutionImagePreview && (
              <div className="flex flex-col sm:flex-row items-start gap-4 p-3 rounded-lg border bg-muted/20">
                <div className="relative shrink-0">
                  <Image
                    src={solutionImagePreview}
                    alt="Fotka vzorového řešení"
                    width={120}
                    height={120}
                    unoptimized
                    className="h-28 w-auto rounded-md object-contain border bg-white"
                  />
                  <button
                    type="button"
                    onClick={clearSolutionImage}
                    className="absolute -top-2 -right-2 rounded-full p-1 bg-card border shadow-xs hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>

                <div className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium">
                    Originální fotka řešení bude uložena v privátním úložišti.
                  </span>
                  {ocrWarning ? (
                    <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{ocrWarning}</span>
                    </div>
                  ) : (
                    !isScanningOcr && (
                      <span className="text-xs text-muted-foreground">
                        Zkontrolujte a případně upravte vygenerovaný LaTeX
                        přepis v editoru níže.
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {/* INTEGROVANÝ EDITOR ŘEŠENÍ (WRITE / PREVIEW + LATEX TOOLBAR) */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="solution_text" className="text-sm font-medium">
                  Strukturované vzorové řešení (Markdown / LaTeX){" "}
                </label>

                <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                  <button
                    type="button"
                    onClick={() => setEditorTab("write")}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium",
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
                      "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium",
                      editorTab === "preview"
                        ? "bg-card text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Náhled struktury
                  </button>
                </div>
              </div>

              {/* RYCHLÁ TLAČÍTKA PRO LATEX */}
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

              {/* TEXTAREA JE VŽDY V DOMU (KVŮLI FORMDATA), PŘI NÁHLEDU SE SKRYJE */}
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

              {editorTab === "preview" && (
                <div className="min-h-55 w-full rounded-md border border-border bg-muted/20 p-4 text-sm whitespace-pre-wrap leading-relaxed">
                  {solutionText.trim() ? (
                    solutionText
                  ) : (
                    <span className="text-muted-foreground italic">
                      Zatím nebyl zadán žádný text řešení...
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* PEDAGOGICKÉ POZNÁMKY PRO AI */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="pedagogical_notes"
                className="text-sm font-medium"
              >
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

        {/* SPODNÍ LIŠTA: PUBLIKACE A ODESLÁNÍ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-card">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                Ihned publikovat studentům
              </span>
              <span className="text-xs text-muted-foreground">
                Pokud není zaškrtnuto, úloha se uloží pouze jako skrytý koncept.
              </span>
            </div>
          </label>

          <div className="flex items-center gap-3 justify-end">
            <Link href="/tasks">
              <Button type="button" variant="outline" disabled={isPending}>
                Zrušit
              </Button>
            </Link>
            <Button type="submit" disabled={isPending || isScanningOcr}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Ukládám úlohu...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Vytvořit úlohu
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
