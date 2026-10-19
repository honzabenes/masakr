import StudentHeader from "@/components/layout/StudentHeader";
import { requireCurrentUser } from "@/lib/services/auth";
import { getUserRole } from "@/lib/services/users";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import React from "react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentLayoutGuard>{children}</StudentLayoutGuard>;
}

async function StudentLayoutGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const user = await requireCurrentUser(supabase);

  const role = await getUserRole(supabase, user.id);
  if (role !== "student") {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <StudentHeader />
      <main>{children}</main>
    </div>
  );
}
