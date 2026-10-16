import { Link, Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { BookOpen, ExternalLink, FilePlus2, LayoutDashboard, ListChecks, Menu, X } from "lucide-react";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { to: "/admin/lessons", label: "Bài học", icon: ListChecks, exact: true },
  { to: "/admin/lessons/new", label: "Tạo bài học", icon: FilePlus2, exact: true },
] as const;

function AdminLayout() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/admin" className="flex items-center gap-2 px-2" onClick={() => setOpen(false)}>
        <BookOpen className="h-8 w-8 text-primary" strokeWidth={1.8} />
        <span className="text-sm font-bold leading-tight">100 Ngày<br /><span className="text-primary">Quản trị</span></span>
      </Link>
      <nav className="flex flex-col gap-1">
        {nav.map(({ to, label, icon: I, exact }) => {
          const active = exact ? path.replace(/\/$/, "") === to : path.startsWith(to);
          return (
            <Link key={to} to={to} onClick={() => setOpen(false)}
              className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors", active ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>
              <I className="h-4 w-4" />{label}
            </Link>
          );
        })}
      </nav>
      <Link to="/" className="mt-auto flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent">
        <ExternalLink className="h-4 w-4" />Xem trang công khai
      </Link>
    </div>
  );
  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r bg-sidebar lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-foreground/30" aria-label="Đóng menu" onClick={() => setOpen(false)} />
          <aside className="relative h-full w-64 bg-sidebar shadow-xl">{sidebar}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(!open)} aria-label="Mở menu quản trị">{open ? <X /> : <Menu />}</button>
          <span className="font-bold">Quản trị</span>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-8"><Outlet /></main>
      </div>
      <Toaster richColors />
    </div>
  );
}