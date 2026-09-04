"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveTestimonialAction } from "@/app/admin/actions";
import StatusSegments from "./StatusSegments";

export default function TestimonialForm({ initial }) {
  const isEdit = Boolean(initial?.id);
  const [form, setForm] = useState({
    quote: initial?.quote || "",
    name: initial?.name || "",
    location: initial?.location || "",
    status: initial?.status || "PUBLISHED",
    sortOrder: initial?.sortOrder ?? 0,
  });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await saveTestimonialAction({
        id: initial?.id,
        quote: form.quote,
        name: form.name,
        location: form.location,
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
          {isEdit ? "Edit quote" : "New quote"}
        </h1>
        <Link
          href="/admin/testimonials"
          className="text-xs text-ink/50 hover:text-ink"
        >
          ← Back
        </Link>
      </div>

      <StatusSegments value={form.status} onChange={(v) => set("status", v)} />

      <label className="block">
        <span className={labelText}>Quote *</span>
        <textarea
          className={`${field} min-h-[120px] resize-y`}
          value={form.quote}
          onChange={(e) => set("quote", e.target.value)}
          placeholder="What the client said…"
          required
        />
        <span className="mt-1 block text-[11px] text-ink/40">
          Shown with curly quotes added automatically.
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className={labelText}>Name *</span>
          <input
            className={field}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="First name only"
            required
          />
        </label>
        <label className="block">
          <span className={labelText}>Location</span>
          <input
            className={field}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="Jakarta"
          />
        </label>
      </div>

      <label className="block max-w-[12rem]">
        <span className={labelText}>Sort order</span>
        <input
          type="number"
          className={field}
          value={form.sortOrder}
          onChange={(e) => set("sortOrder", e.target.value)}
        />
        <span className="mt-1 block text-[11px] text-ink/40">Lower shows first.</span>
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
          {pending ? "Saving…" : isEdit ? "Save changes" : "Add quote"}
        </button>
        <Link
          href="/admin/testimonials"
          className="text-sm text-ink/50 hover:text-ink"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
