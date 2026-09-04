"use client";

import Link from "next/link";
import { handleSectionNav } from "@/lib/scrollToSection";

const index = [
  { href: "/#work", label: "Work" },
  { href: "/#services", label: "Services" },
  { href: "/#process", label: "Process" },
  { href: "/#about", label: "Studio" },
  { href: "/#cta", label: "Contact" },
];

export default function Footer({ settings = {} }) {
  return (
    <footer
      data-nav-theme="dark"
      className="relative z-[80] bg-noir text-parchment"
    >
      <div className="mx-auto max-w-[1600px] px-6 pb-10 pt-24 md:px-[6vw]">
        <div className="grid gap-x-8 gap-y-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-xl">
              Evermore <span className="opacity-50">Design</span>
            </p>
            <p className="mt-5 max-w-xs text-sm font-light leading-relaxed text-parchment/55">
              {settings.footerBlurb}
            </p>
          </div>

          <nav
            aria-label="Sections"
            className="md:col-span-3 md:col-start-7"
          >
            <p className="archive-label mb-5 text-parchment/40">Index</p>
            <ul className="space-y-2.5 text-sm text-parchment/70">
              {index.map((l) => (
                <li key={l.href}>
                  <Link
                    className="transition-colors hover:text-clay"
                    href={l.href}
                    onClick={(e) => handleSectionNav(e, l.href)}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="archive-label mb-5 text-parchment/40">Contact</p>
            <ul className="space-y-2.5 text-sm text-parchment/70">
              {settings.instagramUrl && (
                <li>
                  <a
                    className="transition-colors hover:text-clay"
                    href={settings.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                </li>
              )}
              {settings.email && (
                <li>
                  <a
                    className="transition-colors hover:text-clay"
                    href={`mailto:${settings.email}`}
                  >
                    {settings.email}
                  </a>
                </li>
              )}
              {settings.phone && <li>{settings.phone}</li>}
              {settings.addressLine && <li>{settings.addressLine}</li>}
            </ul>
          </div>
        </div>

        {/* Closing wordmark — a quiet sign-off, not a billboard */}
        <p className="mt-20 border-t border-parchment/12 pt-8 font-display text-[clamp(2rem,7vw,4.75rem)] font-light leading-none tracking-[-0.02em] text-parchment/90">
          Evermore <span className="italic text-clay">Design</span>
        </p>

        <div className="archive-label mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-parchment/35">
          <span>© {new Date().getFullYear()} Evermore Design</span>
          <span>Interior Design — Jakarta, Indonesia</span>
        </div>
      </div>
    </footer>
  );
}
