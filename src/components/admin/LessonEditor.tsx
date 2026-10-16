import { CalendarDays, Clock, Download, Eye, FileText, FileUp, Gauge, Tag, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/lesson/MarkdownRenderer";
import { PdfViewer } from "@/components/lesson/PdfViewer";
import { TOTAL_DAYS, formatDate, getLesson, pad } from "@/lib/lessons";
import { CATEGORIES, LEVELS, draftFromMarkdown, draftToMarkdown, exportFileName, type LessonDraft } from "@/lib/lesson-file";
import { cn } from "@/lib/utils";

const selectCls = "h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return <label className={cn("block space-y-1.5", className)}><span className="text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>;
}

function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export function LessonEditor({ heading, initial, autoImport }: { heading: string; initial: LessonDraft; autoImport?: boolean }) {
  const [d, setD] = useState(initial);
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [publicView, setPublicView] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof LessonDraft>(k: K, v: LessonDraft[K]) => setD((p) => ({ ...p, [k]: v }));
  const existing = getLesson(d.day);
  const categories = CATEGORIES.includes(d.category) ? CATEGORIES : [...CATEGORIES, d.category];

  useEffect(() => { if (autoImport) fileRef.current?.click(); }, [autoImport]);

  async function onImport(file?: File) {
    if (!file) return;
    if (!/\.(md|markdown)$/i.test(file.name)) { toast.error("Chỉ hỗ trợ file .md"); return; }
    setD((p) => draftFromMarkdown("", p));
    const text = await file.text();
    setD((p) => draftFromMarkdown(text, p, file.name));
    toast.success(`Đã nhập ${file.name}`);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onExport() {
    if (!d.title.trim()) { toast.error("Vui lòng nhập tiêu đề bài học"); return; }
    downloadText(draftToMarkdown(d), exportFileName(d));
    toast.success(`Đã tải ${exportFileName(d)}`, { description: "Chép file vào thư mục content/lessons của dự án." });
  }

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-2xl font-extrabold md:text-3xl">{heading}</h1><p className="text-sm text-muted-foreground">File xuất: <code>{exportFileName(d)}</code></p></div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept=".md,.markdown,text/markdown" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} />
          <Button variant="outline" className="rounded-xl" onClick={() => fileRef.current?.click()}><FileUp />Import .md</Button>
          <Button variant="outline" className="rounded-xl" onClick={() => setPublicView(true)}><Eye />Xem như trang Public</Button>
          <Button className="rounded-xl" onClick={onExport}><Download />Xuất Markdown</Button>
        </div>
      </div>

      <section className="card-soft grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Ngày học (1–100)">
          <select className={selectCls} value={d.day} onChange={(e) => set("day", Number(e.target.value))}>
            {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((n) => <option key={n} value={n}>Ngày {pad(n)}{getLesson(n) ? " • đã có" : ""}</option>)}
          </select>
        </Field>
        <Field label="Tiêu đề" className="sm:col-span-1 lg:col-span-3"><Input className="bg-card" value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="VD: Giới thiệu bản thân" /></Field>
        <Field label="Ngày"><Input className="bg-card" type="date" value={d.date} onChange={(e) => set("date", e.target.value)} /></Field>
        <Field label="Chủ đề"><select className={selectCls} value={d.category} onChange={(e) => set("category", e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Trình độ"><select className={selectCls} value={d.level} onChange={(e) => set("level", e.target.value)}>{(LEVELS.includes(d.level) || !d.level ? LEVELS : [...LEVELS, d.level]).map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Thời lượng (phút)"><Input className="bg-card" type="number" min={0} value={d.duration} onChange={(e) => set("duration", Number(e.target.value) || 0)} /></Field>
        <Field label="Link PDF Google Drive" className="sm:col-span-2"><Input className="bg-card" value={d.pdfUrl} onChange={(e) => set("pdfUrl", e.target.value)} placeholder="https://drive.google.com/file/d/.../view" /></Field>
        <Field label="Mô tả ngắn" className="sm:col-span-2"><Input className="bg-card" value={d.description} onChange={(e) => set("description", e.target.value)} /></Field>
        {existing && existing.title !== initial.title && <p className="text-xs text-warm-foreground sm:col-span-2 lg:col-span-4">Ngày {pad(d.day)} đã có bài “{existing.title}”. File xuất sẽ thay thế file cũ khi bạn chép vào dự án.</p>}
      </section>

      <div className="flex gap-1 rounded-xl bg-muted p-1 lg:hidden">
        {(["edit", "preview"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={cn("flex-1 rounded-lg py-1.5 text-sm", tab === t && "bg-card font-semibold shadow")}>{t === "edit" ? "Soạn thảo" : "Xem trước"}</button>)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={cn("card-soft flex flex-col overflow-hidden", tab !== "edit" && "hidden lg:flex")}>
          <div className="border-b px-4 py-3 text-sm font-semibold">Markdown</div>
          <Textarea value={d.content} onChange={(e) => set("content", e.target.value)} spellCheck={false}
            placeholder="# Day 01 - ...&#10;&#10;## 1. Mục tiêu bài học&#10;- [ ] ..."
            className="min-h-[60vh] flex-1 resize-y rounded-none border-0 bg-card font-mono text-sm shadow-none focus-visible:ring-0" />
        </section>
        <section className={cn("card-soft overflow-hidden", tab !== "preview" && "hidden lg:block")}>
          <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-semibold"><FileText className="h-4 w-4 text-primary" />Xem trước trực tiếp</div>
          <div className="max-h-[70vh] overflow-y-auto p-6">{d.content.trim() ? <MarkdownRenderer content={d.content} /> : <p className="text-sm text-muted-foreground">Nội dung sẽ hiển thị ở đây.</p>}</div>
        </section>
      </div>

      {publicView && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur">
            <span className="text-sm font-semibold">Xem trước như trang Public</span>
            <Button variant="outline" size="sm" onClick={() => setPublicView(false)}><X />Đóng</Button>
          </div>
          <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
            <div>
              <h1 className="text-2xl font-extrabold md:text-3xl">Ngày {pad(d.day)}: {d.title || "(Chưa có tiêu đề)"}</h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {d.date && <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" />{formatDate(d.date)}</span>}
                {d.duration > 0 && <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{d.duration} phút</span>}
                {d.level && <span className="flex items-center gap-1 rounded-full bg-warm px-2.5 py-0.5 text-warm-foreground"><Gauge className="h-4 w-4" />{d.level}</span>}
                <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground"><Tag className="h-4 w-4" />{d.category}</span>
              </div>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <PdfViewer url={d.pdfUrl} />
              <div className="card-soft p-6">
                <div className="mb-4 flex items-center gap-2 border-b pb-3 font-semibold"><FileText className="h-5 w-5 text-primary" />Nội dung ghi chú</div>
                <MarkdownRenderer content={d.content} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}