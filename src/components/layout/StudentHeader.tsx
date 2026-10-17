"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { logout } from "@/app/actions/auth";

export default function StudentHeader() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  return (
    <nav className="w-full border-b fixed z-50 bg-card">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
        {/* LOGO */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/LOGO.svg" alt="Masakr Logo" width={128} height={128} />
          </Link>
        </div>

        {/* LOGOUT */}
        <div className="flex items-center gap-4">
          <Button 
            variant="secondary" 
            onClick={handleLogout}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="ml-auto h-4 w-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="ml-auto h-4 w-4 mr-2" />
            )}
            Odhlásit se
          </Button>
        </div>
      </div>
    </nav>
  );
}