import StudentHeader from "@/components/layout/StudentHeader";
import React from "react";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <StudentHeader />
      <main>{children}</main>
    </div>
  );
}
