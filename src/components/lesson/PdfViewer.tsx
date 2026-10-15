import { ExternalLink, FileText, Download, FileWarning } from "lucide-react";
import { getDriveDownloadUrl, getDrivePreviewUrl, getDriveViewUrl } from "@/lib/google-drive";
import { Button } from "@/components/ui/button";

export function PdfViewer({ url }: { url: string }) {
  const preview = getDrivePreviewUrl(url);
  const view = getDriveViewUrl(url);
  const download = getDriveDownloadUrl(url);
  return (
    <div className="card-soft flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex items-center gap-2 font-semibold">
          <FileText className="h-5 w-5 text-destructive" /> Tài liệu gốc từ trung tâm
        </div>
        <div className="flex gap-1">
          {download && (
            <Button variant="ghost" size="sm" asChild>
              <a href={download} target="_blank" rel="noreferrer"><Download className="h-4 w-4" /> Tải PDF</a>
            </Button>
          )}
          {view && (
            <Button variant="ghost" size="sm" asChild>
              <a href={view} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Drive</a>
            </Button>
          )}
        </div>
      </div>
      {preview ? (
        <iframe src={preview} title="PDF" className="min-h-[520px] w-full flex-1 bg-muted" allow="autoplay" />
      ) : (
        <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center gap-2 bg-muted/60 p-6 text-center text-sm text-muted-foreground">
          <FileWarning className="h-8 w-8 text-primary/60" />
          <p className="font-medium text-foreground">Không thể xem trước tài liệu</p>
          <p>{url ? "Link Google Drive chưa đúng định dạng hoặc file chưa được chia sẻ." : "Bài học này chưa có link PDF."}</p>
        </div>
      )}
    </div>
  );
}
