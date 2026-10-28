"use client";

import { usePathname } from "next/navigation";
import {
  TEACHER_NAV_ITEMS,
  isTeacherNavItemActive,
} from "@/lib/constants/teacher-nav";

export default function TeacherHeader() {
  const pathname = usePathname();

  const activeItem = TEACHER_NAV_ITEMS.find((item) =>
    isTeacherNavItemActive(pathname, item),
  );

  return (
    <header className="h-16 px-6 md:px-8 border-b border-border bg-card flex items-center shrink-0 sticky top-0 z-10">
      <h1 className="text-lg font-semibold text-gray-600 tracking-tight">
        {activeItem?.label ?? "Učitelský panel"}
      </h1>
    </header>
  );
}
