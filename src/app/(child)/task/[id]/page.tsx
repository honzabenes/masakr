import ChildChatInterface from "@/components/chat/ChildChatInterface";
import type { Message } from "@/types";

// Dočasná mock data pro ukázku
const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    sender_type: "ai",
    content: "Ahoj! Jsem tvůj Sokratovský AI tutor. Vidím, že dnes budeme trénovat sčítání zlomků s různými jmenovateli. Pošli mi fotku svého prvního příkladu, ať se na to podíváme!",
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "2",
    sender_type: "kid",
    content: "Tady je první příklad, ale nevím jak začít.",
    image_url: "https://images.unsplash.com/photo-1632516643720-e7f5d7d6ecc9?w=400&q=80", // Placeholder obrázek rovnice
    created_at: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
  },
  {
    id: "3",
    sender_type: "ai",
    content: "Výborně, vidím to! Máme tam 1/3 + 1/4. Než je sečteme, musíme najít společného jmenovatele. Co je nejmenší společný násobek čísel 3 a 4?",
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "4",
    sender_type: "kid",
    content: "Je to 12?",
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: "5",
    sender_type: "admin",
    content: "Výborně Tomíku, přesně tak! Jen tak dál. (Zpráva od pana učitele)",
    created_at: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
  }
];

export default async function TaskPage({ params }: { params: { id: string } }) {
  // TODO: V budoucnu zde uděláme něco jako:
  // const supabase = createServerSupabaseClient();
  // const task = await getTaskById(supabase, params.id);
  // const messages = await getMessagesByTaskId(supabase, params.id);

  return (
    <main className="min-h-screen p-4 md:p-8 bg-slate-100">
      {/* Vykreslíme klientskou komponentu a předáme jí potřebná data */}
      {/* <ChildChatInterface 
        taskTitle="Sčítání zlomků s různými jmenovateli"
        initialStatus="in_progress"
        initialMessages={MOCK_MESSAGES}
      /> */}
    </main>
  );
}