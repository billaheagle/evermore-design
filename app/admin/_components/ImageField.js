"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Lightbox from "@/components/ui/Lightbox";

export async function uploadImage(file) {
  const fd = new FormData();
  fd.set("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}

export default function ImageField({ label, hint, value, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(false);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      {label && (
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-ink/50">
          {label}
        </span>
      )}
      <div className="mt-1.5 flex flex-wrap items-start gap-3">
        {value ? (
          <button
            type="button"
            onClick={() => setZoom(true)}
            title="View full size"
            className="group relative h-24 w-32 shrink-0 overflow-hidden rounded-lg border border-ink/10 bg-ink/5"
          >
            <Image src={value} alt="" fill sizes="128px" className="object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-[10px] font-medium uppercase tracking-wide text-white opacity-0 transition-opacity group-hover:bg-ink/40 group-hover:opacity-100">
              View
            </span>
          </button>
        ) : (
          <div className="relative flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ink/10 bg-ink/5">
            <span className="font-mono text-[9px] uppercase tracking-wide text-ink/30">
              No image
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="rounded-full border border-ink/15 px-3.5 py-2 text-xs text-ink/80 hover:border-ink/40 disabled:opacity-50"
            >
              {busy ? "Uploading…" : value ? "Replace" : "Upload"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-full border border-ink/15 px-3.5 py-2 text-xs text-ink/50 hover:border-ink/40"
              >
                Remove
              </button>
            )}
          </div>
          {hint && <p className="text-[11px] text-ink/40">{hint}</p>}
          {value && (
            <p className="truncate font-mono text-[10px] text-ink/35">{value}</p>
          )}
          {error && <p className="text-[11px] text-red-700">{error}</p>}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          onChange={handleFile}
          className="hidden"
        />
      </div>

      {zoom && value && (
        <Lightbox images={[value]} onClose={() => setZoom(false)} />
      )}
    </div>
  );
}
