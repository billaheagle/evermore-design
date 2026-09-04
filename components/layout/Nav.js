"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { handleSectionNav, scrollToId } from "@/lib/scrollToSection";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/#services", label: "Services" },
  { href: "/#process", label: "Process" },
  { href: "/#about", label: "Studio" },
];

export default function Nav({ settings = {} }) {
  const [theme, setTheme] = useState("light"); // colour of the section under the nav
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // One scroll handler drives both the "has the page scrolled" flag and the
  // nav colour. Colour follows whichever `[data-nav-theme]` section owns the
  // point just below the nav line — a direct hit-test, so it never sticks on
  // the wrong theme when scrolling back up quickly.
  useEffect(() => {
    const marks = Array.from(document.querySelectorAll("[data-nav-theme]"));
    const SAMPLE_Y = 72;

    const update = () => {
      setScrolled(window.scrollY > 8);
      let next = "light";
      for (const m of marks) {
        const r = m.getBoundingClientRect();
        if (r.top <= SAMPLE_Y && r.bottom > SAMPLE_Y) {
          next = m.getAttribute("data-nav-theme") || "light";
        }
      }
      setTheme(next);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // Honour a hash on load (direct link, or arriving from another page) —
  // Next's own hash scroll is unreliable, and once the sections have laid
  // out we can place it exactly under the nav.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    let tries = 0;
    const tick = () => {
      if (scrollToId(id) || ++tries > 20) return;
      setTimeout(tick, 100);
    };
    setTimeout(tick, 120);
  }, []);

  const dark = theme === "dark";

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[90] transition-[background-color,color,box-shadow] duration-200 ease-out",
          dark ? "text-parchment" : "text-noir",
          scrolled
            ? dark
              ? "bg-noir shadow-[0_1px_0_rgba(237,231,217,0.12)]"
              : "bg-bone shadow-[0_1px_0_rgba(26,23,18,0.10)]"
            : "bg-transparent shadow-none"
        )}
      >
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 py-5 md:px-[6vw]">
          <Link
            href="/"

            className="font-display text-lg leading-none tracking-[-0.01em]"
          >
            Evermore <span className="opacity-55">Design</span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-7 md:flex"
          >
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={(e) => handleSectionNav(e, l.href)}
                className="text-[11px] font-medium uppercase tracking-[0.14em] opacity-70 transition-opacity hover:opacity-100"
              >
                {l.label}
              </Link>
            ))}
            <span aria-hidden="true" className="h-3 w-px bg-current opacity-25" />
            <Link
              href="/#cta"

              onClick={(e) => handleSectionNav(e, "/#cta")}
              className="group inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-colors hover:text-clay"
            >
              Start a project
              <span
                aria-hidden="true"
                className="transition-transform duration-300 ease-out group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </nav>

          <button
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
            className="text-[11px] font-medium uppercase tracking-[0.14em] md:hidden"
          >
            Menu
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex flex-col justify-between bg-noir px-6 pb-12 pt-6 text-parchment"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-[17px]">
                Evermore <span className="text-parchment/50">Design</span>
              </span>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="text-[11px] font-medium uppercase tracking-[0.18em]"
              >
                Close
              </button>
            </div>

            <ul className="space-y-1">
              {links
                .concat([{ href: "/#cta", label: "Start a project" }])
                .map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={l.href}
                      onClick={(e) => {
                        const id = l.href.slice(l.href.indexOf("#") + 1);
                        const exists =
                          typeof document !== "undefined" &&
                          document.getElementById(id);
                        setOpen(false);
                        if (!exists) return; // subpage — let Next navigate
                        e.preventDefault();
                        // wait for the menu overlay to unmount + body scroll
                        // lock to lift, then scroll
                        setTimeout(() => scrollToId(id), 80);
                      }}
                      className={cn(
                        "block font-display text-[11vw] font-light leading-[1.1]",
                        i === 4 && "italic text-clay"
                      )}
                    >
                      {l.label}
                    </Link>
                  </motion.li>
                ))}
            </ul>

            <p className="archive-label text-parchment/45">
              {[settings.addressLine, settings.email].filter(Boolean).join(" — ")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
