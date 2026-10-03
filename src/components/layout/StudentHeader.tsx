"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

import Link from "next/link";
import Image from "next/image";

export default function StudentHeader() {
	return (
		<nav className="w-full border-b fixed z-50 bg-card">
			<div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
				
				{/* Levá část: Logo / Hlavní nadpis */}
				<div className="flex items-center gap-8">
				<Link href="/" className="flex items-center gap-2">
					<Image src="/LOGO.svg" alt="Masakr Logo" width={128} height={128} />
				</Link>
				</div>

				{/* Pravá část: Odhlášení */}
				<div className="flex items-center gap-4">
				<Button
					variant="secondary"
				>
            		<LogOut className="ml-auto h-4 w-4" />
					Odhlásit se
				</Button>
				</div>
			</div>
		</nav>
	);
}