import { MessagesSquare } from "lucide-react";

export default function TaskTableHeader() {
  return (
    <div className="px-2 py-2 flex justify-between">
      {/* Heading */}
      <div className="flex items-center gap-4 px-4">
        <MessagesSquare className="text-primary" />
        <h2 className="font-semibold text-lg">Úkoly</h2>
      </div>
    </div>
  );
}
