"use client";

import { useEffect, useRef, useState, useTransition } from "react";

const OPTIONS = [
  { value: "PUBLISHED", label: "Published", dot: "bg-emerald-500" },
  { value: "DRAFT", label: "Draft", dot: "bg-amber-500" },
  { value: "HIDDEN", label: "Hidden", dot: "bg-ink/30" },
];

// `action` is a server action taking FormData with `id` + `status`
// (setProjectStatusAction, setTestimonialStatusAction, …).
export default function StatusControl({ id, status, action }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = OPTIONS.find((o) => o.value === status) || OPTIONS[0];

  function choose(next) {
    setOpen(false);
    if (next === status) return;
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", next);
    startTransition(() => action(fd));
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={
          "inline-flex items-center gap-2 rounded-full border border-ink/15 py-2 pl-3 pr-2.5 text-xs transition-colors " +
          (pending ? "opacity-50" : "hover:border-ink/40")
        }
      >
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${current.dot}`} />
        <span className="text-ink/80">{current.label}</span>
        <svg
          width="9"
          height="9"
          viewBox="0 0 10 10"
          className={"text-ink/40 transition-transform " + (open ? "rotate-180" : "")}
          aria-hidden="true"
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 z-20 mt-1.5 w-40 overflow-hidden rounded-xl border border-ink/12 bg-white py-1 shadow-lg shadow-ink/10"
        >
          {OPTIONS.map((o) => {
            const active = o.value === status;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => choose(o.value)}
                  className={
                    "flex w-full items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors hover:bg-ink/5 " +
                    (active ? "text-ink" : "text-ink/70")
                  }
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${o.dot}`} />
                  <span className="flex-1">{o.label}</span>
                  {active && <span className="text-ink/40">✓</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
