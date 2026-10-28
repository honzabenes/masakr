import { createClient } from "@/lib/supabase/server";
import TaskTable from "@/components/dashboards/student/TaskTable";
import { requireCurrentUser } from "@/lib/services/auth";
import { getTasks } from "@/lib/services/tasks";
import { getUserConversationSummaries } from "@/lib/services/conversations";
import { getUserGradeLevel } from "@/lib/services/users";

export default async function DashboardPage() {
  const supabase = await createClient();
  const user = await requireCurrentUser(supabase);

  const gradeLevel = await getUserGradeLevel(supabase, user.id);

  const [tasks, conversations] = await Promise.all([
    getTasks(supabase, gradeLevel),
    getUserConversationSummaries(supabase, user.id),
  ]);

  const tableData = tasks?.map((task) => {
    const conv = conversations?.find((c) => c.task_id === task.id);
    const msgCount = conv?.message_count ?? 0;

    const rawDate = new Date(conv?.updated_at || task.created_at);
    const formattedDate = new Intl.DateTimeFormat("cs-CZ", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }).format(rawDate);

    return {
      id: task.id,
      title: task.title,
      status: conv?.status || "not_started",
      lastEditDate: formattedDate,
      messageCount: msgCount,
    };
  });

  return (
    <div className="w-full h-full flex justify-center pt-24">
      <TaskTable tasks={tableData} />
    </div>
  );
}
