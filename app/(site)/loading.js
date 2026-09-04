// Shown while a dynamic page's data loads. Deliberately quiet — just the
// paper ground and a faint mark, so there's no white flash before paint.
export default function Loading() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-bone">
      <span className="font-display text-lg italic text-noir/20">
        Evermore Design
      </span>
    </div>
  );
}
