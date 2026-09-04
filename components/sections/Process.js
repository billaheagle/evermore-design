"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { accentText } from "@/lib/accentText";
import { cn } from "@/lib/cn";

export default function Process({ steps: rawSteps = [], settings = {} }) {
  const reduce = useReducedMotion();
  const sectionRef = useRef(null);
  const [active, setActive] = useState(0);

  // The stage number is derived from position, not stored.
  const steps = rawSteps.map((s, i) => ({
    ...s,
    number: String(i + 1).padStart(2, "0"),
  }));

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(steps.length - 1, Math.floor(v * steps.length));
    setActive(idx < 0 ? 0 : idx);
  });

  const railWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  if (!steps.length) return null;
  const activeStep = steps[Math.min(active, steps.length - 1)];

  // Reduced motion / no-JS-friendly fallback: a plain stacked list.
  if (reduce) {
    return (
      <section
        id="process"
        data-nav-theme="light"
        className="relative z-40 bg-bone py-24 md:py-32"
      >
        <div className="mx-auto max-w-[1600px] px-6 md:px-[6vw]">
          <ProcessHeading settings={settings} />
          <ol className="mt-16 space-y-12 border-t border-noir/12 pt-10">
            {steps.map((step) => (
              <li key={step.number}>
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-noir/40">
                  Stage {step.number}
                </span>
                <h3 className="mt-2 font-display text-2xl font-light text-noir md:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xl text-[15px] font-light leading-relaxed text-noir/60">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="process"
      data-nav-theme="light"
      className="relative z-40 bg-bone"
      style={{ height: `${steps.length * 68 + 40}vh` }}
    >
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="mx-auto w-full max-w-[1600px] px-6 md:px-[6vw]">
          <RevealOnScroll>
            <ProcessHeading settings={settings} />
          </RevealOnScroll>

          <div className="relative mt-10 md:mt-16">
            {/* Oversized stage number behind the copy */}
            <span
              key={`n-${active}`}
              className="pointer-events-none absolute -top-[0.3em] right-0 font-display text-[34vw] font-light leading-none text-noir/[0.07] md:text-[24vw]"
            >
              {activeStep.number}
            </span>

            <div className="relative min-h-[42vh] max-w-2xl">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  aria-hidden={i !== active}
                  animate={{
                    opacity: i === active ? 1 : 0,
                    y: i === active ? 0 : 16,
                  }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    "top-0 w-full",
                    i === active ? "relative" : "pointer-events-none absolute"
                  )}
                >
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-clay">
                    Stage {step.number} of{" "}
                    {String(steps.length).padStart(2, "0")}
                  </span>
                  <h3 className="mt-4 font-display text-[clamp(2.2rem,6vw,4.5rem)] font-normal leading-[1.02] text-noir">
                    {step.title}
                  </h3>
                  <p className="mt-6 max-w-md text-[15px] font-light leading-relaxed text-noir/70">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Progress rail */}
            <div className="mt-10 md:mt-14">
              <div className="relative h-px w-full bg-noir/15">
                <motion.div
                  style={{ width: railWidth }}
                  className="absolute inset-y-0 left-0 bg-clay"
                />
              </div>
              <ol className="mt-4 flex justify-between">
                {steps.map((step, i) => (
                  <li
                    key={step.number}
                    className={cn(
                      "font-mono text-[10px] uppercase tracking-[0.14em] transition-colors",
                      i <= active ? "text-noir/70" : "text-noir/30"
                    )}
                  >
                    {step.number}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessHeading({ settings = {} }) {
  return (
    <div className="grid gap-6 md:grid-cols-12 md:items-end">
      <span className="font-display text-[clamp(3rem,9vw,7rem)] font-light leading-none text-noir/12 md:col-span-2">
        04
      </span>
      <div className="md:col-span-7 md:col-start-4">
        <p className="archive-label mb-5 text-noir/45">
          {settings.processEyebrow}
        </p>
        <h2 className="max-w-[16ch] font-display text-[clamp(2rem,5vw,3.6rem)] font-light leading-[1.05] text-noir">
          {accentText(settings.processHeading)}
        </h2>
      </div>
    </div>
  );
}
