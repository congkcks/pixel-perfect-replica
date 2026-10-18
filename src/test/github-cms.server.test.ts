import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getGitHubConfig,
  getLessonRepoPath,
  saveLessonToGitHub,
  type GitHubCmsConfig,
} from "@/lib/github-cms.server";
import type { LessonDraft } from "@/lib/lesson-file";

const sampleDraft: LessonDraft = {
  day: 99,
  title: "Test Lesson for GitHub CMS",
  date: "2026-10-18",
  duration: 45,
  category: "Giao tiếp",
  level: "B1",
  completed: true,
  pdfUrl: "",
  description: "Test description for automated verification.",
  content: "# Test Content\n\n## 1. Mục tiêu\n- [x] Test goal",
};

describe("github-cms.server", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("formats lesson repo path correctly", () => {
    expect(getLessonRepoPath(1)).toBe("content/lessons/day-001.md");
    expect(getLessonRepoPath(15)).toBe("content/lessons/day-015.md");
    expect(getLessonRepoPath(100)).toBe("content/lessons/day-100.md");
  });

  it("reads config from environment variables", () => {
    process.env["GITHUB_TOKEN"] = "ghp_test_token_123";
    process.env["GITHUB_REPO"] = "owner/custom-repo";
    process.env["GITHUB_BRANCH"] = "production";

    const config: GitHubCmsConfig = getGitHubConfig();
    expect(config.token).toBe("ghp_test_token_123");
    expect(config.repo).toBe("owner/custom-repo");
    expect(config.branch).toBe("production");
  });

  it("commits lesson successfully via GitHub API mock", async () => {
    process.env["GITHUB_TOKEN"] = "ghp_mock_token";
    process.env["GITHUB_REPO"] = "congkcks/pixel-perfect-replica";
    process.env["GITHUB_API_BASE"] = "https://mock.api.github.com";

    // Mock GET (fetch existing file metadata) -> returns 404 (new file)
    // Mock PUT (create file) -> returns 201
    const fetchMock = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "PUT") {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              content: { sha: "new-blob-sha-123" },
              commit: { sha: "new-commit-sha-456" },
            }),
            { status: 201, headers: { "Content-Type": "application/json" } },
          ),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ message: "Not Found" }), { status: 404 }),
      );
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await saveLessonToGitHub(sampleDraft);
    expect(result.success).toBe(true);
    expect(result.sha).toBe("new-blob-sha-123");
    expect(result.commitSha).toBe("new-commit-sha-456");
    expect(result.message).toContain("GitHub");
  });

  it("handles 409 conflict when remote file was changed", async () => {
    process.env["GITHUB_TOKEN"] = "ghp_mock_token";
    process.env["GITHUB_REPO"] = "congkcks/pixel-perfect-replica";
    process.env["GITHUB_API_BASE"] = "https://mock.api.github.com";

    const fetchMock = vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
      if (opts?.method === "PUT") {
        return Promise.resolve(
          new Response(JSON.stringify({ message: "Conflict" }), {
            status: 409,
            headers: { "Content-Type": "application/json" },
          }),
        );
      }
      return Promise.resolve(
        new Response(JSON.stringify({ sha: "existing-sha" }), { status: 200 }),
      );
    });

    vi.stubGlobal("fetch", fetchMock);

    const result = await saveLessonToGitHub(sampleDraft);
    expect(result.success).toBe(false);
    expect(result.message).toContain("Xung đột");
  });
});
