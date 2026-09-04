"use client";

import { useTransition } from "react";
import { moveEntityAction } from "@/app/admin/actions";

// ↑ / ↓ reorder controls for the services / process / testimonials lists,
// so the order is set by dragging position rather than typing a number.
export default function MoveButtons({ entity, id, first, last }) {
  const [pending, startTransition] = useTransition();

  function move(dir) {
    const fd = new FormData();
    fd.set("entity", entity);
    fd.set("id", id);
    fd.set("dir", String(dir));
    startTransition(() => moveEntityAction(fd));
  }

  const btn =
    "flex h-7 w-7 items-center justify-center rounded-lg border border-ink/15 text-ink/50 transition-colors hover:border-ink/40 hover:text-ink disabled:opacity-25 disabled:hover:border-ink/15";

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        aria-label="Move up"
        onClick={() => move(-1)}
        disabled={first || pending}
        className={btn}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 6.5L5 3.5L8 6.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Move down"
        onClick={() => move(1)}
        disabled={last || pending}
        className={btn}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
