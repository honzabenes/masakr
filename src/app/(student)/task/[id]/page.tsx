import StudentChatInterface from "@/components/chat/student/StudentChatInterface";

export default async function TaskPage({ params }: { params: { id: string } }) {
  return (
    <main className="h-dvh overflow-hidden">
      {/* Vykreslíme klientskou komponentu a předáme jí potřebná data */}
      <div className="h-full w-full flex items-center justify-center pt-16 pb-4 px-4 md:pb-6 md:px-6">
        <StudentChatInterface
          taskTitle="TITLE"
          solution="SOLUTION"
          status="in_progress"
        />
      </div>
    </main>
  );
}
