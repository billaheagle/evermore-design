"use client";

import { useRef, useState, useTransition } from "react";
import { submitInquiryAction } from "@/app/admin/actions";

const PROJECT_TYPES = [
  "Full home",
  "Single room",
  "Apartment",
  "Renovation",
  "Commercial / hospitality",
  "Not sure yet",
];

export default function ContactForm() {
  const startedAt = useRef(Date.now());
  const [form, setForm] = useState({
    name: "",
    email: "",
    projectType: "",
    message: "",
    company: "", // honeypot
  });
  const [state, setState] = useState({ error: "", done: false });
  const [pending, startTransition] = useTransition();

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  function onSubmit(e) {
    e.preventDefault();
    setState({ error: "", done: false });
    startTransition(async () => {
      const res = await submitInquiryAction({
        ...form,
        startedAt: startedAt.current,
      });
      if (res?.error) setState({ error: res.error, done: false });
      else setState({ error: "", done: true });
    });
  }

  const label = "block archive-label text-parchment/45";
  const field =
    "mt-2 w-full border-b border-parchment/25 bg-transparent py-2 text-sm text-parchment placeholder:text-parchment/35 outline-none transition-colors focus:border-parchment/70";

  if (state.done) {
    return (
      <div className="rounded-2xl border border-parchment/15 p-8 text-center">
        <p className="font-display text-2xl italic text-parchment">Thank you.</p>
        <p className="mt-3 text-sm font-light text-parchment/60">
          We&apos;ve got your note and will be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* honeypot — visually and semantically hidden from real users */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="cf-company">Company</label>
        <input
          id="cf-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={(e) => set("company", e.target.value)}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className={label}>
            Your name
          </label>
          <input
            id="cf-name"
            className={field}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            maxLength={120}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="cf-email" className={label}>
            Email
          </label>
          <input
            id="cf-email"
            type="email"
            className={field}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
            maxLength={160}
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <label htmlFor="cf-type" className={label}>
          What kind of project?
        </label>
        <select
          id="cf-type"
          className={`${field} appearance-none [&>option]:text-ink`}
          value={form.projectType}
          onChange={(e) => set("projectType", e.target.value)}
        >
          <option value="">Choose one</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cf-message" className={label}>
          A sentence or two about the space
        </label>
        <textarea
          id="cf-message"
          className={`${field} min-h-[90px] resize-y`}
          value={form.message}
          onChange={(e) => set("message", e.target.value)}
          required
          maxLength={4000}
        />
      </div>

      {state.error && <p className="text-sm text-clay">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="group inline-flex items-center gap-2 rounded-full border border-parchment/40 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.16em] text-parchment transition-colors hover:border-parchment hover:bg-parchment hover:text-noir disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send message"}
        <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
          →
        </span>
      </button>
    </form>
  );
}
