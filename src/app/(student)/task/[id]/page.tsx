import StudentChatInterface from "@/components/chat/student/StudentChatInterface";

export default function TaskPage() {
  return (
    <main className="h-dvh overflow-hidden">
      <div className="h-full w-full flex items-center justify-center pt-16 pb-4 px-4 md:pb-6 md:px-6">
        <StudentChatInterface
          taskTitle="Přítok a odtok"
          taskDescription="Nádrž na vodu má přítok, který prázdnou dokáže naplnit za 20 hodin. Odtok nádrže naopak plnou nádrž vypustí za 24 hodin. Nádrž je nyní naplněna ze tří čtvrtin. Za jak dlouho bude nádrž plná, bude-li současně otevřen přítok i odtok?"
          solution="SOLUTION"
          status="in_process"
        />
      </div>
    </main>
  );
}
