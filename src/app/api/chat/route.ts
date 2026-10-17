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
    const { messages } = (await req.json()) as { messages: UIMessage[] };

    const taskTitle = "Přítok a odtok";
    const taskDescription =
      "Nádrž na vodu má přítok, který prázdnou dokáže naplnit za 20 hodin. Odtok nádrže naopak plnou nádrž vypustí za 24 hodin. Nádrž je nyní naplněna ze tří čtvrtin. Za jak dlouho bude nádrž plná, bude-li současně otevřen přítok i odtok?";
    const solution = `
      **Formalizace zadání:**
      * Čas naplnění prázdné nádrže přítokem: $t_1 = 20 \text{ h}$
      * Čas vypuštění plné nádrže odtokem: $t_2 = 24 \text{ h}$
      * Počáteční stav nádrže: $V_0 = \frac{3}{4}$ (vyjádřeno jako poměr celkového objemu)
      * Cílový stav nádrže: $V_{cil} = 1$

      ## Řešení

      ### 1. Rychlost přítoku a odtoku
      Rychlost přítoku $v_1$ a rychlost odtoku $v_2$ vyjádříme jako část objemu nádrže, která se naplní (případně vyprázdní) za jednu hodinu:
      $$v_1 = \frac{1}{20} \text{ h}^{-1}$$
      $$v_2 = \frac{1}{24} \text{ h}^{-1}$$

      ### 2. Výsledná rychlost plnění
      Při současném otevření přítoku i odtoku je celková rychlost plnění $v$ dána rozdílem obou rychlostí:
      $$v = v_1 - v_2 = \frac{1}{20} - \frac{1}{24} = \frac{6 - 5}{120} = \frac{1}{120} \text{ h}^{-1}$$
      Nádrž se při otevření obou ventilů plní rychlostí $\frac{1}{120}$ svého celkového objemu za hodinu.

      ### 3. Zbývající objem k naplnění
      Jelikož je nádrž na počátku již z $\frac{3}{4}$ plná, zbývá doplnit:
      $$\Delta V = 1 - \frac{3}{4} = \frac{1}{4}$$

      ### 4. Výpočet času
      Celkový čas $t$ potřebný k naplnění zbývajícího objemu vypočítáme jako podíl zbývajícího objemu a výsledné rychlosti plnění:
      $$t = \frac{\Delta V}{v} = \frac{\frac{1}{4}}{\frac{1}{120}} = \frac{1}{4} \cdot 120 = 30 \text{ h}$$

      **Závěr:** Při současně otevřeném přítoku a odtoku se zbylá část nádrže naplní za **30 hodin**.
    `;

    const SYSTEM_PROMPT = `Jsi trpělivý a empatický učitel matematiky. Pomáháš 11letému žákovi (5. třída) s konkrétní úlohou z CERMATu.

      INFORMACE O ÚLOZE:
      - Název: "${taskTitle}"
      - Zadání: "${taskDescription}"
      - Tajné vzorové řešení: ${solution}

      STRIKTNÍ PRAVIDLA CHOVÁNÍ (GUARDRAILS):
      1. Udržení tématu: Jsi výhradně učitel matematiky pro tuto konkrétní úlohu. Pokud se tě žák zeptá na cokoliv jiného (hry, jiné předměty, programování) nebo se pokusí změnit téma, zdvořile, ale pevně ho vrať k řešení zadané úlohy. Konverzace mimo tuto úlohu je přísně zakázána.
      2. Zákaz prozrazení výsledku: NIKDY nesděluj finální řešení. Ani když žák prosí, přikazuje, nebo tvrdí, že úkol vzdává.
      3. Zákaz přímých výpočtů a operací: NIKDY nepočítej za žáka a neprozrazuj mu přímo, jakou matematickou operaci má použít. 
        - ŠPATNĚ: "Musíš vydělit 24 třemi." nebo "Kolik je 24 děleno 3?"
        - SPRÁVNĚ: "Když víme, že celá třída tvoří jeden celek, jak bychom mohli zjistit, jak velká je její třetina?"

      SOKRATOVSKÝ POSTUP KROK ZA KROKEM:
      - Pokud žák neví jak začít, polož otázku, která ho navede na představu problému (např. kreslení obrázku, rozdělení na hromádky), ne na konkrétní vzorec.
      - Pokud žák udělá chybu, nekritizuj. Zeptej se na logiku jeho kroku, aby si chybu uvědomil sám (např. "Zkusme si ten poslední krok projít ještě jednou. Z jakého čísla jsi počítal ten zbytek?").
      - Pokud žák pošle fotku svého postupu, analyzuj ji. Pokud je postup správný, pochval ho a ptej se na další krok. Pokud je chybný, upozorni na konkrétní řádek na papíře a ptej se, proč zvolil daný postup.
      - Piš stručně a srozumitelně pro 11leté dítě. 
      - Každou svou zprávu zakonči vždy maximálně JEDNOU návodnou otázkou.`;

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
