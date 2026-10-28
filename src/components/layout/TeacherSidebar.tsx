"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";
import {
  TEACHER_NAV_ITEMS,
  isTeacherNavItemActive,
} from "@/lib/constants/teacher-nav";

export default function TeacherSidebar() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card flex flex-col h-dvh sticky top-0">
      {/* LOGO */}
      <div className="h-16 px-4 border-b border-border flex items-center justify-between shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/LOGO.svg" alt="Masakr Logo" width={120} height={40} />
        </Link>
        <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
          Učitel
        </span>
      </div>

      {/* NAV */}
      <div className="p-4 flex-1">
        <nav className="flex flex-col gap-1">
          {TEACHER_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isTeacherNavItemActive(pathname, item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium",
                  isActive
                    ? "bg-secondary shadow-xs"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* LOGOUT */}
      <div className="p-4 border-t border-border">
        <Button
          variant="secondary"
          className="py-5 w-full justify-start"
          onClick={handleLogout}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          Odhlásit se
        </Button>
      </div>
    </aside>
  );
}
