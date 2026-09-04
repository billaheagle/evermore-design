"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/admin", label: "Projects", match: (p) => p === "/admin" || p.startsWith("/admin/projects") || p.startsWith("/admin/categories") },
  { href: "/admin/services", label: "Services", match: (p) => p.startsWith("/admin/services") },
  { href: "/admin/process", label: "Process", match: (p) => p.startsWith("/admin/process") },
  { href: "/admin/testimonials", label: "In their words", match: (p) => p.startsWith("/admin/testimonials") },
  { href: "/admin/inbox", label: "Inbox", match: (p) => p.startsWith("/admin/inbox"), badge: true },
  { href: "/admin/settings", label: "Settings", match: (p) => p.startsWith("/admin/settings") },
];

export default function AdminNav({ inboxCount = 0 }) {
  const pathname = usePathname();
  const activeRef = useRef(null);

  // Keep the current tab in view on the mobile scroll strip.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [pathname]);

  return (
    <nav
      className="-mx-4 mt-5 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:mt-6 sm:flex-wrap sm:overflow-visible sm:px-0 [&::-webkit-scrollbar]:hidden"
      aria-label="Admin sections"
    >
      {tabs.map((t) => {
        const active = t.match(pathname);
        return (
          <Link
            key={t.href}
            ref={active ? activeRef : null}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm transition-colors " +
              (active
                ? "bg-ink text-parchment"
                : "text-ink/55 hover:bg-ink/5 hover:text-ink")
            }
          >
            {t.label}
            {t.badge && inboxCount > 0 && (
              <span
                className={
                  "rounded-full px-1.5 text-[10px] font-medium " +
                  (active ? "bg-parchment/25 text-parchment" : "bg-copper text-white")
                }
              >
                {inboxCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
