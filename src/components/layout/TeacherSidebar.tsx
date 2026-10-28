"use client";

import { useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  MessageSquareCheck,
  LogOut,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Přehled",
    href: "/teacher-dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Řešení studentů",
    href: "/submissions",
    icon: MessageSquareCheck,
    exact: false,
  },
  {
    label: "Zadané Úlohy",
    href: "/tasks",
    icon: BookOpen,
    exact: true,
  },
  {
    label: "Nová úloha",
    href: "/tasks/create",
    icon: PlusCircle,
    exact: true,
  },
];

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
      <div className="p-4 flex items-center justify-between">
        <Link href="/teacher-dashboard" className="flex items-center gap-2">
          <Image src="/LOGO.svg" alt="Masakr Logo" width={120} height={40} />
        </Link>
        <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
          Učitel
        </span>
      </div>

      <div className="p-4 border-t border-border">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-gray-600 hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

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
