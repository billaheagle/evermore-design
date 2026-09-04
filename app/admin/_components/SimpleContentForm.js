"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import StatusSegments from "./StatusSegments";

// Shared editor for a title + description + status record (services and
// process steps). `action` is the matching save server action.
export default function SimpleContentForm({
  initial,
  action,
  backHref,
  noun = "item",
  descriptionLabel = "Description",
  descriptionHint,
}) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    status: initial?.status || "PUBLISHED",
    sortOrder: initial?.sortOrder ?? 0,
  });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await action({
        id: initial?.id,
        title: form.title,
        description: form.description,
        status: form.status,
        sortOrder: Number(form.sortOrder) || 0,
      });
      if (res?.error) setError(res.error);
    });
  }

  const field =
    "mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-copper";
  const labelText =
    "font-mono text-[10px] uppercase tracking-widest2 text-ink/50";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl italic text-ink sm:text-3xl">
          {isEdit ? `Edit ${noun}` : `New ${noun}`}
        </h1>
        <Link href={backHref} className="text-xs text-ink/50 hover:text-ink">
          ← Back
        </Link>
      </div>

      <StatusSegments value={form.status} onChange={(v) => set("status", v)} />

      <label className="block">
        <span className={labelText}>Title *</span>
        <input
          className={field}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className={labelText}>{descriptionLabel}</span>
        <textarea
          className={`${field} min-h-[100px] resize-y`}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
        {descriptionHint && (
          <span className="mt-1 block text-[11px] text-ink/40">
            {descriptionHint}
          </span>
        )}
      </label>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-ink/10 pt-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-6 py-3 text-sm text-parchment hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : `Add ${noun}`}
        </button>
        <Link href={backHref} className="text-sm text-ink/50 hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
