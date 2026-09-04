"use client";

import { useTransition } from "react";
import {
  setInquiryHandledAction,
  deleteInquiryAction,
} from "@/app/admin/actions";

export default function InquiryRow({ inquiry }) {
  const [pending, startTransition] = useTransition();

  function toggleHandled() {
    const fd = new FormData();
    fd.set("id", inquiry.id);
    fd.set("handled", String(!inquiry.handled));
    startTransition(() => setInquiryHandledAction(fd));
  }
  function remove() {
    if (!window.confirm(`Delete the message from ${inquiry.name}?`)) return;
    const fd = new FormData();
    fd.set("id", inquiry.id);
    startTransition(() => deleteInquiryAction(fd));
  }

  const date = new Date(inquiry.createdAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li
      className={
        "rounded-2xl border p-4 " +
        (inquiry.handled
          ? "border-ink/10 bg-white/40 opacity-70"
          : "border-copper/30 bg-white/70")
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-lg text-ink">
            {inquiry.name}
            {!inquiry.handled && (
              <span className="ml-2 align-middle rounded-full bg-copper/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide text-copper">
                New
              </span>
            )}
          </p>
          <p className="font-mono text-[11px] text-ink/50">
            <a href={`mailto:${inquiry.email}`} className="underline-offset-2 hover:underline">
              {inquiry.email}
            </a>
            {inquiry.projectType ? ` · ${inquiry.projectType}` : ""} · {date}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggleHandled}
            disabled={pending}
            className="rounded-full border border-ink/15 px-3 py-2 text-xs text-ink/70 hover:border-ink/40 disabled:opacity-50"
          >
            {inquiry.handled ? "Mark unread" : "Mark done"}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="rounded-full border border-red-300 px-3 py-2 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/75">
        {inquiry.message}
      </p>
    </li>
  );
}
