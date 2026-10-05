import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ConversationStatus } from "@/types";

export interface ChatActionBarProps {
  status: ConversationStatus;
  onSubmit?: () => void;
}

export default function ChatActionBar({
  status,
  onSubmit,
}: ChatActionBarProps) {
  return (
    <div className="flex items-center justify-between w-full pb-4 shrink-0 pt-4">
      <Link href="/dashboard">
        <Button variant="ghost">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Zpět
        </Button>
      </Link>

      <Button
        variant="ghost"
        className="text-primary hover:text-primary"
        disabled={status !== "in_progress"}
        onClick={onSubmit}
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        {status === "in_progress" ? "Odevzdat" : "Odevzdáno"}
      </Button>
    </div>
  );
}
