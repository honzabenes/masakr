import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import StudentChatInterface from "@/components/chat/student/StudentChatInterface";
import type { ConversationStatus } from "@/types";

interface TaskPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();

  if (taskError || !task) {
    notFound();
  }

  let { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("task_id", task.id)
    .eq("user_id", user.id)
    .single();

  if (!conversation) {
    const { data: newConversation, error: insertError } = await supabase
      .from("conversations")
      .insert({
        task_id: task.id,
        user_id: user.id,
        status: "not_started" as ConversationStatus,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Chyba při vytváření konverzace:", insertError);
      throw new Error("Nepodařilo se založit novou konverzaci k úkolu.");
    }
    
    conversation = newConversation;
  }

  return (
    <main className="h-dvh overflow-hidden">
      <div className="h-full w-full flex items-center justify-center pt-16 pb-4 px-4 md:pb-6 md:px-6">
        <StudentChatInterface
          taskTitle={task.title}
          taskDescription={task.description || ""}
          solution={task.model_solution}
          status={conversation.status}
        />
      </div>
    </main>
  );
}