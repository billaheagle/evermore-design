"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Fullscreen image viewer. Mount it when you want it open, unmount to close.
 *
 *   {viewer !== null && (
 *     <Lightbox images={imgs} startIndex={viewer} onClose={() => setViewer(null)} />
 *   )}
 *
 * `images` is an array of `string` URLs or `{ src, alt }` objects.
 */
export default function Lightbox({ images, startIndex = 0, onClose }) {
  const list = (images || []).map((im) =>
    typeof im === "string" ? { src: im, alt: "" } : im
  );
  const [index, setIndex] = useState(
    Math.min(Math.max(0, startIndex), Math.max(0, list.length - 1))
  );

  const many = list.length > 1;
  const go = useCallback(
    (dir) => setIndex((i) => (i + dir + list.length) % list.length),
    [list.length]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      else if (e.key === "ArrowRight" && many) go(1);
      else if (e.key === "ArrowLeft" && many) go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, many, onClose]);

  if (!list.length) return null;
  const current = list[index];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: "rgba(14, 12, 10, 0.94)" }}
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {many && (
        <>
          <NavArrow side="left" onClick={(e) => { e.stopPropagation(); go(-1); }} />
          <NavArrow side="right" onClick={(e) => { e.stopPropagation(); go(1); }} />
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
            {index + 1} / {list.length}
          </p>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={current.src}
        src={current.src}
        alt={current.alt || ""}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85svh] max-w-[94vw] object-contain shadow-2xl"
      />
    </div>
  );
}

function NavArrow({ side, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={
        "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 text-white/80 transition-colors hover:bg-white/10 hover:text-white " +
        (side === "left" ? "left-4" : "right-4")
      }
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        {side === "left" ? (
          <path d="M10 2L4 8L10 14" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M6 2L12 8L6 14" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
