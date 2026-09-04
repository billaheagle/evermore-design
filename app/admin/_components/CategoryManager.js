"use client";

import { useState, useTransition } from "react";
import {
  createCategoryAction,
  renameCategoryAction,
  deleteCategoryAction,
} from "@/app/admin/actions";

export default function CategoryManager({ categories }) {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [pending, startTransition] = useTransition();

  function add(e) {
    e.preventDefault();
    setError("");
    const name = newName.trim();
    if (!name) return;
    const fd = new FormData();
    fd.set("name", name);
    startTransition(async () => {
      const res = await createCategoryAction(fd);
      if (res?.error) setError(res.error);
      else setNewName("");
    });
  }

  function saveRename(id) {
    setError("");
    const name = editValue.trim();
    if (!name) return;
    const fd = new FormData();
    fd.set("id", id);
    fd.set("name", name);
    startTransition(async () => {
      const res = await renameCategoryAction(fd);
      if (res?.error) setError(res.error);
      else setEditingId(null);
    });
  }

  function remove(cat) {
    const msg = cat.projectCount
      ? `Delete "${cat.name}"? ${cat.projectCount} project(s) use it — they keep the label, it just leaves the dropdown.`
      : `Delete "${cat.name}"?`;
    if (!window.confirm(msg)) return;
    const fd = new FormData();
    fd.set("id", cat.id);
    startTransition(() => deleteCategoryAction(fd));
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="min-w-0 flex-1 rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-copper"
        />
        <button
          type="submit"
          disabled={pending || !newName.trim()}
          className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm text-parchment hover:opacity-90 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {categories.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink/20 p-8 text-center text-sm text-ink/50">
          No categories yet. Add one above.
        </p>
      ) : (
        <ul className="divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white/60">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex flex-col gap-2.5 p-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3"
            >
              {editingId === cat.id ? (
                <>
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveRename(cat.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="min-w-0 flex-1 rounded-lg border border-ink/20 bg-white px-3 py-2 text-sm outline-none focus:border-copper"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveRename(cat.id)}
                      disabled={pending}
                      className="rounded-full bg-ink px-3.5 py-2 text-xs text-parchment disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-full border border-ink/15 px-3.5 py-2 text-xs text-ink/60"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex min-w-0 flex-1 items-baseline gap-3">
                    <span className="truncate font-display text-lg text-ink">
                      {cat.name}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] uppercase tracking-wide text-ink/40">
                      {cat.projectCount} project{cat.projectCount === 1 ? "" : "s"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditValue(cat.name);
                      }}
                      className="rounded-full border border-ink/15 px-3 py-2 text-xs text-ink/80 hover:border-ink/40"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => remove(cat)}
                      disabled={pending}
                      className="rounded-full border border-red-300 px-3 py-2 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-ink/40">
        Renaming a category updates every project that uses it. Deleting one
        leaves those projects&rsquo; labels untouched — the name just stops
        appearing in the new/edit dropdown.
      </p>
    </div>
  );
}
