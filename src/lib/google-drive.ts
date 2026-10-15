export function extractDriveFileId(url: string): string | null {
  if (!url) return null;
  const byPath = url.match(/\/(?:file\/)?d\/([A-Za-z0-9_-]{10,})/);
  if (byPath) return byPath[1];
  const byQuery = url.match(/[?&]id=([A-Za-z0-9_-]{10,})/);
  if (byQuery) return byQuery[1];
  return null;
}

export function getDrivePreviewUrl(url: string): string | null {
  const id = extractDriveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/preview` : null;
}

export function getDriveViewUrl(url: string): string | null {
  const id = extractDriveFileId(url);
  return id ? `https://drive.google.com/file/d/${id}/view` : url || null;
}

export function getDriveDownloadUrl(url: string): string | null {
  const id = extractDriveFileId(url);
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : null;
}
