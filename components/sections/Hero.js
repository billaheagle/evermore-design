"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { handleSectionNav } from "@/lib/scrollToSection";
import { accentText } from "@/lib/accentText";
import { cn } from "@/lib/cn";

const lineVariants = {
  hidden: { y: "108%" },
  visible: (i) => ({
    y: "0%",
    transition: {
      delay: 0.35 + i * 0.09,
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function Hero({ settings = {} }) {
  const sectionRef = useRef(null);
  const reduce = useReducedMotion();

  const headlineLines = (settings.heroHeadline || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const swatches = (
    Array.isArray(settings.heroSwatches) ? settings.heroSwatches : []
  ).filter((s) => s?.image);

  // On a narrow (portrait) screen the ribbon is a static 2×2 grid — the
  // "widen on scroll" parallax only makes sense for the horizontal strip.
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setCompact(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const headlineY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-42%"]);
  const headlineOpacity = useTransform(scrollYProgress, [0, 0.7], [1, reduce ? 1 : 0.15]);
  const ribbonScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.14]);
  const ribbonX = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "-8%"]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      data-nav-theme="light"
      className="relative min-h-[100svh] overflow-hidden bg-bone text-noir"
    >
      <div className="pointer-events-none absolute inset-x-4 bottom-4 top-[68px] border border-noir/10 md:inset-x-6 md:bottom-6 md:top-[76px]" />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[1600px] flex-col justify-between px-6 pb-7 pt-24 md:px-[6vw] md:pb-9 md:pt-28">
        {/* ── Headline ─────────────────────────────────────────────── */}
        <motion.h1
          style={{ y: headlineY, opacity: headlineOpacity }}
          className="font-display font-light leading-[0.9] tracking-[-0.02em] text-noir"
        >
          {headlineLines.map((line, i) => (
            <span key={i} className="mask-line">
              <motion.span
                custom={i}
                variants={reduce ? undefined : lineVariants}
                initial={reduce ? false : "hidden"}
                animate={reduce ? false : "visible"}
                className={
                  "block text-[clamp(2.9rem,10.5vw,9rem)] " +
                  (i === headlineLines.length - 1 && i > 0 ? "pl-[0.1em]" : "")
                }
              >
                {accentText(line)}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        {/* ── Material ribbon ──────────────────────────────────────────
            Portrait: a 2×2 grid that fills the column. sm+ : the horizontal
            strip that widens on the first scroll. */}
        {swatches.length > 0 && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1 }}
            className="my-auto py-6"
          >
            <motion.ul
              style={compact ? undefined : { scale: ribbonScale, x: ribbonX }}
              className="grid origin-left grid-cols-2 gap-x-3 gap-y-5 sm:flex sm:gap-4"
            >
              {swatches.map((s, i) => (
                <li
                  key={i}
                  className={cn(
                    "group relative sm:shrink-0",
                    // 4th sample: shown in the mobile grid, hidden in the
                    // sm/md strip (would overflow), back for lg.
                    i > 2 && "sm:hidden lg:block"
                  )}
                >
                  <div className="relative aspect-[5/4] w-full overflow-hidden sm:aspect-auto sm:h-[13vh] sm:w-[26vw] md:h-[15vh] lg:w-[19vw]">
                    <Image
                      src={s.image}
                      alt=""
                      fill
                      priority={i === 0}
                      sizes="(max-width: 640px) 45vw, 22vw"
                      className="object-cover grayscale-[0.15] transition-transform duration-[1200ms] ease-archive group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="archive-label text-noir/70">
                      {s.material}
                    </span>
                    <span className="font-display text-[11px] italic text-noir/45">
                      {s.note}
                    </span>
                  </div>
                </li>
              ))}
            </motion.ul>
          </motion.div>
        )}

        {/* ── Archive meta ────────────────────────────────────────── */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.9 }}
          className="flex flex-col gap-6 border-t border-noir/15 pt-5 text-noir/70 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="archive-label space-y-1.5">
            <p>{settings.heroEyebrow}</p>
            <p className="text-noir/45">{settings.heroKicker}</p>
          </div>

          <Link
            href="#work"
            onClick={(e) => handleSectionNav(e, "#work")}
            className="group inline-flex items-center gap-3 self-start font-display text-lg italic text-noir sm:self-auto"
          >
            <span className="border-b border-noir/40 pb-1 transition-colors group-hover:border-clay group-hover:text-clay">
              {settings.heroCtaLabel || "See the work"}
            </span>
            <span
              aria-hidden="true"
              className="transition-transform duration-300 ease-out group-hover:translate-x-1.5"
            >
              →
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
