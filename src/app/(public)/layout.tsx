"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/public/shared";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Trang chủ" },
  { to: "/journey", label: "Hành trình" },
  { to: "/vocabulary", label: "Từ vựng" },
  { to: "/about", label: "Về mình" },
] as const;

export default function PublicLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden gap-8 text-sm md:flex">
            {nav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname?.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  href={n.to}
                  className={cn(
                    "py-5 transition-colors hover:text-foreground",
                    active
                      ? "border-b-2 border-primary font-medium text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild className="hidden rounded-xl sm:inline-flex">
              <Link href="/journey">Bắt đầu hành trình</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
            >
              <Menu />
            </Button>
          </div>
        </div>
        {open && (
          <nav className="flex flex-col border-t px-4 py-2 md:hidden">
            {nav.map((n) => (
              <Link
                key={n.to}
                href={n.to}
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-foreground/80 hover:text-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        Không cần hoàn hảo, chỉ cần tiến bộ mỗi ngày · 100 Ngày Học Tiếng Anh Của Vũ Văn Hà Công
      </footer>
    </div>
  );
}
