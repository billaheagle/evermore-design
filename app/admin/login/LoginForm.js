"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/app/admin/actions";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const username = form.username.value;
    const password = form.password.value;
    setError("");
    startTransition(async () => {
      const res = await loginAction({ username, password, from });
      // On success loginAction redirects and never returns.
      if (res?.error) setError(res.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 space-y-4">
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-ink/50">
          Username
        </span>
        <input
          name="username"
          autoComplete="username"
          required
          className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-copper"
        />
      </label>
      <label className="block">
        <span className="font-mono text-[10px] uppercase tracking-widest2 text-ink/50">
          Password
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-copper"
        />
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-ink px-6 py-3 text-sm text-parchment transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
