import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import StudentChatInterface from "@/components/chat/student/StudentChatInterface";
import { requireCurrentUser } from "@/lib/services/auth";
import { getTaskById } from "@/lib/services/tasks";
import {
  createConversation,
  getConversation,
} from "@/lib/services/conversations";

interface TaskPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  
  const user = await requireCurrentUser(supabase);

  const task = await getTaskById(supabase, id);
  if (!task) notFound();

  let conversation = await getConversation(supabase, task.id, user.id);

  if (!conversation) {
    conversation = await createConversation(
      supabase,
      task.id,
      user.id,
      "not_started",
    );
  }

  return (
    <main className="h-dvh overflow-hidden">
      <div className="h-full w-full flex items-center justify-center pt-16 pb-4 px-4 md:pb-6 md:px-6">
        <StudentChatInterface
          taskId={task.id}
          conversationId={conversation.id}
          status={conversation.status}
        />
      </div>
    </main>
  );
}