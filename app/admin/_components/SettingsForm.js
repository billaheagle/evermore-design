"use client";

import { useState, useTransition } from "react";
import { saveSettingsAction } from "@/app/admin/actions";
import ImageField from "./ImageField";

const field =
  "mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-copper";
const labelText = "font-mono text-[10px] uppercase tracking-widest2 text-ink/50";

function Text({ label, value, onChange, hint, ...rest }) {
  return (
    <label className="block">
      <span className={labelText}>{label}</span>
      <input className={field} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      {hint && <span className="mt-1 block text-[11px] text-ink/40">{hint}</span>}
    </label>
  );
}

function Area({ label, value, onChange, hint, rows = 3 }) {
  return (
    <label className="block">
      <span className={labelText}>{label}</span>
      <textarea
        className={`${field} resize-y`}
        style={{ minHeight: `${rows * 1.6 + 1}rem` }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <span className="mt-1 block text-[11px] text-ink/40">{hint}</span>}
    </label>
  );
}

function Section({ title, note, children }) {
  return (
    <section className="space-y-5 border-t border-ink/10 pt-8 first:border-0 first:pt-0">
      <div>
        <h2 className="font-display text-xl italic text-ink">{title}</h2>
        {note && <p className="mt-1 text-xs text-ink/45">{note}</p>}
      </div>
      {children}
    </section>
  );
}

function padList(list, n, make) {
  const arr = Array.isArray(list) ? list.slice(0, n) : [];
  while (arr.length < n) arr.push(make());
  return arr;
}

