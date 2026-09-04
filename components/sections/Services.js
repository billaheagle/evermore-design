"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { accentText } from "@/lib/accentText";
import { cn } from "@/lib/cn";

export default function Services({ services = [], settings = {} }) {
  const [open, setOpen] = useState(0);
  const reduce = useReducedMotion();

  if (!services.length) return null;

  return (
    <section
      id="services"
      data-nav-theme="dark"
      className="relative z-30 bg-noir py-24 text-parchment md:py-32"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-[6vw]">
        <RevealOnScroll className="grid gap-6 md:grid-cols-12 md:items-end">
          <span className="font-display text-[clamp(3rem,9vw,7rem)] font-light leading-none text-parchment/15 md:col-span-2">
            03
          </span>
          <div className="md:col-span-7 md:col-start-4">
            <p className="archive-label mb-5 text-parchment/45">
              {settings.servicesEyebrow}
            </p>
            <h2 className="max-w-[16ch] font-display text-[clamp(2rem,5vw,3.6rem)] font-light leading-[1.05]">
              {accentText(settings.servicesHeading)}
            </h2>
          </div>
        </RevealOnScroll>

        <ul className="mt-14 border-t border-parchment/15 md:mt-20">
          {services.map((s, i) => {
            const active = open === i;
            return (
              <li key={s.id ?? s.title} className="border-b border-parchment/15">
                <RevealOnScroll delay={Math.min(i * 0.04, 0.2)}>
                  <button
                    onClick={() => setOpen(active ? -1 : i)}
                    onMouseEnter={() => setOpen(i)}
                    aria-expanded={active}

                    className="grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-6 text-left md:grid-cols-[4rem_1fr_auto] md:gap-x-8 md:py-8"
                  >
                    <span className="font-mono text-[11px] text-clay">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3
                      className={cn(
                        "font-display text-[clamp(1.35rem,3vw,2.1rem)] font-light transition-colors",
                        active ? "text-parchment" : "text-parchment/70"
                      )}
                    >
                      {s.title}
                    </h3>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "font-mono text-xs transition-transform duration-500 ease-archive",
                        active ? "rotate-45 text-clay" : "text-parchment/40"
                      )}
                    >
                      +
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {active && (
                      <motion.div
                        initial={reduce ? false : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={reduce ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-xl pb-8 pl-[3.5rem] text-[15px] font-light leading-relaxed text-parchment/60 md:pl-[6rem]">
                          {s.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </RevealOnScroll>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
