import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentUser } from "@/lib/services/auth";
import { getUserRole } from "@/lib/services/users";
import TeacherSidebar from "@/components/layout/TeacherSidebar";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await requireCurrentUser(supabase);
  const role = await getUserRole(supabase, user.id);

  if (role !== "teacher") {
    notFound();
  }

  return (
    <div className="min-h-dvh flex bg-background text-foreground">
      <TeacherSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto p-6 md:p-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
