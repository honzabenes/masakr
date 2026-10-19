import { TaskTableItemProps } from "./TaskTableItem";
import TaskTableItem from "./TaskTableItem";
import TaskTableHeader from "./TaskTableHeader";

// --- TYPES ---
interface TaskListProps {
  tasks: TaskTableItemProps[];
}

// --- COMPONENT ---
export default function TaskTable({ tasks }: TaskListProps) {
  const hasTasks = tasks && tasks.length > 0;

  return (
    <div className="w-full max-w-3xl max-h-[70vh] border bg-background rounded-md flex flex-col m-4 p-4">
      {/* Heading */}
      <TaskTableHeader />

      {/* Tasks */}
      <div className="overflow-y-auto flex-1 custom-scrollbar px-4 flex flex-col">
        {hasTasks ? (
          tasks.map((task) => (
            <TaskTableItem
              key={task.id}
              id={task.id}
              title={task.title}
              status={task.status}
              lastEditDate={task.lastEditDate}
              messageCount={task.messageCount}
            />
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center py-4">
            <p className="text-muted-foreground text-sm md:text-base">
              Jakmile učitel zadá úkol, objeví se zde.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
