import { createClient } from "@/lib/supabase/server";
import TaskTable from "@/components/dashboards/student/TaskTable";
import { getTasks } from "@/lib/services/tasks";
import { getUserConversationSummaries } from "@/lib/services/conversations";
import { getCurrentUserProfile } from "@/lib/services/users";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const profile = await getCurrentUserProfile();
  if (!profile) redirect("/login");

  const [tasks, conversations] = await Promise.all([
    getTasks(await createClient(), profile.grade_level),
    getUserConversationSummaries(await createClient(), profile.id),
  ]);

  const tableData = tasks.map((task) => {
    const conv = conversations.find((c) => c.task_id === task.id);
    const msgCount = conv?.message_count ?? 0;
    const rawDate = new Date(conv?.updated_at ?? task.created_at);

    return {
      id: task.id,
      title: task.title,
      status: conv?.status ?? "not_started",
      lastEditDate: new Intl.DateTimeFormat("cs-CZ", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      }).format(rawDate),
      messageCount: msgCount,
    };
  });

  return (
    <div className="w-full h-full flex justify-center pt-24">
      <TaskTable tasks={tableData} />
    </div>
  );
}
