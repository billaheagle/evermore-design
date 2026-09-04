"use client";

import { useState } from "react";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { accentText } from "@/lib/accentText";
import { cn } from "@/lib/cn";

export default function Patina({ projects, settings = {} }) {
  const featured = (projects || []).slice(0, 4);
  const [active, setActive] = useState(featured[0]);

  // Nothing to compare until at least one project has both a before and an
  // after image (the admin panel may not have any yet).
  if (!active) return null;

  return (
    <section
      id="the-long-game"
      data-nav-theme="dark"
      className="relative z-10 bg-noir py-24 text-parchment md:py-32"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-[6vw]">
        <RevealOnScroll className="grid gap-6 md:grid-cols-12 md:items-end">
          <span className="font-display text-[clamp(3rem,9vw,7rem)] font-light leading-none text-parchment/15 md:col-span-2">
            01
          </span>
          <div className="md:col-span-7 md:col-start-4">
            <p className="archive-label mb-5 text-parchment/45">
              {settings.patinaEyebrow}
            </p>
            <h2 className="max-w-[16ch] font-display text-[clamp(2rem,5vw,3.6rem)] font-light leading-[1.05]">
              {accentText(settings.patinaHeading)}
            </h2>
          </div>
        </RevealOnScroll>

        <div className="mt-14 grid gap-8 md:mt-20 md:grid-cols-12 md:gap-12">
          {/* Numbered project index */}
          <RevealOnScroll className="md:col-span-3">
            <ul className="flex flex-wrap gap-x-5 gap-y-1 border-t border-parchment/15 pt-4 md:flex-col md:gap-0">
              {featured.map((p, i) => {
                const on = active.slug === p.slug;
                return (
                  <li key={p.slug} className="md:border-b md:border-parchment/10">
                    <button
                      onClick={() => setActive(p)}
                      aria-pressed={on}
                      className="group flex items-baseline gap-2.5 py-1.5 text-left md:w-full md:py-4"
                    >
                      <span
                        className={cn(
                          "font-mono text-[10px] transition-colors",
                          on ? "text-clay" : "text-parchment/35"
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "font-display text-base transition-colors md:text-xl",
                          on
                            ? "italic text-parchment"
                            : "text-parchment/45 group-hover:text-parchment/80"
                        )}
                      >
                        {p.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </RevealOnScroll>

          {/* Single large comparison */}
          <RevealOnScroll delay={0.1} className="md:col-span-9">
            <BeforeAfterSlider
              key={active.slug}
              before={active.before}
              after={active.after}
              beforeAlt={`${active.name} before renovation`}
              afterAlt={`${active.name} after renovation`}
            />
            <div className="mt-5 flex flex-col gap-1.5 border-t border-parchment/15 pt-4 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-3">
              <h3 className="font-display text-xl italic text-parchment">
                {active.name}
              </h3>
              <span className="archive-label text-parchment/45">
                {active.location} / {active.year} / {active.category}
              </span>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
