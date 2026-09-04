import Link from "next/link";
import { listTestimonials } from "@/lib/testimonials";
import {
  deleteTestimonialAction,
  setTestimonialStatusAction,
} from "@/app/admin/actions";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import StatusControl from "@/app/admin/_components/StatusControl";

export const dynamic = "force-dynamic";
export const metadata = { title: "In their words" };

export default async function TestimonialsAdminPage() {
  const items = await listTestimonials();
  const live = items.filter((t) => t.status === "PUBLISHED").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div>
          <h1 className="font-display text-2xl italic text-ink sm:text-3xl">
            In their words
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            {items.length === 0
              ? "No quotes yet."
              : `${items.length} quote${items.length === 1 ? "" : "s"}, ${live} live`}
          </p>
        </div>
        <Link
          href="/admin/testimonials/new"
          className="rounded-full bg-ink px-4 py-2.5 text-sm text-parchment hover:opacity-90"
        >
          + New quote
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-ink/50">
          No quotes yet. Add one, or run{" "}
          <code className="font-mono text-xs">npm run db:seed</code> to import
          the originals.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((t) => (
            <li
              key={t.id}
              className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white/60 p-4 sm:flex-row sm:items-start sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <p className="line-clamp-3 font-display text-[15px] italic leading-snug text-ink/80 sm:line-clamp-2">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wide text-ink/45">
                  {[t.name, t.location].filter(Boolean).join(" — ")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3 sm:border-0 sm:pt-0">
                <StatusControl
                  id={t.id}
                  status={t.status}
                  action={setTestimonialStatusAction}
                />
                <div className="flex gap-2">
                  <Link
                    href={`/admin/testimonials/${t.id}`}
                    className="rounded-full border border-ink/15 px-3 py-2 text-xs text-ink/80 hover:border-ink/40"
                  >
                    Edit
                  </Link>
                  <DeleteButton
                    id={t.id}
                    name={`the quote from ${t.name}`}
                    action={deleteTestimonialAction}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
