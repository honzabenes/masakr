"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login } from "@/app/actions/auth";

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md text-center font-medium">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="nickname" className="text-sm font-semibold text-gray-700">
          Přihlašovací jméno
        </label>
        <input
          id="nickname"
          name="nickname"
          type="text"
          required
          placeholder="karel.novak"
          className="mt-2 w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-semibold text-gray-700">
          Heslo
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          className="mt-2 w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-transparent transition-all"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-teal-700 hover:bg-teal-800 text-white rounded-lg h-11 text-base mt-2 transition-colors"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Přihlásit se"}
      </Button>
    </form>
  );
}