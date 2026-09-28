import { handleUpload } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Videos are too big to stream through a function (Vercel caps request
// bodies at ~4.5 MB), so the browser uploads them straight to Vercel Blob.
// This route only hands out the short-lived upload token; the proxy already
// guarantees the caller has an admin session. There is no completion
// callback — the admin form saves the returned URL itself.
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON" }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime"],
        maximumSizeInBytes: MAX_BYTES,
        addRandomSuffix: true,
      }),
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Video upload token failed:", err);
    return NextResponse.json(
      {
        error: `Upload failed: ${err?.message || err}`,
        hasToken: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      },
      { status: 400 }
    );
  }
}
