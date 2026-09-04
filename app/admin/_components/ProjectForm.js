"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { saveProjectAction } from "@/app/admin/actions";
import ImageField from "./ImageField";
import GalleryEditor from "./GalleryEditor";
import StatusSegments from "./StatusSegments";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProjectForm({ initial, categories = [] }) {
  const isEdit = Boolean(initial?.id);

  // The dropdown shows every managed category, plus the project's current
  // value if it points at a category that was since renamed or deleted.
  const categoryNames = categories.map((c) => c.name);
  const categoryOptions =
    initial?.category && !categoryNames.includes(initial.category)
      ? [initial.category, ...categoryNames]
      : categoryNames;
  const [form, setForm] = useState({
    name: initial?.name || "",
    slug: initial?.slug || "",
    slugTouched: Boolean(initial?.slug),
    location: initial?.location || "",
    year: initial?.year || "",
    category: initial?.category || categoryOptions[0] || "Residential",
    scope: initial?.scope || "",
    concept: initial?.concept || "",
    heroImage: initial?.heroImage || "",
    beforeImage: initial?.beforeImage || "",
    afterImage: initial?.afterImage || "",
    status: initial?.status || "PUBLISHED",
    sortOrder: initial?.sortOrder ?? 0,
  });
  const [gallery, setGallery] = useState(
    (initial?.gallery || []).map((g) => ({ src: g.src, wide: Boolean(g.wide) }))
  );
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onNameChange(value) {
    setForm((f) => ({
      ...f,
      name: value,
      slug: f.slugTouched ? f.slug : slugify(value),
    }));
  }

  function onSlugChange(value) {
    setForm((f) => ({ ...f, slug: slugify(value), slugTouched: true }));
  }

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await saveProjectAction({
        id: initial?.id,
        name: form.name,
        slug: form.slug,
        location: form.location,
        year: form.year,
        category: form.category,
        scope: form.scope,
        concept: form.concept,
        heroImage: form.heroImage,
        beforeImage: form.beforeImage,
        afterImage: form.afterImage,
        status: form.status,
        sortOrder: Number(form.sortOrder) || 0,
        gallery,
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
          {isEdit ? "Edit project" : "New project"}
        </h1>
        <Link href="/admin" className="text-xs text-ink/50 hover:text-ink">
          ← Back
        </Link>
      </div>

      <StatusSegments
        value={form.status}
        onChange={(v) => set("status", v)}
      />

      <section className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={labelText}>Name *</span>
          <input
            className={field}
            value={form.name}
            onChange={(e) => onNameChange(e.target.value)}
            required
          />
        </label>

        <label className="block">
          <span className={labelText}>Slug (URL)</span>
          <input
            className={field}
            value={form.slug}
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="auto from name"
          />
          <span className="mt-1 block text-[11px] text-ink/40">
            /work/{form.slug || "…"}
          </span>
        </label>

        <label className="block">
          <span className={labelText}>Category</span>
          {categoryOptions.length === 0 ? (
            <>
              <input
                className={field}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              />
              <span className="mt-1 block text-[11px] text-ink/40">
                No managed categories yet —{" "}
                <Link href="/admin/categories" className="underline">
                  add some
                </Link>
                .
              </span>
            </>
          ) : (
            <>
              <select
                className={`${field} appearance-none`}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              >
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[11px] text-ink/40">
                <Link href="/admin/categories" className="underline">
                  Manage categories
                </Link>
              </span>
            </>
          )}
        </label>

        <label className="block">
          <span className={labelText}>Location</span>
          <input
            className={field}
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
          />
        </label>

        <label className="block">
          <span className={labelText}>Year</span>
          <input
            className={field}
            value={form.year}
            onChange={(e) => set("year", e.target.value)}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className={labelText}>Scope</span>
          <input
            className={field}
            value={form.scope}
            onChange={(e) => set("scope", e.target.value)}
            placeholder="Full Interior + Renovation"
          />
        </label>

        <label className="block">
          <span className={labelText}>Sort order</span>
          <input
            type="number"
            className={field}
            value={form.sortOrder}
            onChange={(e) => set("sortOrder", e.target.value)}
          />
          <span className="mt-1 block text-[11px] text-ink/40">
            Lower shows first.
          </span>
        </label>

        <label className="block sm:col-span-2">
          <span className={labelText}>Concept</span>
          <textarea
            className={`${field} min-h-[120px] resize-y`}
            value={form.concept}
            onChange={(e) => set("concept", e.target.value)}
          />
        </label>
      </section>

      <section className="space-y-5 border-t border-ink/10 pt-6">
        <ImageField
          label="Hero image *"
          hint="Shown at the top of the project page and in listings."
          value={form.heroImage}
          onChange={(url) => set("heroImage", url)}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <ImageField
            label="Before image"
            hint="Optional. Needed for the before/after slider."
            value={form.beforeImage}
            onChange={(url) => set("beforeImage", url)}
          />
          <ImageField
            label="After image"
            hint="Optional. Defaults to the hero if left empty."
            value={form.afterImage}
            onChange={(url) => set("afterImage", url)}
          />
        </div>
      </section>

      <section className="border-t border-ink/10 pt-6">
        <GalleryEditor items={gallery} onChange={setGallery} />
      </section>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="flex items-center gap-3 border-t border-ink/10 pt-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-6 py-3 text-sm text-parchment hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create project"}
        </button>
        <Link href="/admin" className="text-sm text-ink/50 hover:text-ink">
          Cancel
        </Link>
      </div>
    </form>
  );
}
