import ChildHeader from "@/components/layout/ChildHeader";
import React from "react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/20">
      <ChildHeader />
      <main className="p-4">{children}</main>
    </div>
  );
}