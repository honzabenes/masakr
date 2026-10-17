import { Badge } from "@/components/ui/badge";
import { ConversationStatus } from "@/types";
import { MessageSquare } from "lucide-react";

// --- TYPES ---
export interface TaskTableItemProps {
  title: string;
  id: string;
  status: ConversationStatus;
  lastEditDate: Date;
}

const taskStatusConfig = {
  not_started: { label: "Nezahájeno", variant: "destructive" as const },
  in_process: { label: "Rozpracováno", variant: "secondary" as const },
  submitted: { label: "Odevzdáno", variant: "outline" as const },
  graded: { label: "Ohodnoceno", variant: "default" as const },
};

// --- COMPONENT ---
export default function TaskTableItem({
  title,
  status,
  lastEditDate,
}: TaskTableItemProps) {
  const badge = taskStatusConfig[status];
  const messageCount = 7; // TODO: replace with actual message count when available

  return (
    <div className="flex flex-col items-center gap-1 justify-between px-6 py-4 border rounded-md cursor-pointer my-4 hover:bg-accent">
      <div className="flex w-full items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <span className="text-sm text-muted-foreground">
          {lastEditDate.toLocaleDateString("cs-CZ")}
        </span>
      </div>

      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="text-muted-foreground h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {messageCount} zpráv
          </span>
        </div>
        <Badge variant={badge.variant} className="rounded-sm">
          {badge.label}
        </Badge>
      </div>
    </div>
  );
}
