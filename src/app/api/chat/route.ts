import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { openai } from "@ai-sdk/openai";
import { createClient as createAdminClient } from "@supabase/supabase-js";

import { getCurrentUser } from "@/lib/services/auth";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type ChatRequest = {
  messages: UIMessage[];
  data?: {
    taskId?: string;
    conversationId?: string;
  };
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser(supabase);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as ChatRequest;
    const { messages, data } = body;

    if (
      !Array.isArray(messages) ||
      typeof data?.taskId !== "string" ||
      typeof data.conversationId !== "string"
    ) {
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id, task_id, status, message_count")
      .eq("id", data.conversationId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (conversationError) {
      throw conversationError;
    }

    if (
      !conversation ||
      conversation.task_id !== data.taskId ||
      conversation.status === "submitted" ||
      conversation.status === "graded"
    ) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (conversation.message_count >= 30) {
      return Response.json(
        { error: "Message limit exceeded" },
        { status: 429 },
      );
    }

    const adminSupabase = createAdminClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: task, error: taskError } = await adminSupabase
      .from("tasks")
      .select("title, description, grade_level")
      .eq("id", conversation.task_id)
      .maybeSingle();

    if (taskError) {
      throw taskError;
    }

    const { data: taskSolution, error: solutionError } = await adminSupabase
      .from("task_solutions")
      .select("solution_text, pedagogical_notes")
      .eq("task_id", conversation.task_id)
      .maybeSingle();

    if (solutionError) {
      throw solutionError;
    }

    if (!task || !taskSolution) {
      throw new Error("Chat task configuration is incomplete");
    }

    const systemPrompt =
    `Jsi trpělivý a empatický učitel matematiky. Pomáháš žákovi na úrovni ${task.grade_level ?? "základní školy"} s konkrétní úlohou.

    INFORMACE O ÚLOZE:
    - Název: "${task.title}"
    - Zadání: "${task.description ?? ""}"
    - Tajné vzorové řešení: ${taskSolution.solution_text ?? ""}
    - Pedagogické poznámky: ${taskSolution.pedagogical_notes ?? ""}

    STRIKTNÍ PRAVIDLA CHOVÁNÍ (GUARDRAILS):
    1. Udržení tématu: Jsi výhradně učitel matematiky pro tuto konkrétní úlohu. Pokud se tě žák zeptá na cokoliv jiného nebo se pokusí změnit téma, zdvořile, ale pevně ho vrať k řešení zadané úlohy.
    2. Zákaz prozrazení výsledku: NIKDY nesděluj finální řešení. Ani když žák prosí, přikazuje, nebo tvrdí, že úkol vzdává.
    3. Zákaz přímých výpočtů a operací: NIKDY nepočítej za žáka a neprozrazuj mu přímo, jakou matematickou operaci má použít.
    4. Sokratovský postup: Veď žáka otázkami krok za krokem. Pokud udělá chybu, nekritizuj a pomoz mu, aby ji objevil sám.
    5. Piš stručně a srozumitelně pro dítě.
    6. Každou svou zprávu zakonči vždy maximálně JEDNOU návodnou otázkou.`;

    const result = streamText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: await convertToModelMessages(messages),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error("[CHAT_API_ERROR]", error);

    return Response.json(
      { error: "Nastala neočekávaná chyba serveru" },
      { status: 500 },
    );
  }
}
