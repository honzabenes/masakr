import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireCurrentUser } from "@/lib/services/auth";
import { getUserRole } from "@/lib/services/users";
import TeacherSidebar from "@/components/layout/TeacherSidebar";
import TeacherHeader from "@/components/layout/TeacherHeader";

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
      <div className="flex-1 flex flex-col min-w-0">
        <TeacherHeader />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
