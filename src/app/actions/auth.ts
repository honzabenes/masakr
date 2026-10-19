"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  signInWithPassword,
  signOut,
} from "@/lib/services/auth";

export async function login(formData: FormData) {
  const nickname = formData.get("nickname") as string;
  const password = formData.get("password") as string;

  if (!nickname || !password) {
    return { error: "Zadejte přezdívku i heslo." };
  }

  const supabase = await createClient();
  const email = `${nickname.trim().toLowerCase()}@masakr.cz`;

  const { error } = await signInWithPassword(supabase, email, password);

  if (error) {
    return { error: "Nesprávné jméno nebo heslo." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  
  await signOut(supabase);
  
  redirect("/login");
}