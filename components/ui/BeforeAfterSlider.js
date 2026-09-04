"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

export default function BeforeAfterSlider({
  before,
  after,
  beforeAlt = "Before",
  afterAlt = "After",
  className,
  // Mobile-first: a taller, portrait-friendly crop so the room reads well
  // on a phone held upright, gradually widening into a cinematic crop as
  // the viewport grows into tablet/desktop territory. Ratios increase
  // monotonically (0.8 -> 1 -> 1.33 -> 1.6 -> 1.78) so the frame gets
  // progressively less tall, never more, as the screen widens.
  aspect = "aspect-[5/6] xs:aspect-square sm:aspect-[4/3] md:aspect-[16/10] lg:aspect-[16/9]",
}) {
  const frameRef = useRef(null);
  const [percent, setPercent] = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);
  const dragging = useRef(false);

  const updateFromClientX = useCallback((clientX) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPercent(Math.min(98, Math.max(2, pct)));
  }, []);

  const onPointerDown = (e) => {
    dragging.current = true;
    setHasInteracted(true);
    frameRef.current?.setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e) => {
    if (!dragging.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      setHasInteracted(true);
      setPercent((p) => Math.max(2, p - 5));
    } else if (e.key === "ArrowRight") {
      setHasInteracted(true);
      setPercent((p) => Math.min(98, p + 5));
    }
  };

  return (
    <div
      ref={frameRef}
      className={cn(
        "relative w-full select-none overflow-hidden ring-1 ring-inset ring-black/10",
        aspect,
        className
      )}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
      role="slider"
      tabIndex={0}
      aria-label="Before and after comparison. Drag, or use arrow keys, to adjust."
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(percent)}
      style={{ cursor: "ew-resize", touchAction: "pan-y" }}
    >
      <Image
        src={before}
        alt={beforeAlt}
        fill
        sizes="(max-width: 768px) 100vw, 1200px"
        className="pointer-events-none object-cover"
        priority={false}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ clipPath: `inset(0 0 0 ${percent}%)` }}
      >
        <Image
          src={after}
          alt={afterAlt}
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover"
        />
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-noir/60 px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] text-bone backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-widest2">
        BEFORE
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-umber/60 px-2.5 py-1 font-mono text-[9px] tracking-[0.14em] text-parchment backdrop-blur-sm sm:right-4 sm:top-4 sm:px-3 sm:py-1.5 sm:text-[10px] sm:tracking-widest2">
        AFTER
      </span>

      <div
        className="pointer-events-none absolute inset-y-0 w-[3px] bg-clay md:w-[2px]"
        style={{ left: `${percent}%`, transform: "translateX(-50%)" }}
      >
        <div
          className={cn(
            "absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-bone shadow-deep md:h-12 md:w-12",
            !hasInteracted && "animate-handle-invite"
          )}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#17140F" strokeWidth="1.6" aria-hidden="true" className="md:h-4 md:w-4">
            <path d="M8 7L3 12L8 17" />
            <path d="M16 7L21 12L16 17" />
          </svg>
        </div>
      </div>
    </div>
  );
}
