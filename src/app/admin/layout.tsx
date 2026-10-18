import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminLayoutClient } from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: "Quản trị Hệ thống",
  description: "Trang quản trị nội dung hành trình 100 ngày học tiếng Anh của Vũ Văn Hà Công.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
