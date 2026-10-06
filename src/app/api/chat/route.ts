import {
  streamText,
  UIMessage,
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
} from "ai";
import { openai } from "@ai-sdk/openai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, data }: { messages: UIMessage[]; data?: any } = body;

    const taskTitle = data?.taskTitle ?? "Sčítání zlomků: 1/3 + 1/4";
    const solution = data?.solution ?? "7/12";

    const SYSTEM_PROMPT = `Jsi přátelský AI tutor pro děti. Tvým úkolem je pomoci uživateli vyřešit tento úkol: ${taskTitle}. Správný výsledek je ${solution}, ale TEN ZA ŽÁDNOU CENU NESMÍŠ PROZRADIT. Místo toho se ptej Sokratovskou metodou a veď uživatele krok za krokem k řešení.`;

    const result = streamText({
      model: openai("gpt-4o"),
      system: SYSTEM_PROMPT,
      messages: await convertToModelMessages(messages),
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
  } catch (error) {
    console.error("[CHAT_API_ERROR]", error);

    return new Response(
      JSON.stringify({
        error: "Nastala neočekávaná chyba při komunikaci s AI tutorem.",
        details: error instanceof Error ? error.message : "Neznámá chyba",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
