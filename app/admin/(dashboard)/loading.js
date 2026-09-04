export default function Loading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-9 w-48 rounded-lg bg-ink/10" />
      <div className="h-4 w-64 rounded bg-ink/5" />
      <div className="space-y-3 pt-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-2xl border border-ink/10 bg-white/40" />
        ))}
      </div>
    </div>
  );
}
