"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signInWithPassword, signOut } from "@/lib/services/auth";

const LoginSchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(1, "Zadejte přezdívku.")
    .max(64)
    .regex(/^[a-zA-Z0-9._-]+$/, "Nepovolené znaky v přezdívce."),
  password: z.string().min(1, "Zadejte heslo.").max(256),
});

export async function login(formData: FormData) {
  const parsed = LoginSchema.safeParse({
    nickname: formData.get("nickname"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Zadejte platnou přezdívku i heslo." };
  }

  const supabase = await createClient();
  const email = `${parsed.data.nickname.toLowerCase()}@masakr.cz`;
  const { error } = await signInWithPassword(
    supabase,
    email,
    parsed.data.password,
  );

  if (error) {
    return { error: "Nesprávné jméno nebo heslo." };
  }

  redirect("/");
}

export async function logout() {
  const supabase = await createClient();

  await signOut(supabase);

  redirect("/login");
}
