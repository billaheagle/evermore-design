"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

const SWIPE_PX = 40;
// sessionStorage flag: the full-screen intro has already been shown this visit.
const INTRO_KEY = "evermore:hero-intro-seen";

const pad = (n) => String(n).padStart(2, "0");

// Phones and portrait tablets held upright — where a portrait cut of a clip
// (if one was uploaded) fits the frame better than the landscape original.
function usePortraitScreen() {
  const [portrait, setPortrait] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait) and (max-width: 1023px)");
    const sync = () => setPortrait(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return portrait;
}

// The homepage hero's clip carousel. On a visitor's first homepage view of a
// session it opens as a full-screen intro; closing it (✕, Esc, or scrolling
// down) drops the same clip, at the same moment, back into the hero frame,
// and the frame's expand button reopens it. Clips start muted — browsers
// refuse to autoplay sound — and one tap on the sound button unmutes every
// clip after it. Each clip advances when it ends; only the current clip and
// the next are downloaded. Playback stops while the hero is off-screen or
// the tab is hidden, and under reduced motion nothing autoplays and the
// intro is skipped.
export default function HeroVideoCarousel({ videos }) {
  const reduce = useReducedMotion();
  const portrait = usePortraitScreen();
  const count = videos.length;
  const multi = count > 1;

  const [index, setIndex] = useState(0);
  // null = no choice made yet: play, unless the visitor prefers reduced
  // motion. Pressing play/pause records an explicit choice.
  const [paused, setPaused] = useState(null);
  const [muted, setMuted] = useState(true);
  const [full, setFull] = useState(false);
  // Until the intro decision is made (after mount — it reads sessionStorage)
  // neither player is in charge, so a clip only starts loading in the one
  // that will actually show it.
  const [introChecked, setIntroChecked] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  const rootRef = useRef(null);
  // Playback position of the current clip, shared by the inline and
  // full-screen players so switching between them resumes where it was.
  const timeRef = useRef(0);
  // The <video> currently in charge — unmuting touches it directly so the
  // change happens inside the click (iOS requires that).
  const activeRef = useRef(null);
  const wantNativeFs = useRef(false);

  const userPaused = paused ?? Boolean(reduce);
  const inlinePlaying = !full && !userPaused && onScreen && tabVisible;
  const fullPlaying = full && !userPaused && tabVisible;

  const go = useCallback(
    (next) => {
      setIndex((next + count) % count);
      timeRef.current = 0;
      setProgress(0);
    },
    [count]
  );

  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

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

  // First homepage view of the visit: open as the full-screen intro.
  useEffect(() => {
    setIntroChecked(true);
    if (reduce) return;
    try {
      if (sessionStorage.getItem(INTRO_KEY)) return;
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // storage blocked — show the intro, just without remembering it
    }
    setFull(true);
    // Mount-only: the intro is a first-impression thing, not a reaction to
    // the reduced-motion setting changing later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openFull() {
    // A click is the one moment the browser allows real full screen, so ask
    // for it too (hides the address bar); the overlay works without it.
    wantNativeFs.current = true;
    setFull(true);
  }

  const closeFull = useCallback(() => {
    wantNativeFs.current = false;
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
    setFull(false);
  }, []);

  function toggleMute() {
    const nextMuted = !muted;
    const v = activeRef.current;
    if (v) {
      v.muted = nextMuted;
      if (!nextMuted && v.paused && !userPaused) v.play().catch(() => {});
    }
    setMuted(nextMuted);
  }

  // Autoplay refused: with sound, fall back to muted; already muted (e.g.
  // iOS Low Power Mode), fall back to paused so the play button is offered.
  const onBlocked = useCallback(() => {
    if (!muted) setMuted(true);
    else setPaused(true);
  }, [muted]);

  const onEnded = useCallback(() => {
    if (multi) next();
  }, [multi, next]);

  const stageProps = {
    videos,
    index,
    muted,
    portrait,
    timeRef,
    activeRef,
    onProgress: setProgress,
    onEnded,
    onBlocked,
  };

  const controls = {
    videos,
    index,
    count,
    multi,
    progress,
    muted,
    userPaused,
    go,
    next,
    prev,
    toggleMute,
    togglePause: () => setPaused(!userPaused),
  };

  const swipe = useSwipe({ onLeft: multi ? next : null, onRight: multi ? prev : null });

  function onKeyDown(e) {
    if (!multi) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  }

  const anyCaption = videos.some((v) => v.caption || v.note || v.href);

  return (
    <>
      <section
        ref={rootRef}
        aria-roledescription="carousel"
        aria-label="Featured work in motion"
        onKeyDown={onKeyDown}
        className="flex flex-col gap-3 sm:gap-3.5 max-lg:portrait:flex-1"
      >
        {/* 16:9 in general; on an upright phone the frame grows to fill the
            hero's leftover height instead of leaving a gap under it. */}
        <div
          {...swipe}
          className="relative aspect-video w-full touch-pan-y select-none overflow-hidden bg-noir max-lg:portrait:aspect-auto max-lg:portrait:min-h-[16rem] max-lg:portrait:flex-1"
        >
          <Stage {...stageProps} inCharge={introChecked && !full} playing={inlinePlaying} />

          <FrameButton
            onClick={openFull}
            label="Open full screen"
            className="right-1 top-1 sm:right-3 sm:top-3"
          >
            <ExpandIcon />
          </FrameButton>
          <FrameButton
            onClick={toggleMute}
            label={muted ? "Turn sound on" : "Turn sound off"}
            className="bottom-1 left-1 sm:bottom-3 sm:left-3"
          >
            {muted ? <SoundOffIcon /> : <SoundOnIcon />}
          </FrameButton>
          <FrameButton
            onClick={controls.togglePause}
            label={userPaused ? "Play video" : "Pause video"}
            className="bottom-1 right-1 sm:bottom-3 sm:right-3"
          >
            {userPaused ? <PlayIcon /> : <PauseIcon />}
          </FrameButton>
        </div>

        {anyCaption && <Caption video={videos[index]} tone="dark" />}
        {multi && <Controls {...controls} tone="dark" />}
      </section>

      {full &&
        createPortal(
          <FullScreen
            stageProps={stageProps}
            playing={fullPlaying}
            controls={controls}
            anyCaption={anyCaption}
            wantNativeFs={wantNativeFs}
            onClose={closeFull}
          />,
          document.body
        )}
    </>
  );
}

// ── Full-screen player ────────────────────────────────────────────────────

function FullScreen({ stageProps, playing, controls, anyCaption, wantNativeFs, onClose }) {
  const ref = useRef(null);
  const closeRef = useRef(null);
  const { multi, next, prev } = controls;

  const swipe = useSwipe({
    onLeft: multi ? next : null,
    onRight: multi ? prev : null,
    onUp: onClose,
  });

  useEffect(() => {
    const el = ref.current;
    const lastFocus = document.activeElement;
    closeRef.current?.focus({ preventScroll: true });

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    if (wantNativeFs.current && el?.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
    // Leaving the browser's full screen (its own Esc) closes the overlay too.
    const onFsChange = () => {
      if (!document.fullscreenElement && wantNativeFs.current) onClose();
    };
    document.addEventListener("fullscreenchange", onFsChange);

    return () => {
      html.style.overflow = prevOverflow;
      document.removeEventListener("fullscreenchange", onFsChange);
      if (lastFocus instanceof HTMLElement) lastFocus.focus({ preventScroll: true });
    };
  }, [onClose, wantNativeFs]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (multi && e.key === "ArrowRight") next();
      else if (multi && e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, multi, next, prev]);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Featured work in motion"
      onWheel={(e) => e.deltaY > 30 && onClose()}
      {...swipe}
      className="fixed inset-0 z-[200] touch-none select-none overflow-hidden bg-noir text-bone"
    >
      <Stage {...stageProps} inCharge playing={playing} />

      {/* Scrims so the controls read over any footage. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-noir/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-noir/80 to-transparent" />

      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))] md:px-[6vw] md:pt-6">
        <span className="font-display text-lg leading-none tracking-[-0.01em]">
          Evermore <span className="opacity-55">Design</span>
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close full screen"
          className="inline-flex h-11 items-center gap-2 rounded-full border border-bone/35 bg-noir/30 pl-4 pr-3 text-[11px] font-medium uppercase tracking-[0.14em] backdrop-blur-sm transition-colors hover:bg-noir/60"
        >
          Close
          <CloseIcon />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-[6vw] md:pb-8">
        {anyCaption && <Caption video={controls.videos[controls.index]} tone="light" />}
        {/* Phones: slide controls on their own row above sound/pause, so the
            progress bars keep their width. sm+: one row. */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-5">
          {multi && <Controls {...controls} tone="light" className="sm:order-last sm:flex-1" />}
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={controls.toggleMute}
              aria-label={controls.muted ? "Turn sound on" : "Turn sound off"}
              className={cn(
                "inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-bone/35 bg-noir/30 text-[11px] font-medium uppercase tracking-[0.14em] backdrop-blur-sm transition-colors hover:bg-noir/60",
                controls.muted ? "pl-3.5 pr-4" : "w-11 justify-center"
              )}
            >
              {controls.muted ? (
                <>
                  <SoundOffIcon />
                  Sound on
                </>
              ) : (
                <SoundOnIcon />
              )}
            </button>
            <button
              type="button"
              onClick={controls.togglePause}
              aria-label={controls.userPaused ? "Play video" : "Pause video"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-bone/35 bg-noir/30 backdrop-blur-sm transition-colors hover:bg-noir/60"
            >
              {controls.userPaused ? <PlayIcon /> : <PauseIcon />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared pieces ─────────────────────────────────────────────────────────

// The stack of <video> elements for one player. Only the current clip and
// the one after it get a src; a clip that has had one keeps it, so going
// back is instant. When this player takes charge — a new slide, a switch
// between inline and full screen, or a rotation swapping the portrait cut
// in — it seeks to the shared playback position before playing.
function Stage({
  videos,
  index,
  inCharge,
  playing,
  muted,
  portrait,
  timeRef,
  activeRef,
  onProgress,
  onEnded,
  onBlocked,
}) {
  const count = videos.length;
  const refs = useRef([]);
  const loaded = useRef(new Set());
  const seekKey = useRef(null);
  // A player that has never been in charge (the inline one while the intro
  // is open) loads nothing, so the clip isn't downloaded twice.
  const armed = useRef(false);
  if (inCharge) armed.current = true;

  loaded.current.add(index);
  if (count > 1) loaded.current.add((index + 1) % count);

  const srcFor = (v) => (portrait && v.srcPortrait) || v.src;

  useEffect(() => {
    if (!inCharge) seekKey.current = null;
    refs.current.forEach((v, i) => {
      if (!v) return;
      v.muted = muted;
      if (i !== index || !inCharge) {
        v.pause();
        return;
      }
      activeRef.current = v;

      const key = `${index}|${srcFor(videos[i])}`;
      if (seekKey.current !== key) {
        seekKey.current = key;
        const t = timeRef.current;
        const seek = () => {
          try {
            v.currentTime = t;
          } catch {
            // not seekable yet — it just starts from the top
          }
        };
        if (v.readyState >= 1) seek();
        else v.addEventListener("loadedmetadata", seek, { once: true });
      }

      if (playing) {
        // An AbortError only means a pause() interrupted this play().
        v.play().catch((err) => {
          if (err?.name === "NotAllowedError") onBlocked();
        });
      } else {
        v.pause();
      }
    });
    // srcFor depends only on `portrait`, which is listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, inCharge, playing, muted, portrait, videos, timeRef, activeRef, onBlocked]);

  return videos.map((v, i) => {
    const src = srcFor(v);
    return (
      <video
        key={`${v.id}:${src}`}
        ref={(el) => {
          refs.current[i] = el;
          if (el) el.defaultMuted = true;
        }}
        src={armed.current && loaded.current.has(i) ? src : undefined}
        poster={v.poster || undefined}
        muted
        playsInline
        loop={count === 1}
        preload={i === index ? "auto" : "metadata"}
        disablePictureInPicture
        aria-hidden={i !== index}
        onTimeUpdate={(e) => {
          if (!inCharge || i !== index) return;
          const el = e.currentTarget;
          timeRef.current = el.currentTime;
          if (el.duration) onProgress(el.currentTime / el.duration);
        }}
        onEnded={() => inCharge && i === index && onEnded()}
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
          i === index ? "opacity-100" : "opacity-0"
        )}
      />
    );
  });
}

function Caption({ video, tone }) {
  const light = tone === "light";
  const has = video.caption || video.note || video.href;
  // Reserved height keeps the controls from jumping between slides with and
  // without a caption.
  return (
    <div className="flex min-h-[1.5rem] items-baseline justify-between gap-4" aria-live="polite">
      {has && (
        <>
          <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3.5">
            {video.caption && (
              <span className={cn("archive-label truncate", light ? "text-bone/80" : "text-noir/70")}>
                {video.caption}
              </span>
            )}
            {video.note && (
              <span className={cn("font-display text-[13px] italic", light ? "text-bone/60" : "text-noir/50")}>
                {video.note}
              </span>
            )}
          </div>
          {video.href && (
            <Link
              href={video.href}
              className={cn(
                "shrink-0 whitespace-nowrap border-b pb-0.5 font-display text-[15px] italic transition-colors hover:border-clay hover:text-clay",
                light ? "border-bone/50 text-bone" : "border-noir/40 text-noir"
              )}
            >
              View project →
            </Link>
          )}
        </>
      )}
    </div>
  );
}

function Controls({ videos, index, count, progress, go, next, prev, tone, className }) {
  const light = tone === "light";
  return (
    <div className={cn("flex items-center gap-3 sm:gap-5", className)}>
      <span
        className={cn(
          "archive-label shrink-0 tracking-[0.2em]",
          light ? "text-bone/70" : "text-noir/55"
        )}
      >
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
            <span
              className={cn(
                "relative block h-0.5 w-full overflow-hidden",
                light ? "bg-bone/25" : "bg-noir/15"
              )}
            >
              <span
                className={cn(
                  "absolute inset-y-0 left-0",
                  light ? "bg-bone" : "bg-noir",
                  i === index && "transition-[width] duration-300 ease-linear"
                )}
                style={{ width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%" }}
              />
            </span>
          </button>
        ))}
      </div>
      <div className="flex shrink-0 gap-1 sm:gap-2">
        {[
          { label: "Previous video", onClick: prev, d: "M10 3L5 8L10 13" },
          { label: "Next video", onClick: next, d: "M6 3L11 8L6 13" },
        ].map((b) => (
          <button
            key={b.label}
            type="button"
            onClick={b.onClick}
            aria-label={b.label}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:text-clay sm:border sm:hover:border-clay",
              light ? "text-bone sm:border-bone/35" : "text-noir sm:border-noir/20"
            )}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
              <path d={b.d} />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}

// A 44px hit area with a smaller round chip, laid over the inline frame.
function FrameButton({ onClick, label, className, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn("absolute flex h-11 w-11 items-center justify-center text-bone", className)}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-bone/40 bg-noir/35 backdrop-blur-sm transition-colors hover:bg-noir/60 sm:h-11 sm:w-11">
        {children}
      </span>
    </button>
  );
}

// Horizontal swipes page through clips; an upward swipe fires onUp (used
// to dismiss the full-screen player). Mouse drags count too.
function useSwipe({ onLeft, onRight, onUp }) {
  const start = useRef(null);
  return {
    onPointerDown: (e) => {
      start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e) => {
      if (!start.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) >= SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
        (dx < 0 ? onLeft : onRight)?.();
      } else if (onUp && dy <= -SWIPE_PX * 1.5 && Math.abs(dy) > Math.abs(dx)) {
        onUp();
      }
    },
    onPointerCancel: () => {
      start.current = null;
    },
  };
}

// ── Icons ─────────────────────────────────────────────────────────────────

const iconProps = {
  width: 14,
  height: 14,
  viewBox: "0 0 14 14",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

function PlayIcon() {
  return (
    <svg {...iconProps} fill="currentColor" stroke="none">
      <path d="M4 2.5L11.5 7L4 11.5Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg {...iconProps} strokeWidth={1.5}>
      <path d="M4.5 2.5V11.5M9.5 2.5V11.5" />
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg {...iconProps}>
      <path d="M1.5 5H4L7 2.5V11.5L4 9H1.5Z" />
      <path d="M9.5 5L12.5 9M12.5 5L9.5 9" />
    </svg>
  );
}

function SoundOnIcon() {
  return (
    <svg {...iconProps}>
      <path d="M1.5 5H4L7 2.5V11.5L4 9H1.5Z" />
      <path d="M9.5 4.5C10.3 5.2 10.7 6 10.7 7S10.3 8.8 9.5 9.5M11 3C12.2 4 12.8 5.4 12.8 7S12.2 10 11 11" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg {...iconProps}>
      <path d="M8.5 1.5H12.5V5.5M12.5 1.5L8 6M5.5 12.5H1.5V8.5M1.5 12.5L6 8" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg {...iconProps} strokeWidth={1.5}>
      <path d="M3 3L11 11M11 3L3 11" />
    </svg>
  );
}
