"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { upload } from "@vercel/blob/client";
import { saveHeroVideoAction } from "@/app/admin/actions";
import ImageField, { uploadImage } from "./ImageField";
import StatusSegments from "./StatusSegments";

const MAX_BYTES = 50 * 1024 * 1024; // must match /api/admin/video-upload
const HEAVY_BYTES = 8 * 1024 * 1024;
const ACCEPT = ["video/mp4", "video/webm", "video/quicktime"];

function slugifyBase(name) {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "video"
  );
}

// Reads the clip's size/duration and grabs a frame just past the start as a
// JPEG poster — done on the local file, before upload, so there is no
// cross-origin canvas taint to worry about.
function probeVideo(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;

    const done = (result) => {
      URL.revokeObjectURL(url);
      resolve(result);
    };

    video.onerror = () => done(null);
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.1, (video.duration || 1) / 2);
    };
    video.onseeked = () => {
      const meta = {
        width: video.videoWidth,
        height: video.videoHeight,
        duration: video.duration,
        poster: null,
      };
      const scale = Math.min(1, 1920 / (video.videoWidth || 1920));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      try {
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              meta.poster = new File([blob], `${slugifyBase(file.name)}-poster.jpg`, {
                type: "image/jpeg",
              });
            }
            done(meta);
          },
          "image/jpeg",
          0.82
        );
      } catch {
        done(meta);
      }
    };
  });
}

