import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  MessageSquareCheck,
  type LucideIcon,
} from "lucide-react";

export interface TeacherNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  exact: boolean;
}

export const TEACHER_NAV_ITEMS: TeacherNavItem[] = [
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
    label: "Zadané úlohy",
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

export function isTeacherNavItemActive(
  pathname: string,
  item: TeacherNavItem,
): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}
