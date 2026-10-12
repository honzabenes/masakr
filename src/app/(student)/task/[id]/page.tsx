import StudentChatInterface from "@/components/chat/student/StudentChatInterface";

export default async function TaskPage({ params }: { params: { id: string } }) {
  return (
    <main className="h-dvh overflow-hidden">
      {/* Vykreslíme klientskou komponentu a předáme jí potřebná data */}
      <div className="h-full w-full flex items-center justify-center pt-16 pb-4 px-4 md:pb-6 md:px-6">
        <StudentChatInterface
          taskTitle="Sportovní kroužky ve třídě"
          taskDescription="Ve třídě je 24 žáků. Třetina z nich hraje fotbal. Čtvrtina ze zbytku hraje florbal. Kolik žáků nehraje ani jeden z těchto sportů?"
          solution="SOLUTION"
          status="in_progress"
        />
      </div>
    </main>
  );
}
