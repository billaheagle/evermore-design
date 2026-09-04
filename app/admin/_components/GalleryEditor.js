"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadImage } from "./ImageField";
import Lightbox from "@/components/ui/Lightbox";

export default function GalleryEditor({ items, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [viewer, setViewer] = useState(null);

  function update(next) {
    onChange(next);
  }

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setError("");
    setBusy(true);
    try {
      const urls = [];
      for (const file of files) {
        urls.push(await uploadImage(file));
      }
      update([...items, ...urls.map((src) => ({ src, wide: false }))]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function removeAt(i) {
    update(items.filter((_, idx) => idx !== i));
  }
  function toggleWide(i) {
    update(items.map((it, idx) => (idx === i ? { ...it, wide: !it.wide } : it)));
  }
  function move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-ink/50">
          Gallery ({items.length})
        </span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="rounded-full border border-ink/15 px-3 py-1.5 text-xs text-ink/80 hover:border-ink/40 disabled:opacity-50"
        >
          {busy ? "Uploading…" : "+ Add images"}
        </button>
      </div>
      {error && <p className="mt-2 text-[11px] text-red-700">{error}</p>}

      {items.length === 0 ? (
        <p className="mt-3 rounded-xl border border-dashed border-ink/15 p-6 text-center text-xs text-ink/40">
          No gallery images.
        </p>
      ) : (
        <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it, i) => (
            <li
              key={it.src}
              className="overflow-hidden rounded-xl border border-ink/10 bg-white/60"
            >
              <button
                type="button"
                onClick={() => setViewer(i)}
                title="View full size"
                className="group relative block aspect-[4/3] w-full bg-ink/5"
              >
                <Image src={it.src} alt="" fill sizes="200px" className="object-cover" />
                <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-[10px] font-medium uppercase tracking-wide text-white opacity-0 transition-opacity group-hover:bg-ink/40 group-hover:opacity-100">
                  View
                </span>
              </button>
              <div className="flex flex-wrap items-center gap-1.5 p-2">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  className="rounded border border-ink/10 px-2 py-1 text-xs text-ink/50 disabled:opacity-30"
                  disabled={i === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  className="rounded border border-ink/10 px-2 py-1 text-xs text-ink/50 disabled:opacity-30"
                  disabled={i === items.length - 1}
                >
                  ↓
                </button>
                <label className="ml-1 flex items-center gap-1.5 text-[11px] text-ink/60">
                  <input
                    type="checkbox"
                    checked={it.wide}
                    onChange={() => toggleWide(i)}
                    className="h-3.5 w-3.5"
                  />
                  Wide
                </label>
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  className="ml-auto rounded border border-red-200 px-2 py-1 text-xs text-red-700"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        multiple
        onChange={handleFiles}
        className="hidden"
      />

      {viewer !== null && (
        <Lightbox
          images={items.map((it) => it.src)}
          startIndex={viewer}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}
