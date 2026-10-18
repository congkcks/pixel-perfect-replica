import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CloudUpload,
  Download,
  Eye,
  FileCheck2,
  FileText,
  FileUp,
  Gauge,
  GitBranch,
  ListPlus,
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
  TableProperties,
  Tag,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownRenderer } from "@/components/lesson/MarkdownRenderer";
import { PdfViewer } from "@/components/lesson/PdfViewer";
import {
  TOTAL_DAYS,
  deleteLessonFromStorage,
  formatDate,
  getLesson,
  isLessonCustom,
  pad,
  saveLessonToStorage,
} from "@/lib/lessons";
import { countVocabulary } from "@/lib/markdown";
import {
  CATEGORIES,
  LEVELS,
  draftFromLesson,
  draftFromMarkdown,
  draftToMarkdown,
  exportFileName,
  type LessonDraft,
} from "@/lib/lesson-file";
import { extractDriveFileId } from "@/lib/google-drive";
import { cn } from "@/lib/utils";

const selectCls =
  "h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1.5", className)}>
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function downloadText(text: string, filename: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

const VOCAB_TEMPLATE = `## 3. Từ vựng

| English | Pronunciation | Vietnamese | Example |
| --- | --- | --- | --- |
| Persistent | /pərˈsɪstənt/ | Kiên trì, bền bỉ | He was persistent in studying English every day. |
| Fluency | /ˈfluːənsi/ | Sự trôi chảy | Daily practice leads to speaking fluency. |
| Vocabulary | /vəˈkæbjələri/ | Từ vựng | Learning new vocabulary expands your knowledge. |`;

const GOALS_TEMPLATE = `## 1. Mục tiêu bài học
- [ ] Học và phát âm chuẩn các từ vựng mới trong bài.
- [ ] Nắm chắc mẫu câu và cách ứng dụng thực tế.
- [ ] Tự ghi âm luyện nói 5 phút.`;

const GRAMMAR_TEMPLATE = `## 2. Mẫu câu & Ngữ pháp
### Cấu trúc chính
\`\`\`
S + V(s/es) + O
\`\`\`
- **Ví dụ**: *I practice speaking English every single day.*
- **Ghi chú**: Chú ý chia động từ phù hợp với chủ ngữ.`;

const SUMMARY_TEMPLATE = `## 4. Tổng kết & Đánh giá
- Hôm nay đã hoàn thành bài học đúng thời gian.
- Cần chú ý luyện lại phần phát âm và nối âm (linking sounds).`;

export function LessonEditor({
  heading,
  initial,
  autoImport,
}: {
  heading: string;
  initial: LessonDraft;
  autoImport?: boolean | undefined;
}) {
  const [d, setD] = useState<LessonDraft>(initial);
  const [isCustomState, setIsCustomState] = useState(() => isLessonCustom(initial.day));
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [publicView, setPublicView] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [remoteSha, setRemoteSha] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof LessonDraft>(k: K, v: LessonDraft[K]) =>
    setD((p) => ({ ...p, [k]: v }));

  const existing = getLesson(d.day);
  const categories = CATEGORIES.includes(d.category) ? CATEGORIES : [...CATEGORIES, d.category];
  const detectedVocab = countVocabulary(d.content);
  const hasDriveId = Boolean(extractDriveFileId(d.pdfUrl));

  useEffect(() => {
    if (autoImport) fileRef.current?.click();
  }, [autoImport]);

  // Check custom state when day changes
  useEffect(() => {
    setIsCustomState(isLessonCustom(d.day));
  }, [d.day]);

  // Fetch current remote SHA from server / GitHub
  useEffect(() => {
    let active = true;
    fetch(`/api/admin/lessons/${d.day}/metadata`, { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { exists?: boolean; sha?: string | null } | null) => {
        if (!active || !data) return;
        setRemoteSha(data.sha || null);
      })
      .catch(() => {
        // Offline / testing fallback
      });

    return () => {
      active = false;
    };
  }, [d.day]);

  // Auto-save draft in sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `vvhc_draft_day_${d.day}`;
    const timer = setTimeout(() => {
      sessionStorage.setItem(key, JSON.stringify(d));
    }, 800);
    return () => clearTimeout(timer);
  }, [d]);

  async function onImport(file?: File) {
    if (!file) return;
    if (!/\.(md|markdown)$/i.test(file.name)) {
      toast.error("Chỉ hỗ trợ file .md");
      return;
    }
    const text = await file.text();
    setD((p) => draftFromMarkdown(text, p, file.name));
    toast.success(`Đã nhập dữ liệu từ ${file.name}`);
    if (fileRef.current) fileRef.current.value = "";
  }

  function onSave() {
    if (!d.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài học");
      return;
    }
    saveLessonToStorage(d);
    setIsCustomState(true);
    toast.success(`Đã lưu nháp Ngày ${pad(d.day)} trên trình duyệt!`, {
      description:
        "Dữ liệu được lưu trong LocalStorage máy này. Để hiển thị cho người xem trên thiết bị khác, hãy bấm 'Xuất bản lên GitHub'.",
    });
  }

  async function onPublishToGitHub() {
    if (!d.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài học");
      return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch("/api/admin/lessons/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          draft: d,
          expectedSha: remoteSha,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        sha?: string;
        localSaved?: boolean;
        message?: string;
      };

      if (res.ok && data.success) {
        if (data.sha) {
          setRemoteSha(data.sha);
        }
        // Save to local storage as well for immediate client responsiveness
        saveLessonToStorage(d);
        setIsCustomState(true);

        if (data.localSaved) {
          toast.success(`Đã lưu bài học Ngày ${pad(d.day)} vào local disk!`, {
            description: data.message,
          });
        } else {
          toast.success(`Đã xuất bản bài học Ngày ${pad(d.day)} lên GitHub!`, {
            description:
              "GitHub commit thành công! Vercel sẽ tự động build lại website cho mọi thiết bị (~30 giây).",
          });
        }
      } else {
        toast.error("Không thể xuất bản bài học", {
          description: data.message || "Đã xảy ra lỗi khi kết nối với máy chủ / GitHub API.",
        });
      }
    } catch (err) {
      toast.error("Lỗi kết nối khi xuất bản bài học", {
        description: err instanceof Error ? err.message : "Vui lòng kiểm tra lại kết nối mạng.",
      });
    } finally {
      setIsPublishing(false);
    }
  }

  function onReset() {
    if (confirm(`Bạn có chắc muốn khôi phục bài Ngày ${pad(d.day)} về trạng thái gốc từ repo?`)) {
      deleteLessonFromStorage(d.day);
      setIsCustomState(false);
      const original = getLesson(d.day);
      if (original) {
        setD(draftFromLesson(original));
      } else {
        setD(initial);
      }
      toast.info(`Đã khôi phục bài Ngày ${pad(d.day)} về mặc định.`);
    }
  }

  function onExport() {
    if (!d.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề bài học");
      return;
    }
    downloadText(draftToMarkdown(d), exportFileName(d));
    toast.success(`Đã tải file ${exportFileName(d)}`, {
      description: "Chép file vào thư mục content/lessons của dự án để đồng bộ git và Vercel.",
    });
  }

  const insertSnippet = (snippet: string) => {
    setD((p) => {
      const current = p.content.trimEnd();
      const newContent = current ? `${current}\n\n${snippet}\n` : `${snippet}\n`;
      return { ...p, content: newContent };
    });
    toast.success("Đã chèn mẫu vào nội dung Markdown!");
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold md:text-3xl">{heading}</h1>
            {isCustomState && (
              <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                Đã lưu trên máy
              </span>
            )}
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                d.completed ? "bg-primary/15 text-primary" : "bg-chart-4/15 text-chart-4",
              )}
            >
              {d.completed ? "Đã hoàn thành" : "Đang học / Nháp"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Tập tin xuất: <code className="font-semibold text-foreground">{exportFileName(d)}</code>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".md,.markdown,text/markdown"
            className="hidden"
            onChange={(e) => onImport(e.target.files?.[0])}
          />
          <Button variant="outline" className="rounded-xl" onClick={() => fileRef.current?.click()}>
            <FileUp className="h-4 w-4 mr-1" />
            Import .md
          </Button>

          {isCustomState && (
            <Button
              variant="outline"
              className="rounded-xl text-destructive hover:bg-destructive/10"
              onClick={onReset}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Khôi phục gốc
            </Button>
          )}

          <Button variant="outline" className="rounded-xl" onClick={() => setPublicView(true)}>
            <Eye className="h-4 w-4 mr-1" />
            Xem trước Public
          </Button>

          <Button variant="outline" className="rounded-xl" onClick={onExport}>
            <Download className="h-4 w-4 mr-1" />
            Xuất file .md
          </Button>

          <Button variant="outline" className="rounded-xl" onClick={onSave}>
            <Save className="h-4 w-4 mr-1" />
            Lưu nháp (máy này)
          </Button>

          <Button
            className="rounded-xl bg-primary shadow hover:opacity-95 text-primary-foreground font-semibold"
            disabled={isPublishing}
            onClick={onPublishToGitHub}
          >
            {isPublishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Đang commit lên GitHub...
              </>
            ) : (
              <>
                <CloudUpload className="h-4 w-4 mr-1.5" />
                Xuất bản lên GitHub
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Thông báo cơ chế lưu trữ & đồng bộ đa thiết bị */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground/80">
        <div className="flex items-start gap-2">
          <span className="font-bold text-primary">🚀 Cơ chế lưu trữ Git-as-CMS:</span>
          <div className="space-y-1">
            <p>
              Bấm <b>&quot;Xuất bản lên GitHub&quot;</b> để hệ thống tự động commit file Markdown
              vào thư mục{" "}
              <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground">
                content/lessons/day-{pad(d.day)}.md
              </code>
              . GitHub sẽ kích hoạt Vercel tự động build và đồng bộ bài học cho mọi người dùng trên
              mọi thiết bị.
            </p>
            <p className="text-muted-foreground">
              Nút <b>&quot;Lưu nháp (máy này)&quot;</b> chỉ lưu tạm vào trình duyệt hiện tại để bạn
              chỉnh sửa tiếp mà chưa muốn công khai.
            </p>
          </div>
        </div>
      </div>

      {/* Metadata Form Section */}
      <section className="card-soft grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Ngày học (1–100)">
          <select
            className={selectCls}
            value={d.day}
            onChange={(e) => set("day", Number(e.target.value))}
          >
            {Array.from({ length: TOTAL_DAYS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Ngày {pad(n)}
                {getLesson(n) ? " • đã có" : ""}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Tiêu đề bài học" className="sm:col-span-1 lg:col-span-3">
          <Input
            className="bg-card"
            value={d.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="VD: Giới thiệu bản thân bằng tiếng Anh"
          />
        </Field>

        <Field label="Ngày ghi chép">
          <Input
            className="bg-card"
            type="date"
            value={d.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </Field>

        <Field label="Chủ đề kỹ năng">
          <select
            className={selectCls}
            value={d.category}
            onChange={(e) => set("category", e.target.value)}
          >
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Trình độ mục tiêu">
          <select
            className={selectCls}
            value={d.level}
            onChange={(e) => set("level", e.target.value)}
          >
            {(LEVELS.includes(d.level) || !d.level ? LEVELS : [...LEVELS, d.level]).map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Thời lượng học (phút)">
          <Input
            className="bg-card"
            type="number"
            min={0}
            value={d.duration}
            onChange={(e) => set("duration", Number(e.target.value) || 0)}
          />
        </Field>

        <Field label="Trạng thái hoàn thành">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => set("completed", true)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md border py-2 text-xs font-semibold transition-all",
                d.completed
                  ? "border-primary bg-primary text-primary-foreground shadow"
                  : "border-input bg-card text-muted-foreground hover:bg-accent",
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Đã xong
            </button>
            <button
              type="button"
              onClick={() => set("completed", false)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md border py-2 text-xs font-semibold transition-all",
                !d.completed
                  ? "border-chart-4 bg-chart-4 text-white shadow"
                  : "border-input bg-card text-muted-foreground hover:bg-accent",
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              Đang học
            </button>
          </div>
        </Field>

        <Field label="Link PDF Google Drive" className="sm:col-span-2">
          <div className="relative">
            <Input
              className="bg-card pr-20"
              value={d.pdfUrl}
              onChange={(e) => set("pdfUrl", e.target.value)}
              placeholder="https://drive.google.com/file/d/.../view"
            />
            {d.pdfUrl && (
              <span
                className={cn(
                  "absolute right-2 top-2 rounded px-2 py-0.5 text-[10px] font-semibold",
                  hasDriveId ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                )}
              >
                {hasDriveId ? "Hợp lệ" : "Sai định dạng"}
              </span>
            )}
          </div>
        </Field>

        <Field label="Mô tả ngắn" className="sm:col-span-1 lg:col-span-4">
          <Input
            className="bg-card"
            value={d.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Tóm tắt ngắn gọn nội dung bài học..."
          />
        </Field>

        {existing && existing.title !== initial.title && (
          <p className="text-xs text-warm-foreground sm:col-span-2 lg:col-span-4">
            ⚠️ Ngày {pad(d.day)} đã có bài “{existing.title}”. Khi lưu hoặc xuất file, bài viết này
            sẽ cập nhật bài cũ.
          </p>
        )}
      </section>

      {/* Markdown Toolbar & Quick Insertion */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-card p-3 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Chèn nhanh mẫu:
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-lg text-xs"
            onClick={() => insertSnippet(VOCAB_TEMPLATE)}
          >
            <TableProperties className="h-3.5 w-3.5 mr-1" />+ Bảng từ vựng
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-lg text-xs"
            onClick={() => insertSnippet(GOALS_TEMPLATE)}
          >
            <ListPlus className="h-3.5 w-3.5 mr-1" />+ Mục tiêu
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-lg text-xs"
            onClick={() => insertSnippet(GRAMMAR_TEMPLATE)}
          >
            <Sparkles className="h-3.5 w-3.5 mr-1" />+ Mẫu câu & Ngữ pháp
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="rounded-lg text-xs"
            onClick={() => insertSnippet(SUMMARY_TEMPLATE)}
          >
            <FileCheck2 className="h-3.5 w-3.5 mr-1" />+ Tổng kết
          </Button>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 font-semibold text-secondary-foreground">
            📖 {detectedVocab} từ vựng
          </span>
          <span>{d.content.length} ký tự</span>
        </div>
      </div>

      {/* Editor & Preview Split View */}
      <div className="flex gap-1 rounded-xl bg-muted p-1 lg:hidden">
        {(["edit", "preview"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-sm",
              tab === t && "bg-card font-semibold shadow",
            )}
          >
            {t === "edit" ? "Soạn thảo Markdown" : "Xem trước trực tiếp"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section
          className={cn(
            "card-soft flex flex-col overflow-hidden",
            tab !== "edit" && "hidden lg:flex",
          )}
        >
          <div className="flex items-center justify-between border-b px-4 py-3 text-sm font-semibold">
            <span>Nội dung Markdown</span>
            <span className="text-xs font-normal text-muted-foreground">
              Hỗ trợ đầy đủ GitHub Flavored Markdown (GFM)
            </span>
          </div>
          <Textarea
            value={d.content}
            onChange={(e) => set("content", e.target.value)}
            spellCheck={false}
            placeholder="# Day 01 - Introduce Yourself&#10;&#10;## 1. Mục tiêu bài học&#10;- [ ] Giới thiệu bản thân...&#10;&#10;## 2. Từ vựng&#10;| English | Pronunciation | Vietnamese |&#10;|---|---|---|"
            className="min-h-[60vh] flex-1 resize-y rounded-none border-0 bg-card font-mono text-sm shadow-none focus-visible:ring-0"
          />
        </section>

        <section
          className={cn("card-soft overflow-hidden", tab !== "preview" && "hidden lg:block")}
        >
          <div className="flex items-center gap-2 border-b px-4 py-3 text-sm font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Xem trước hiển thị thực tế
          </div>
          <div className="max-h-[70vh] overflow-y-auto p-6">
            {d.content.trim() ? (
              <MarkdownRenderer content={d.content} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Nội dung Markdown sẽ được hiển thị trực tiếp tại đây...
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Modal Full Public Preview */}
      {publicView && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-md">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background/90 px-6 py-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 font-bold">
              <Eye className="h-5 w-5 text-primary" />
              <span>Xem trước như trang Public cho học viên</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPublicView(false)}>
              <X className="h-4 w-4 mr-1" />
              Đóng xem trước
            </Button>
          </div>
          <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                  Ngày {pad(d.day)}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    d.completed ? "bg-primary/15 text-primary" : "bg-chart-4/15 text-chart-4",
                  )}
                >
                  {d.completed ? "Đã hoàn thành" : "Đang học"}
                </span>
              </div>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight">
                Ngày {pad(d.day)}: {d.title || "(Chưa có tiêu đề)"}
              </h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                {d.date && (
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(d.date)}
                  </span>
                )}
                {d.duration > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {d.duration} phút
                  </span>
                )}
                {d.level && (
                  <span className="flex items-center gap-1 rounded-full bg-warm px-2.5 py-0.5 text-warm-foreground">
                    <Gauge className="h-4 w-4" />
                    {d.level}
                  </span>
                )}
                <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-secondary-foreground">
                  <Tag className="h-4 w-4" />
                  {d.category}
                </span>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <PdfViewer url={d.pdfUrl} />
              <div className="card-soft p-6">
                <div className="mb-4 flex items-center gap-2 border-b pb-3 font-semibold">
                  <FileText className="h-5 w-5 text-primary" />
                  Nội dung ghi chú & Bài học
                </div>
                <MarkdownRenderer content={d.content} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
