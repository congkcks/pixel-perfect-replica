import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-7xl font-extrabold text-primary">404</h1>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">Trang không tồn tại</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Nội dung bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild className="rounded-xl">
          <Link href="/">Quay về Trang chủ</Link>
        </Button>
        <Button variant="outline" asChild className="rounded-xl">
          <Link href="/journey">Xem Hành trình 100 ngày</Link>
        </Button>
      </div>
    </div>
  );
}
