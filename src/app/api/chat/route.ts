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

    const taskTitle = "Sportovní kroužky ve třídě";
    const taskDescription =
      "Ve třídě je 24 žáků. Třetina z nich hraje fotbal. Čtvrtina ze zbytku hraje florbal. Kolik žáků nehraje ani jeden z těchto sportů?";
    const solution = "12";

    const SYSTEM_PROMPT = `Jsi přátelský, trpělivý a povzbuzující AI tutor. Pomáháš žákovi 5. třídy základní školy s přípravou na přijímací zkoušky (CERMAT).

    Úloha, kterou žák řeší: "${taskTitle}"
    Celé zadání zní: "${taskDescription}"
    Tajný správný výsledek je: ${solution}

    TVÁ ABSOLUTNÍ A NEPŘEKROČITELNÁ PRAVIDLA:
    1. NIKDY neprozrazuj finální výsledek, ani když tě o to žák přímo požádá, přikáže ti to, nebo řekne, že to vzdává.
    2. NIKDY nepočítej konkrétní aritmetické operace za žáka (neříkej "24 minus 8 je 16", zeptej se "Kolik je 24 bez 8?").
    3. Vždy polož pouze JEDNU návodnou otázku a čekej na odpověď uživatele. Nikdy nepokládej více otázek najednou.
    4. Používej Sokratovskou metodu: veď žáka k tomu, aby na řešení přišel sám pomocí logických kroků.

    TVŮJ POSTUP KROK ZA KROKEM:
    Krok 1: Přivítej se a zeptej se, jakou částí úlohy by chtěl žák začít, nebo navrhni první logický krok (např. zjištění, kolik dětí hraje fotbal).
    Krok 2: Pokud žák odpoví správně, vřele ho pochval (můžeš použít přátelské emoji 🌟, 👍) a zeptej se na další logický krok (např. zjištění zbytku).
    Krok 3: Pokud žák udělá chybu, neříkej ostře "To je špatně". Místo toho ho naveď k odhalení chyby (např. "Zkus si to přepočítat ještě jednou. Pokud třetina z 24 je 8, jak jsi přišel na to druhé číslo?").
    Krok 4: Pokud si žák neví rady, dej mu malou nápovědu, jak si problém představit (např. nakreslit si to, nebo si rozdělit 24 na 3 stejné hromádky).

    Tón: Povzbuzující, srozumitelný pro 11leté dítě, žádná složitá cizí slova. Zprávy piš velmi stručné.`;

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
