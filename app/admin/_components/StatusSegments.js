"use client";

const OPTIONS = [
  { value: "DRAFT", label: "Draft", hint: "Not on the site yet" },
  { value: "PUBLISHED", label: "Published", hint: "Live on the site" },
  { value: "HIDDEN", label: "Hidden", hint: "Pulled from the site" },
];

// Segmented Draft / Published / Hidden control for the project and
// testimonial edit forms.
export default function StatusSegments({ value, onChange }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white/60 p-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
      <span className="font-mono text-[10px] uppercase tracking-widest2 text-ink/50">
        Status
      </span>
      <div className="flex rounded-full border border-ink/15 p-0.5">
        {OPTIONS.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => onChange(s.value)}
            aria-pressed={value === s.value}
            className={
              "flex-1 rounded-full px-3 py-2 text-xs transition-colors sm:flex-none sm:px-3.5 " +
              (value === s.value
                ? "bg-ink text-parchment"
                : "text-ink/55 hover:text-ink")
            }
          >
            {s.label}
          </button>
        ))}
      </div>
      <span className="text-[11px] text-ink/40">
        {OPTIONS.find((s) => s.value === value)?.hint}
      </span>
    </div>
  );
}
