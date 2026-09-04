"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { accentText } from "@/lib/accentText";
import { cn } from "@/lib/cn";

// Alternating aspect ratios + column widths so the two columns never line
// up like a plain grid — a hand-laid catalogue spread. Cycled per project.
const PLATES = [
  { col: "md:col-span-6 md:col-start-1", ratio: "aspect-[4/5]", lift: "" },
  { col: "md:col-span-5 md:col-start-8", ratio: "aspect-[4/3]", lift: "md:mt-32" },
  { col: "md:col-span-5 md:col-start-2", ratio: "aspect-[3/4]", lift: "md:mt-16" },
  { col: "md:col-span-6 md:col-start-7", ratio: "aspect-[16/11]", lift: "md:mt-8" },
];

export default function Work({ projects, categories, settings = {} }) {
  const [filter, setFilter] = useState("All");

  const filtered = useMemo(
    () =>
      filter === "All"
        ? projects
        : projects.filter((p) => p.category === filter),
    [filter, projects]
  );

  return (
    <section
      id="work"
      data-nav-theme="light"
      className="relative z-20 bg-bone py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-[6vw]">
        <RevealOnScroll className="grid gap-6 md:grid-cols-12 md:items-end">
          <span className="font-display text-[clamp(3rem,9vw,7rem)] font-light leading-none text-noir/12 md:col-span-2">
            02
          </span>
          <div className="md:col-span-7 md:col-start-4">
            <p className="archive-label mb-5 text-noir/45">
              {settings.workEyebrow}
            </p>
            <h2 className="max-w-[18ch] font-display text-[clamp(2rem,5vw,3.6rem)] font-light leading-[1.05] text-noir">
              {accentText(settings.workHeading)}
            </h2>
          </div>
        </RevealOnScroll>

        {categories.length > 2 && (
          <RevealOnScroll
            delay={0.05}
            className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-noir/12 pt-4"
          >
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                aria-pressed={filter === c}

                className={cn(
                  "relative font-mono text-[11px] uppercase tracking-[0.16em] transition-colors",
                  filter === c ? "text-noir" : "text-noir/35 hover:text-noir/70"
                )}
              >
                {c}
                {filter === c && (
                  <motion.span
                    layoutId="work-filter-underline"
                    className="absolute -bottom-[5px] left-0 h-px w-full bg-clay"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
              </button>
            ))}
          </RevealOnScroll>
        )}

        <motion.div
          layout
          className="mt-16 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 md:mt-24 md:grid-cols-12 md:gap-y-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => {
              const plate = PLATES[i % PLATES.length];
              return (
              <motion.article
                key={project.slug}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className={cn(plate.col, plate.lift)}
              >
                <Link
                  href={`/work/${project.slug}`}

                  className="group block"
                  aria-label={`View ${project.name}`}
                >
                  <div
                    className={cn(
                      "relative w-full overflow-hidden bg-noir/5",
                      plate.ratio
                    )}
                  >
                    <Image
                      src={project.hero}
                      alt={`${project.name}, ${project.category} project in ${project.location}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 45vw"
                      className="object-cover grayscale-[0.12] transition-all duration-[1200ms] ease-archive group-hover:scale-[1.03] group-hover:grayscale-0"
                    />
                  </div>

                  <div className="mt-4 flex items-baseline justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg italic text-noir transition-colors group-hover:text-clay">
                        {project.name}
                      </h3>
                      <p className="archive-label mt-1.5 text-noir/45">
                        {project.location} — {project.category}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-noir/40">
                      {String(i + 1).padStart(2, "0")} / {project.year}
                    </span>
                  </div>
                </Link>
              </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
