"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export default function Testimonials({ items, settings = {} }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || paused || items.length < 2) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % items.length),
      7000
    );
    return () => clearInterval(id);
  }, [items.length, paused, reduce]);

  if (!items?.length) return null;
  const current = items[index % items.length];

  return (
    <section
      id="testimonials"
      data-nav-theme="dark"
      className="relative z-50 bg-noir py-24 text-parchment md:py-36"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-[6vw]">
        <p className="archive-label mb-12 text-parchment/45 md:mb-20">
          05 — {settings.testimonialsHeading || "In their words"}
        </p>

        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Client quotes"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
          className="grid gap-10 md:grid-cols-12"
        >
          <div className="relative min-h-[42vh] md:col-span-9">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={index}
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -16 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-display text-[clamp(1.7rem,4.2vw,3.1rem)] font-light leading-[1.14] text-parchment">
                  <span className="text-clay">“</span>
                  {current.quote}
                  <span className="text-clay">”</span>
                </p>
                <footer className="mt-8 archive-label text-parchment/45">
                  {current.name} — {current.location}
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <div className="flex gap-4 md:col-span-3 md:flex-col md:items-end md:gap-3">
            {items.map((t, i) => (
              <button
                key={t.id ?? t.name + t.location}
                onClick={() => setIndex(i)}
                aria-label={`Show quote ${i + 1}`}
                aria-current={i === index}

                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
                  i === index
                    ? "text-clay"
                    : "text-parchment/30 hover:text-parchment/60"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
