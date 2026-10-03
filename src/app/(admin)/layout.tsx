import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-64 bg-card border-r border-border p-4">Admin Sidebar</aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}