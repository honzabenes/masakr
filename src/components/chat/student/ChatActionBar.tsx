import Link from "next/link";
import { ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ConversationStatus } from "@/types";

export interface ChatActionBarProps {
  status: ConversationStatus;
  taskTitle?: string;
  onSubmit?: () => void;
  isSubmittingTask?: boolean;
}

export default function ChatActionBar({
  status,
  taskTitle,
  onSubmit,
  isSubmittingTask = false,
}: ChatActionBarProps) {
  const isActive = status === "not_started" || status === "in_progress";

  return (
    <div className="flex items-center justify-between w-full py-2 shrink-0">
      <Link href="/dashboard" className="shrink-0">
        <Button variant="ghost" className="px-2 sm:px-4">
          <ArrowLeft className="w-4 h-4 mr-0 sm:mr-2" />
          <span className="hidden sm:inline">Zpět</span>
        </Button>
      </Link>

      {taskTitle && (
        <div className="flex-1 min-w-0 px-2 text-center">
          <h2 className="truncate text-sm sm:text-base font-semibold text-gray-700">
            {taskTitle}
          </h2>
        </div>
      )}

      <Button
        variant="ghost"
        className="shrink-0 px-2 sm:px-4 text-primary hover:text-primary"
        disabled={!isActive || isSubmittingTask}
        onClick={onSubmit}
      >
        {isSubmittingTask ? (
          <Loader2 className="w-4 h-4 mr-0 sm:mr-2 animate-spin" />
        ) : (
          <CheckCircle className="w-4 h-4 mr-0 sm:mr-2" />
        )}
        <span className="hidden sm:inline">
          {isActive ? "Odevzdat" : "Odevzdáno"}
        </span>
      </Button>
    </div>
  );
}
