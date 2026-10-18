"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ExternalLink,
  Eye,
  EyeOff,
  FilePlus2,
  KeyRound,
  LayoutDashboard,
  ListChecks,
  Lock,
  LogOut,
  Menu,
  ShieldCheck,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { to: "/admin/lessons", label: "Bài học", icon: ListChecks, exact: true },
  { to: "/admin/lessons/new", label: "Tạo bài học", icon: FilePlus2, exact: true },
] as const;

function AdminAuthGate({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pass.trim()) {
      setError("Vui lòng nhập mật khẩu quản trị.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password: pass }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
      };

      if (res.ok && data.success) {
        toast.success("Đăng nhập quản trị thành công!");
        onAuthenticated();
      } else {
        const errorMsg = data.message || "Mật khẩu quản trị không chính xác. Vui lòng thử lại!";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Lỗi xác thực quản trị:", err);
      const networkMsg =
        "Không thể kết nối máy chủ xác thực. Vui lòng kiểm tra lại biến môi trường ADMIN_PASSWORD.";
      setError(networkMsg);
      toast.error("Không thể kết nối máy chủ xác thực.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="card-soft w-full max-w-md p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Khu vực Quản trị</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Trang dành riêng cho tác giả Vũ Văn Hà Công. Mật khẩu được mã hóa và xác thực an toàn
            phía server (HttpOnly Cookie).
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="admin-pass">
              Mật khẩu quản trị
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="admin-pass"
                type={showPass ? "text" : "password"}
                placeholder="Nhập mật khẩu quản trị..."
                className="bg-card pl-9 pr-10"
                value={pass}
                onChange={(e) => {
                  setPass(e.target.value);
                  setError("");
                }}
                disabled={isSubmitting}
                autoFocus
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
                onClick={() => setShowPass(!showPass)}
                disabled={isSubmitting}
                aria-label={showPass ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          </div>

          <Button type="submit" className="w-full rounded-xl" disabled={isSubmitting}>
            <ShieldCheck className="h-4 w-4 mr-1" />
            {isSubmitting ? "Đang xác thực phía server..." : "Đăng nhập Quản trị"}
          </Button>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
            >
              ← Quay về trang chủ công khai
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export function AdminLayoutClient({ children }: { children: ReactNode }) {
  const [sessionStatus, setSessionStatus] = useState<
    "checking" | "authenticated" | "unauthenticated"
  >("checking");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session", { credentials: "same-origin" })
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data: { authenticated?: boolean }) => {
        if (!active) return;
        setSessionStatus(data.authenticated ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!active) return;
        setSessionStatus("unauthenticated");
      });

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
    } catch {
      // Ignored
    }
    setSessionStatus("unauthenticated");
    toast.info("Đã đăng xuất khỏi trang quản trị.");
  };

  if (sessionStatus === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="card-soft flex items-center gap-3 p-6 shadow-md">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm font-medium text-muted-foreground">
            Đang kiểm tra phiên quản trị...
          </span>
        </div>
      </div>
    );
  }

  if (sessionStatus !== "authenticated") {
    return <AdminAuthGate onAuthenticated={() => setSessionStatus("authenticated")} />;
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link href="/admin" className="flex items-center gap-2 px-2" onClick={() => setOpen(false)}>
        <BookOpen className="h-8 w-8 text-primary" strokeWidth={1.8} />
        <span className="text-sm font-bold leading-tight">
          100 Ngày
          <br />
          <span className="text-primary">Quản trị</span>
        </span>
      </Link>
      <nav className="flex flex-col gap-1">
        {nav.map(({ to, label, icon: I, exact }) => {
          const active = exact ? pathname === to : pathname?.startsWith(to);
          return (
            <Link
              key={to}
              href={to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <I className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-1 border-t pt-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          Xem trang công khai
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r bg-sidebar lg:block">
        {sidebar}
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            className="absolute inset-0 bg-foreground/30"
            aria-label="Đóng menu"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-64 bg-sidebar shadow-xl">{sidebar}</aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(!open)} aria-label="Mở menu quản trị">
              {open ? <X /> : <Menu />}
            </button>
            <span className="font-bold">Quản trị 100 Ngày</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-destructive hover:underline"
          >
            Đăng xuất
          </button>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
