import { del } from "@vercel/blob";

// Removes an image that was uploaded through /api/admin/upload (a Vercel Blob
// URL). Silently ignores anything else — the bundled /img/ seed assets, remote
// URLs (Unsplash), or already-deleted blobs.
export async function deleteUploadedFile(url) {
  if (typeof url !== "string") return;
  const clean = url.split("?")[0].split("#")[0];
  if (!/^https?:\/\/[^/]+\.blob\.vercel-storage\.com\//.test(clean)) return;

  try {
    await del(clean);
  } catch {
    // already gone, or the token is missing — nothing to do
  }
}

export async function deleteUploadedFiles(urls) {
  await Promise.all((urls || []).map(deleteUploadedFile));
}
