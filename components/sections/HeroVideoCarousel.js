"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const SWIPE_PX = 40;

const pad = (n) => String(n).padStart(2, "0");

// The homepage hero's clip carousel. Each video advances to the next when it
// ends; only the current clip and the one after it are given a `src`, so a
// visitor downloads one or two clips up front instead of all five. Playback
// stops while the hero is off-screen or the tab is hidden, and under
// reduced-motion nothing autoplays — the poster shows until they press play.
export default function HeroVideoCarousel({ videos }) {
  const reduce = useReducedMotion();
  const count = videos.length;
  const multi = count > 1;

  const [index, setIndex] = useState(0);
  // null = no choice made yet: play, unless the visitor prefers reduced
  // motion. Pressing play/pause records an explicit choice.
  const [paused, setPaused] = useState(null);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  // Slides that have been handed a src stay loaded, so going back is instant.
  const [loaded, setLoaded] = useState(() => new Set(multi ? [0, 1] : [0]));

  const rootRef = useRef(null);
  const videoRefs = useRef([]);
  const pointerX = useRef(null);

  const userPaused = paused ?? Boolean(reduce);
  const shouldPlay = !userPaused && onScreen && tabVisible;

  const go = useCallback(
    (next) => {
      const i = (next + count) % count;
      setIndex(i);
      setProgress(0);
      setLoaded((prev) => {
        const s = new Set(prev);
        s.add(i);
        if (multi) s.add((i + 1) % count);
        return s;
      });
    },
    [count, multi]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), {
      threshold: 0.25,
    });
    io.observe(el);
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Play the current clip, pause the rest. A clip is rewound when it becomes
  // current so every slide starts from its first frame.
  const prevIndex = useRef(index);
  useEffect(() => {
    const changed = prevIndex.current !== index;
    prevIndex.current = index;
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i !== index) {
        v.pause();
        return;
      }
      if (changed) v.currentTime = 0;
      if (shouldPlay) {
        // Autoplay can still be refused (e.g. iOS Low Power Mode) — fall back
        // to the paused state so the play button is offered. An AbortError
        // just means a pause() interrupted this play(), which is fine.
        v.play().catch((err) => {
          if (err?.name === "NotAllowedError") setPaused(true);
        });
      } else {
        v.pause();
      }
    });
  }, [index, shouldPlay, loaded]);

  function onTimeUpdate(i, e) {
    if (i !== index) return;
    const v = e.currentTarget;
    if (v.duration) setProgress(v.currentTime / v.duration);
  }

  function onEnded(i) {
    if (i === index && multi) go(index + 1);
  }

  function onKeyDown(e) {
    if (!multi) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
  }

  function onPointerDown(e) {
    pointerX.current = e.clientX;
  }

  function onPointerUp(e) {
    if (pointerX.current === null || !multi) return;
    const dx = e.clientX - pointerX.current;
    pointerX.current = null;
    if (Math.abs(dx) >= SWIPE_PX) go(index + (dx < 0 ? 1 : -1));
  }

  const current = videos[index];
  // Reserve the caption row whenever any slide has one, so the controls don't
  // jump up and down as slides change.
  const anyCaption = videos.some((v) => v.caption || v.note || v.href);
  const hasCaption = current.caption || current.note || current.href;

  return (
    <section
      ref={rootRef}
      aria-roledescription="carousel"
      aria-label="Featured work in motion"
      onKeyDown={onKeyDown}
      className="flex flex-col gap-3 sm:gap-3.5"
    >
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (pointerX.current = null)}
        className="relative aspect-video w-full touch-pan-y select-none overflow-hidden bg-noir"
      >
        {videos.map((v, i) => (
          <video
            key={v.id}
            ref={(el) => {
              videoRefs.current[i] = el;
              if (el) el.defaultMuted = true;
            }}
            src={loaded.has(i) ? v.src : undefined}
            poster={v.poster || undefined}
            muted
            playsInline
            loop={!multi}
            preload={i === index ? "auto" : "metadata"}
            disablePictureInPicture
            aria-hidden={i !== index}
            onTimeUpdate={(e) => onTimeUpdate(i, e)}
            onEnded={() => onEnded(i)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
              i === index ? "opacity-100" : "opacity-0"
            )}
          />
        ))}

        <button
          type="button"
          onClick={() => setPaused(!userPaused)}
          aria-label={userPaused ? "Play video" : "Pause video"}
          className="absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center text-bone sm:bottom-3 sm:right-3"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-bone/40 bg-noir/35 backdrop-blur-sm transition-colors hover:bg-noir/60 sm:h-11 sm:w-11">
            {userPaused ? (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                <path d="M4 2.5L11.5 7L4 11.5Z" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M4.5 2.5V11.5M9.5 2.5V11.5" />
              </svg>
            )}
          </span>
        </button>
      </div>

      {anyCaption && (
        <div className="flex min-h-[1.5rem] items-baseline justify-between gap-4" aria-live="polite">
          {hasCaption && (
            <>
              <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3.5">
                {current.caption && (
                  <span className="archive-label truncate text-noir/70">{current.caption}</span>
                )}
                {current.note && (
                  <span className="font-display text-[13px] italic text-noir/50">{current.note}</span>
                )}
              </div>
              {current.href && (
                <Link
                  href={current.href}
                  className="shrink-0 whitespace-nowrap border-b border-noir/40 pb-0.5 font-display text-[15px] italic text-noir transition-colors hover:border-clay hover:text-clay"
                >
                  View project →
                </Link>
              )}
            </>
          )}
        </div>
      )}

      {multi && (
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="archive-label shrink-0 tracking-[0.2em] text-noir/55">
            {pad(index + 1)} / {pad(count)}
          </span>
          <div className="flex flex-1 gap-1.5">
            {videos.map((v, i) => (
              <button
                key={v.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show video ${i + 1} of ${count}`}
                aria-current={i === index ? "true" : undefined}
                className="flex h-11 flex-1 items-center"
              >
                <span className="relative block h-0.5 w-full overflow-hidden bg-noir/15">
                  <span
                    className={cn(
                      "absolute inset-y-0 left-0 bg-noir",
                      i === index && "transition-[width] duration-300 ease-linear"
                    )}
                    style={{ width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%" }}
                  />
                </span>
              </button>
            ))}
          </div>
          <div className="flex shrink-0 gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous video"
              className="flex h-11 w-11 items-center justify-center rounded-full text-noir transition-colors hover:text-clay sm:border sm:border-noir/20 sm:hover:border-clay"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                <path d="M10 3L5 8L10 13" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Next video"
              className="flex h-11 w-11 items-center justify-center rounded-full text-noir transition-colors hover:text-clay sm:border sm:border-noir/20 sm:hover:border-clay"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                <path d="M6 3L11 8L6 13" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
