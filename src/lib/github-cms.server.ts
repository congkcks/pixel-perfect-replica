import fs from "node:fs";
import path from "node:path";
import { fileNameFor, pad } from "./lessons-core";
import { draftToMarkdown, type LessonDraft } from "./lesson-file";

export interface GitHubCmsConfig {
  token: string | null;
  repo: string | null; // e.g. "congkcks/pixel-perfect-replica"
  branch: string;
  apiBase: string;
}

export function getGitHubConfig(): GitHubCmsConfig {
  const token = process.env["GITHUB_TOKEN"] || null;

  // Auto-detect repo from explicit env or Vercel Git metadata
  let repo = process.env["GITHUB_REPO"] || null;
  if (!repo) {
    const owner = process.env["VERCEL_GIT_REPO_OWNER"];
    const slug = process.env["VERCEL_GIT_REPO_SLUG"];
    if (owner && slug) {
      repo = `${owner}/${slug}`;
    }
  }

  // Fallback to default user repository if not set
  if (!repo) {
    repo = "congkcks/pixel-perfect-replica";
  }

  const branch = process.env["GITHUB_BRANCH"] || "main";
  const apiBase = process.env["GITHUB_API_BASE"] || "https://api.github.com";

  return { token, repo, branch, apiBase };
}

export function getLessonRepoPath(day: number): string {
  return `content/lessons/${fileNameFor(day)}`;
}

export interface GetFileResult {
  exists: boolean;
  sha: string | null;
  content?: string | undefined;
}

