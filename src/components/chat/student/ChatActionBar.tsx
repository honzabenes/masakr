import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ConversationStatus } from "@/types";

export interface ChatActionBarProps {
  status: ConversationStatus;
  taskTitle?: string;
  onSubmit?: () => void;
}

export default function ChatActionBar({
  status,
  taskTitle,
  onSubmit,
}: ChatActionBarProps) {
  return (
    <div className="flex items-center justify-between w-full pb-4 shrink-0 pt-4">
      <Link href="/dashboard" className="shrink-0">
        <Button variant="ghost" className="px-2 sm:px-4">
          <ArrowLeft className="w-4 h-4 mr-0 sm:mr-2" />
          <span className="hidden sm:inline">Zpět</span>
        </Button>
      </Link>

      {taskTitle && (
        <div className="flex-1 min-w-0 px-2 text-center">
          <h2 className="truncate font-semibold text-gray-700">{taskTitle}</h2>
        </div>
      )}

      <Button
        variant="ghost"
        className="shrink-0 px-2 sm:px-4 text-primary hover:text-primary"
        disabled={status !== "in_progress"}
        onClick={onSubmit}
      >
        <CheckCircle className="w-4 h-4 mr-0 sm:mr-2" />
        <span className="hidden sm:inline">
          {status === "in_progress" ? "Odevzdat" : "Odevzdáno"}
        </span>
      </Button>
    </div>
  );
}
