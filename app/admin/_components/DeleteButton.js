"use client";

import { useTransition } from "react";

export default function DeleteButton({ id, name, action }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const fd = new FormData();
    fd.set("id", id);
    startTransition(() => action(fd));
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="rounded-full border border-red-300 px-3 py-2 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
