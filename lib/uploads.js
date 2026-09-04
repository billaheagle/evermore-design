import { unlink } from "node:fs/promises";
import path from "node:path";

// Removes an uploaded file from `public/uploads/`. Silently ignores anything
// that isn't an /uploads/ path (e.g. the bundled /img/ seed assets or remote
// URLs) and missing files.
export async function deleteUploadedFile(url) {
  if (typeof url !== "string") return;
  const clean = url.split("?")[0].split("#")[0];
  if (!clean.startsWith("/uploads/")) return;

  const name = path.basename(clean);
  if (!name || name.includes("..")) return;

  try {
    await unlink(path.join(process.cwd(), "public", "uploads", name));
  } catch {
    // already gone, or never on this disk — nothing to do
  }
}

export async function deleteUploadedFiles(urls) {
  await Promise.all((urls || []).map(deleteUploadedFile));
}