export async function getLessonFileMetadata(day: number): Promise<GetFileResult> {
  const config = getGitHubConfig();
  const filePath = getLessonRepoPath(day);

  if (!config.token) {
    // Local filesystem check
    const localFile = path.join(process.cwd(), filePath);
    if (fs.existsSync(localFile)) {
      const content = fs.readFileSync(localFile, "utf-8");
      return { exists: true, sha: "local-file-sha", content };
    }
    return { exists: false, sha: null };
  }

  const url = `${config.apiBase}/repos/${config.repo}/contents/${filePath}?ref=${encodeURIComponent(config.branch)}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "VuVanHaCong-100Days-English-CMS",
      },
      cache: "no-store",
    });

    if (res.status === 404) {
      return { exists: false, sha: null };
    }

    if (!res.ok) {
      console.error(`[GitHub CMS] Lỗi khi lấy thông tin file (${res.status}):`, await res.text());
      return { exists: false, sha: null };
    }

    const data = (await res.json()) as { sha: string; content?: string; encoding?: string };
    let content: string | undefined;

    if (data.content && data.encoding === "base64") {
      content = Buffer.from(data.content, "base64").toString("utf-8");
    }

    return { exists: true, sha: data.sha, content };
  } catch (err) {
    console.error("[GitHub CMS] Lỗi kết nối GitHub API:", err);
    return { exists: false, sha: null };
  }
}

export interface SaveLessonResult {
  success: boolean;
  sha?: string | undefined;
  commitSha?: string | undefined;
  localSaved?: boolean | undefined;
  message: string;
}

export async function saveLessonToGitHub(
  draft: LessonDraft,
  options?: {
    expectedSha?: string | null | undefined;
    commitMessage?: string | undefined;
  },
): Promise<SaveLessonResult> {
  const config = getGitHubConfig();
  const filePath = getLessonRepoPath(draft.day);
  const markdown = draftToMarkdown(draft);

  // 1. If GITHUB_TOKEN is not configured, save directly to local disk (Development mode)
  if (!config.token) {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(fullPath, markdown, "utf-8");

      return {
        success: true,
        localSaved: true,
        message: `Đã lưu file cục bộ tại ${filePath} (Chưa cấu hình GITHUB_TOKEN trên server).`,
      };
    } catch (err) {
      return {
        success: false,
        message: `Không thể lưu file: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  // 2. Fetch current file SHA if not explicitly provided
  let sha = options?.expectedSha || null;
  if (!sha) {
    const existing = await getLessonFileMetadata(draft.day);
    if (existing.exists && existing.sha) {
      sha = existing.sha;
    }
  }

  // 3. Prepare payload for GitHub Contents API
  const defaultCommit = sha
    ? `feat(lessons): cập nhật bài học Ngày ${pad(draft.day)}: ${draft.title}`
    : `feat(lessons): tạo mới bài học Ngày ${pad(draft.day)}: ${draft.title}`;

  const message = options?.commitMessage?.trim() || defaultCommit;
  const base64Content = Buffer.from(markdown, "utf-8").toString("base64");

  const body: Record<string, unknown> = {
    message,
    content: base64Content,
    branch: config.branch,
  };

  if (sha) {
    body["sha"] = sha;
  }

  const url = `${config.apiBase}/repos/${config.repo}/contents/${filePath}`;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "VuVanHaCong-100Days-English-CMS",
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => ({}))) as {
      content?: { sha: string };
      commit?: { sha: string };
      message?: string;
    };

    if (res.status === 409) {
      return {
        success: false,
        message:
          "Xung đột ghi đè: File bài học này đã được chỉnh sửa trên GitHub bởi phiên làm việc khác. Vui lòng tải lại trước khi lưu.",
      };
    }

    if (!res.ok) {
      return {
        success: false,
        message: `Lỗi GitHub API (${res.status}): ${data.message || "Không thể cập nhật file."}`,
      };
    }

    // Also update local file if running with local working copy
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(path.dirname(fullPath))) {
        fs.writeFileSync(fullPath, markdown, "utf-8");
      }
    } catch {
      // Local copy update is best-effort
    }

    return {
      success: true,
      sha: data.content?.sha,
      commitSha: data.commit?.sha,
      message: `Đã lưu thành công bài học Ngày ${pad(draft.day)} lên GitHub! Vercel sẽ tự động kích hoạt build lại trang web.`,
    };
  } catch (err) {
    console.error("[GitHub CMS] Lỗi khi commit lên GitHub:", err);
    return {
      success: false,
      message: `Lỗi kết nối máy chủ GitHub: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function deleteLessonFromGitHub(
  day: number,
  options?: { sha?: string | null | undefined; commitMessage?: string | undefined },
): Promise<{ success: boolean; message: string }> {
  const config = getGitHubConfig();
  const filePath = getLessonRepoPath(day);

  if (!config.token) {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      return {
        success: true,
        message: `Đã xóa file cục bộ ${filePath} (Chưa cấu hình GITHUB_TOKEN).`,
      };
    } catch (err) {
      return {
        success: false,
        message: `Lỗi xóa file cục bộ: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  let sha = options?.sha || null;
  if (!sha) {
    const existing = await getLessonFileMetadata(day);
    if (!existing.exists || !existing.sha) {
      return { success: false, message: `Bài học Ngày ${pad(day)} không tồn tại trên GitHub.` };
    }
    sha = existing.sha;
  }

  const url = `${config.apiBase}/repos/${config.repo}/contents/${filePath}`;
  const message =
    options?.commitMessage?.trim() || `refactor(lessons): xóa bài học Ngày ${pad(day)}`;

  try {
    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${config.token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "VuVanHaCong-100Days-English-CMS",
      },
      body: JSON.stringify({ message, sha, branch: config.branch }),
    });

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      return {
        success: false,
        message: `Lỗi khi xóa bài học trên GitHub (${res.status}): ${data.message || ""}`,
      };
    }

    try {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    } catch {
      // Best-effort
    }

    return {
      success: true,
      message: `Đã xóa bài học Ngày ${pad(day)} trên GitHub. Vercel sẽ tự động build lại website.`,
    };
  } catch (err) {
    return {
      success: false,
      message: `Lỗi kết nối GitHub: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
