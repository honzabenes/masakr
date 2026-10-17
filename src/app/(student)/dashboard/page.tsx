import { createClient } from "@/lib/supabase/server";
import TaskTable from "@/components/dashboards/student/TaskTable";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tasks, error: tasksError } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: conversations, error: convError } = await supabase
    .from("conversations")
    .select("task_id, status, created_at, messages(count)")
    .eq("student_id", user.id);

  const tableData = tasks?.map((task) => {
    const conv = conversations?.find((c) => c.task_id === task.id);
    const msgCount = conv?.messages?.[0]?.count || 0;
    
    const rawDate = new Date(conv?.created_at || task.created_at);
    const formattedDate = new Intl.DateTimeFormat("cs-CZ", {
      day: "numeric",
      month: "numeric",
      year: "numeric"
    }).format(rawDate);

    return {
      id: task.id,
      title: task.title,
      status: conv?.status || "not_started",
      lastEditDate: formattedDate,
      messageCount: msgCount,
    };
  }) || [];

  return (
    <div className="w-full h-full flex justify-center pt-24">
      <TaskTable tasks={tableData}/>
    </div>
  );
}