// One video slot: pick → checks → direct-to-Blob upload with progress.
// `orientation` is what this slot expects, for the warning when a file
// doesn't match. `onUploaded(url, meta)` also gets the probe (incl. a
// poster frame).
function VideoUploadField({ label, hint, value, orientation, onUploaded, onRemove }) {
  const [progress, setProgress] = useState(null); // null = idle, 0–100 = uploading
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const uploading = progress !== null;

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setWarnings([]);

    if (!ACCEPT.includes(file.type)) {
      setError(`Unsupported file type: ${file.type || "unknown"}. Use MP4 or WebM.`);
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File is larger than 50 MB. Compress it first.");
      return;
    }

    const meta = await probeVideo(file);
    const notes = [];
    if (file.size > HEAVY_BYTES) {
      notes.push(
        `This file is ${(file.size / 1024 / 1024).toFixed(1)} MB. Under about 4 MB keeps the homepage fast.`
      );
    }
    if (meta?.width && meta?.height) {
      const isPortrait = meta.height > meta.width;
      if (orientation === "landscape" && isPortrait) {
        notes.push("This clip is portrait. This slot is for the landscape version; add it as the portrait version below instead.");
      } else if (orientation === "portrait" && !isPortrait) {
        notes.push("This clip is landscape. This slot is for an upright (portrait) version.");
      }
    }
    if (meta?.duration && (meta.duration < 5 || meta.duration > 20)) {
      notes.push(`This clip is ${Math.round(meta.duration)} s long. 10–15 s works best.`);
    }
    setWarnings(notes);

    setProgress(0);
    try {
      const ext = file.type === "video/webm" ? "webm" : file.type === "video/quicktime" ? "mov" : "mp4";
      const blob = await upload(`hero-videos/${slugifyBase(file.name)}.${ext}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/video-upload",
        contentType: file.type,
        multipart: file.size > HEAVY_BYTES,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      await onUploaded(blob.url, meta);
    } catch (err) {
      setError(err?.message || "Upload failed");
    } finally {
      setProgress(null);
    }
  }

  const frame = orientation === "portrait" ? "aspect-[9/16] w-32" : "aspect-video w-full sm:w-80";

  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-widest2 text-ink/50">{label}</span>
      <div className="mt-1.5 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className={`relative shrink-0 overflow-hidden rounded-xl border border-ink/10 bg-noir ${frame}`}>
          {value ? (
            <video
              key={value}
              src={value}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-wide text-bone/40">
              No video
            </span>
          )}
          {uploading && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-bone/20">
              <div className="h-full bg-copper transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-full border border-ink/15 px-3.5 py-2 text-xs text-ink/80 hover:border-ink/40 disabled:opacity-50"
            >
              {uploading ? `Uploading… ${progress}%` : value ? "Replace video" : "Choose video"}
            </button>
            {value && onRemove && !uploading && (
              <button
                type="button"
                onClick={onRemove}
                className="rounded-full border border-ink/15 px-3.5 py-2 text-xs text-ink/50 hover:border-ink/40"
              >
                Remove
              </button>
            )}
          </div>
          {hint && <p className="text-[11px] text-ink/40">{hint}</p>}
          {warnings.map((w) => (
            <p key={w} className="text-[11px] text-amber-700">{w}</p>
          ))}
          {error && <p className="text-[11px] text-red-700">{error}</p>}
          {value && <p className="truncate font-mono text-[10px] text-ink/35">{value}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          onChange={handleFile}
          className="hidden"
        />
      </div>
    </div>
  );
}

// `projects`: [{ id, name, status }] for the optional link dropdown.
export default function HeroVideoForm({ initial, projects = [] }) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState({
    src: initial?.src || "",
    srcPortrait: initial?.srcPortrait || "",
    poster: initial?.poster || "",
    caption: initial?.caption || "",
    note: initial?.note || "",
    projectId: initial?.projectId || "",
    status: initial?.status || "PUBLISHED",
    // False once the admin picks a poster by hand in this form; until then a
    // new clip brings its own first-frame poster.
    posterAuto: true,
  });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function onMainUploaded(url, meta) {
    // A new clip gets a fresh poster from its own first frame (an old one
    // would flash the previous clip). A poster picked by hand is kept.
    let poster = form.poster;
    if (meta?.poster && form.posterAuto) {
      poster = await uploadImage(meta.poster).catch(() => form.poster);
    }
    setForm((f) => ({ ...f, src: url, poster }));
  }

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await saveHeroVideoAction({
        id: initial?.id,
        src: form.src,
        srcPortrait: form.srcPortrait,
        poster: form.poster,
        caption: form.caption,
        note: form.note,
        projectId: form.projectId,
        status: form.status,
      });
      if (res?.error) setError(res.error);
    });
  }

  const field =
    "mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-copper";
  const labelText =
    "font-mono text-[10px] uppercase tracking-widest2 text-ink/50";
  const optional = <span className="normal-case tracking-normal text-ink/35"> (optional)</span>;

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-ink sm:text-3xl">
          {isEdit ? "Edit hero video" : "Upload hero video"}
        </h1>
        <Link href="/admin/hero-videos" className="text-xs text-ink/50 hover:text-ink">
          ← Back
        </Link>
      </div>

      <StatusSegments value={form.status} onChange={(v) => set("status", v)} />

      <VideoUploadField
        label="Video (landscape) *"
        hint="MP4 or WebM, landscape 16:9, 10–15 s. It starts muted; visitors can turn the sound on. Up to 50 MB, but aim for under 4 MB."
        value={form.src}
        orientation="landscape"
        onUploaded={onMainUploaded}
      />

      <VideoUploadField
        label="Portrait version (optional)"
        hint="An upright 9:16 cut of the same clip, shown on phones held upright. Without one, the landscape video is cropped to its centre there."
        value={form.srcPortrait}
        orientation="portrait"
        onUploaded={(url) => set("srcPortrait", url)}
        onRemove={() => set("srcPortrait", "")}
      />

      <ImageField
        label="Poster (optional)"
        hint="Shown while the video loads. Taken from the video's first frame automatically; replace it to use your own still."
        value={form.poster}
        onChange={(url) => setForm((f) => ({ ...f, poster: url, posterAuto: false }))}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="block">
          <span className={labelText}>Caption{optional}</span>
          <input
            className={field}
            value={form.caption}
            onChange={(e) => set("caption", e.target.value)}
            placeholder="e.g. the project name"
          />
        </label>
        <label className="block">
          <span className={labelText}>Room / note{optional}</span>
          <input
            className={field}
            value={form.note}
            onChange={(e) => set("note", e.target.value)}
            placeholder="e.g. Living room"
          />
        </label>
      </div>

      <label className="block">
        <span className={labelText}>Links to project{optional}</span>
        <select
          className={field}
          value={form.projectId}
          onChange={(e) => set("projectId", e.target.value)}
        >
          <option value="">None: no &ldquo;View project&rdquo; link</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.status === "PUBLISHED" ? "" : ` (${p.status.toLowerCase()}, link hidden until published)`}
            </option>
          ))}
        </select>
      </label>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-ink/10 pt-6">
        <button
          type="submit"
          disabled={pending || !form.src}
          className="rounded-full bg-ink px-6 py-3 text-sm text-parchment hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : "Add video"}
        </button>
        <Link href="/admin/hero-videos" className="text-sm text-ink/50 hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
