import StudentChatInterface from "@/components/chat/student/StudentChatInterface";
import type { Message } from "@/types";

// Dočasná mock data pro ukázku
const MOCK_MESSAGES: Message[] = [
  {
    id: "1",
    sender_type: "ai",
    content:
      "Ahoj! Jsem tvůj Sokratovský AI tutor. Vidím, že dnes budeme trénovat sčítání zlomků s různými jmenovateli. Pošli mi fotku svého prvního příkladu, ať se na to podíváme!",
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "2",
    sender_type: "student",
    content: "Tady je první příklad, ale nevím jak začít.",
    image_url:
      "https://images.unsplash.com/photo-1632516643720-e7f5d7d6ecc9?w=400&q=80",
    created_at: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
  },
  {
    id: "3",
    sender_type: "ai",
    content:
      "Výborně, vidím to! Máme tam 1/3 + 1/4. Než je sečteme, musíme najít společného jmenovatele. Co je nejmenší společný násobek čísel 3 a 4?",
    created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "4",
    sender_type: "student",
    content: "Je to 12?",
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
  },
  {
    id: "5",
    sender_type: "admin",
    content:
      "Výborně Tomíku, přesně tak! Jen tak dál. (Zpráva od pana učitele)",
    created_at: new Date(Date.now() - 1000 * 60 * 1).toISOString(),
  },
];

export default async function TaskPage({ params }: { params: { id: string } }) {
  // TODO: V budoucnu zde uděláme něco jako:
  // const supabase = createServerSupabaseClient();
  // const task = await getTaskById(supabase, params.id);
  // const messages = await getMessagesByTaskId(supabase, params.id);

  return (
    <main className="h-dvh overflow-hidden">
      {/* Vykreslíme klientskou komponentu a předáme jí potřebná data */}
      <div className="h-full w-full flex items-center justify-center pt-16 pb-4 px-4 md:pb-6 md:px-6">
        <StudentChatInterface
          taskTitle="Sčítání zlomků s různými jmenovateli"
          status="in_progress"
          messages={MOCK_MESSAGES}
        />
      </div>
    </main>
  );
}
