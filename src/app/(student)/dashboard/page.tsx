"use client";

import TaskTable from "@/components/dashboards/student/TaskTable";
import TaskTableHeader from "@/components/dashboards/student/TaskTableHeader";
import { TaskTableItemProps } from "@/components/dashboards/student/TaskTableItem";

export default function StudentDashboard() {
  const tasks: TaskTableItemProps[] = [
    {
      id: "task-0104",
      title: "Úloha 0104",
      status: "in_process",
      lastEditDate: new Date(2025, 0, 17),
    },
    {
      id: "task-0103",
      title: "Úloha 0103",
      status: "submitted",
      lastEditDate: new Date(2025, 0, 17),
    },
    {
      id: "task-0102-submitted",
      title: "Úloha 0102",
      status: "submitted",
      lastEditDate: new Date(2025, 0, 17),
    },
    {
      id: "task-0102-rated",
      title: "Úloha 0102",
      status: "rated",
      lastEditDate: new Date(2025, 0, 17),
    },
    {
      id: "task-0102-in-process-1",
      title: "Úloha 0102",
      status: "in_process",
      lastEditDate: new Date(2025, 0, 17),
    },
    {
      id: "task-0102-in-process-2",
      title: "Úloha 0102",
      status: "in_process",
      lastEditDate: new Date(2025, 0, 17),
    },
    {
      id: "task-0102-in-process-3",
      title: "Úloha 0102",
      status: "in_process",
      lastEditDate: new Date(2025, 0, 17),
    },
  ];

  return (
    <div className="flex flex-col items-center min-h-svh">
      <TaskTableHeader />
      <div className="w-full mt-12 flex items-center justify-center">
        <TaskTable tasks={tasks}></TaskTable>
      </div>
    </div>
  );
}
