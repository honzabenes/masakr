import { TaskTableItemProps } from "./TaskTableItem";
import TaskTableItem from "./TaskTableItem";
import TaskTableHeader from "./TaskTableHeader";

// --- TYPES ---
interface TaskListProps {
  tasks: TaskTableItemProps[];
}

// --- COMPONENT ---
export default function TaskTable({ tasks }: TaskListProps) {
  return (
    <div className="w-full max-w-3xl max-h-[70vh] border bg-background rounded-md flex flex-col m-4 p-4">
      {/* Heading */}
      <TaskTableHeader />

      {/* Tasks */}
      <div className="overflow-y-auto flex-1 custom-scrollbar px-4">
        {tasks.map((task) => (
          <TaskTableItem
            key={task.id}
            id={task.id}
            title={task.title}
            status={task.status}
            lastEditDate={task.lastEditDate}
            messageCount={task.messageCount}
          ></TaskTableItem>
        ))}
      </div>
    </div>
  );
}