export default function SettingsForm({ initial }) {
  const [form, setForm] = useState(() => ({
    ...initial,
    aboutFacts: padList(initial?.aboutFacts, 4, () => ({ label: "", value: "" })).map(
      (f) => ({ label: f?.label || "", value: f?.value || "" })
    ),
    heroSwatches: padList(initial?.heroSwatches, 4, () => ({
      image: "",
      material: "",
      note: "",
    })).map((s) => ({
      image: s?.image || "",
      material: s?.material || "",
      note: s?.note || "",
    })),
  }));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const set = (k, v) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: v }));
  };
  const setFact = (i, k, v) => {
    setSaved(false);
    setForm((f) => ({
      ...f,
      aboutFacts: f.aboutFacts.map((fact, idx) =>
        idx === i ? { ...fact, [k]: v } : fact
      ),
    }));
  };
  const setSwatch = (i, k, v) => {
    setSaved(false);
    setForm((f) => ({
      ...f,
      heroSwatches: f.heroSwatches.map((s, idx) =>
        idx === i ? { ...s, [k]: v } : s
      ),
    }));
  };

  function onSubmit(e) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const res = await saveSettingsAction(form);
      if (res?.error) setError(res.error);
      else setSaved(true);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl italic text-ink sm:text-3xl">
            Site settings
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            The editable copy for the hero, about, contact and footer.
          </p>
        </div>
      </div>

      <Section
        title="Hero"
        note="Wrap words in *asterisks* to show them in the italic accent colour. The headline uses one line per row."
      >
        <Text label="Eyebrow" value={form.heroEyebrow} onChange={(v) => set("heroEyebrow", v)} />
        <Text label="Kicker (small line under it)" value={form.heroKicker} onChange={(v) => set("heroKicker", v)} />
        <Area label="Headline" value={form.heroHeadline} onChange={(v) => set("heroHeadline", v)} rows={3} hint="One line per row, e.g. Interiors / that age / *well.*" />
        <Text label="Link label" value={form.heroCtaLabel} onChange={(v) => set("heroCtaLabel", v)} />

        <div>
          <span className={labelText}>Material ribbon</span>
          <p className="mt-1 text-[11px] text-ink/40">
            The strip of samples under the headline. Leave an image empty to
            hide that one.
          </p>
          <div className="mt-3 space-y-4">
            {form.heroSwatches.map((s, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 rounded-xl border border-ink/10 bg-white/50 p-3 sm:flex-row sm:flex-wrap sm:items-start sm:gap-4"
              >
                <ImageField
                  value={s.image}
                  onChange={(url) => setSwatch(i, "image", url)}
                />
                <div className="flex w-full flex-col gap-2 sm:min-w-[11rem] sm:flex-1">
                  <input
                    className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-copper"
                    placeholder="Material — e.g. Oak"
                    value={s.material}
                    onChange={(e) => setSwatch(i, "material", e.target.value)}
                  />
                  <input
                    className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm outline-none focus:border-copper"
                    placeholder="Note — e.g. darkens"
                    value={s.note}
                    onChange={(e) => setSwatch(i, "note", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        title="Section headings"
        note="The eyebrow + heading above each section. *asterisks* = accent colour. The 01–07 numbers stay fixed."
      >
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          <Text label="Before / After — eyebrow" value={form.patinaEyebrow} onChange={(v) => set("patinaEyebrow", v)} />
          <Text label="Before / After — heading" value={form.patinaHeading} onChange={(v) => set("patinaHeading", v)} />
          <Text label="Work — eyebrow" value={form.workEyebrow} onChange={(v) => set("workEyebrow", v)} />
          <Text label="Work — heading" value={form.workHeading} onChange={(v) => set("workHeading", v)} />
          <Text label="Services — eyebrow" value={form.servicesEyebrow} onChange={(v) => set("servicesEyebrow", v)} />
          <Text label="Services — heading" value={form.servicesHeading} onChange={(v) => set("servicesHeading", v)} />
          <Text label="Process — eyebrow" value={form.processEyebrow} onChange={(v) => set("processEyebrow", v)} />
          <Text label="Process — heading" value={form.processHeading} onChange={(v) => set("processHeading", v)} />
          <Text label="In their words — label" value={form.testimonialsHeading} onChange={(v) => set("testimonialsHeading", v)} />
        </div>
      </Section>

      <Section title="About" note="*asterisks* = accent colour in the heading.">
        <Text label="Eyebrow" value={form.aboutEyebrow} onChange={(v) => set("aboutEyebrow", v)} />
        <Text label="Heading" value={form.aboutHeading} onChange={(v) => set("aboutHeading", v)} />
        <Area label="Paragraph" value={form.aboutBody} onChange={(v) => set("aboutBody", v)} rows={4} />
        <ImageField
          label="Image"
          hint="The framed plate next to the paragraph."
          value={form.aboutImage}
          onChange={(url) => set("aboutImage", url)}
        />
        <Text label="Image caption" value={form.aboutImageCaption} onChange={(v) => set("aboutImageCaption", v)} />
        <div>
          <span className={labelText}>Facts (label / value)</span>
          <div className="mt-2 space-y-2">
            {form.aboutFacts.map((fact, i) => (
              <div key={i} className="grid grid-cols-2 gap-2">
                <input
                  className="rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-sm outline-none focus:border-copper"
                  placeholder="Founded"
                  value={fact.label}
                  onChange={(e) => setFact(i, "label", e.target.value)}
                />
                <input
                  className="rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-sm outline-none focus:border-copper"
                  placeholder="2026"
                  value={fact.value}
                  onChange={(e) => setFact(i, "value", e.target.value)}
                />
              </div>
            ))}
          </div>
          <span className="mt-1 block text-[11px] text-ink/40">
            Leave a row blank to hide it.
          </span>
        </div>
      </Section>

      <Section title="Get in touch (CTA)">
        <Text label="Eyebrow" value={form.ctaEyebrow} onChange={(v) => set("ctaEyebrow", v)} />
        <Text label="Heading" value={form.ctaHeading} onChange={(v) => set("ctaHeading", v)} />
        <Area label="Paragraph" value={form.ctaBody} onChange={(v) => set("ctaBody", v)} rows={2} />
        <Text label="Link label" value={form.ctaLinkLabel} onChange={(v) => set("ctaLinkLabel", v)} />
      </Section>

      <Section title="Contact & footer">
        <div className="grid gap-5 sm:grid-cols-2">
          <Text label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} />
          <Text label="Phone" value={form.phone} onChange={(v) => set("phone", v)} />
          <Text label="WhatsApp number" value={form.whatsappNumber} onChange={(v) => set("whatsappNumber", v)} hint="Digits only, with country code — e.g. 6285110546164" />
          <Text label="Instagram URL" value={form.instagramUrl} onChange={(v) => set("instagramUrl", v)} />
        </div>
        <Text label="WhatsApp prefilled message" value={form.whatsappMessage} onChange={(v) => set("whatsappMessage", v)} />
        <Text label="Address line" value={form.addressLine} onChange={(v) => set("addressLine", v)} />
        <Area label="Footer blurb" value={form.footerBlurb} onChange={(v) => set("footerBlurb", v)} rows={2} />
      </Section>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="sticky bottom-3 z-10 flex items-center gap-3 rounded-full border border-ink/10 bg-paper/95 px-4 py-3 shadow-lift backdrop-blur sm:bottom-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-6 py-2.5 text-sm text-parchment hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save settings"}
        </button>
        {saved && <span className="text-xs text-emerald-700">Saved.</span>}
      </div>
    </form>
  );
}
