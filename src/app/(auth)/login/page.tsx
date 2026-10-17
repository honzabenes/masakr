import LoginForm from "@/components/auth/LoginForm";

import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-10">
        
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center gap-8 mb-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/LOGO.svg" alt="Masakr Logo" width={128} height={128} />
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-1">
            Přihlašte se, prosím.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}