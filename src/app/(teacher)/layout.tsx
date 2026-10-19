import { requireCurrentUser } from "@/lib/services/auth";
import { getUserRole } from "@/lib/services/users";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import React from "react";

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await requireCurrentUser(supabase);

  const role = await getUserRole(supabase, user.id);
  if (role !== "teacher") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-card border-r border-border p-4">
        Teacher Sidebar
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
