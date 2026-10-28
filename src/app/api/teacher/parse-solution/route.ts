import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/services/auth";
import { getUserRole } from "@/lib/services/users";

const MAX_BASE64_LENGTH = 5 * 1024 * 1024;

const RequestBodySchema = z.object({
  imageBase64: z
    .string()
    .min(1)
    .max(MAX_BASE64_LENGTH, "Obrázek překračuje povolenou velikost.")
    .refine(
      (val) => /^data:image\/(jpeg|png|webp);base64,/.test(val),
      "Nepodporovaný formát obrázku.",
    ),
  taskDescription: z.string().optional(),
});

const SolutionParseSchema = z.object({
  is_legible: z
    .boolean()
    .describe("Je ručně psané řešení plně čitelné a matematicky jednoznačné?"),
  unclear_parts: z
    .string()
    .nullable()
    .describe(
      "Pokud je některá část hůře čitelná nebo nejednoznačná, popiš učiteli přesně kde (např. 'Na 2. řádku není jasné, zda jde o číslo 4 nebo 9'). Jinak null.",
    ),
  step_by_step_solution: z
    .string()
    .describe(
      "Přehledný přepis celého postupu řešení krok za krokem v Markdownu. Pro matematické výrazy používej LaTeX ($...$ pro inline a $$...$$ pro samostatné řádky).",
    ),
  suggested_pedagogical_notes: z
    .string()
    .nullable()
    .describe(
      "Krátké doporučení pro AI sokratovského lektora: na jaké typické chyby žáků ZŠ si dát v této úloze pozor.",
    ),
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser(supabase);

    if (!user) {
      return Response.json(
        { error: "Nepřihlášený uživatel." },
        { status: 401 },
      );
    }

    const role = await getUserRole(supabase, user.id);
    if (role !== "teacher") {
      return Response.json({ error: "Přístup odepřen." }, { status: 403 });
    }

    const rawBody = await req.json();
    const parsedBody = RequestBodySchema.safeParse(rawBody);

    if (!parsedBody.success) {
      return Response.json(
        { error: "Neplatná vstupní data nebo formát obrázku." },
        { status: 400 },
      );
    }

    const { imageBase64, taskDescription } = parsedBody.data;

    const contextPrompt = taskDescription?.trim()
      ? `Kontext zadání úlohy: "${taskDescription.trim()}".\n\n`
      : "";

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: SolutionParseSchema,
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${contextPrompt}Jsi odborný asistent učitele matematiky na základní škole.
Přepiš přiložené ručně psané vzorové řešení do čistého, strukturovaného textu (Markdown + LaTeX).
Pravidla přepisu:
1. Zachovej všechny logické kroky a mezivýpočty učitele.
2. Vzorce, zlomky a rovnice zapisuj do LaTeXu ($inline$ nebo $$blok$$).
3. Na závěr jasně zvýrazni konečný výsledek.
4. Pokud je cokoliv nečitelné, nastav is_legible na false a popiš problém v unclear_parts.`,
            },
            {
              type: "image",
              image: imageBase64,
            },
          ],
        },
      ],
    });

    return Response.json(object);
  } catch (error) {
    console.error("[PARSE_SOLUTION_API_ERROR]", error);
    return Response.json(
      { error: "Nepodařilo se zpracovat obrázek vzorového řešení." },
      { status: 500 },
    );
  }
}
