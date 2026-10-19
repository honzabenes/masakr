import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/services/auth";
import { getUserRole } from "@/lib/services/users";

export default async function HomePage() {
  const supabase = await createClient();

  const user = await getCurrentUser(supabase);

  if (!user) {
    redirect("/login");
  }

  const role = await getUserRole(supabase, user.id);

  if (role === "teacher") {
    redirect("/teacher-dashboard");
  } else {
    redirect("/dashboard");
  }
}
