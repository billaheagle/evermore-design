import Link from "next/link";
import { listServices } from "@/lib/content";
import {
  deleteServiceAction,
  setServiceStatusAction,
} from "@/app/admin/actions";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import StatusControl from "@/app/admin/_components/StatusControl";
import MoveButtons from "@/app/admin/_components/MoveButtons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Services" };

export default async function ServicesAdminPage() {
  const items = await listServices();
  const live = items.filter((s) => s.status === "PUBLISHED").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div>
          <h1 className="font-display text-2xl italic text-ink sm:text-3xl">
            Services
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            {items.length === 0
              ? "Nothing yet."
              : `${items.length} service${items.length === 1 ? "" : "s"}, ${live} live · the “How we get involved” list`}
          </p>
        </div>
        <Link
          href="/admin/services/new"
          className="rounded-full bg-ink px-4 py-2.5 text-sm text-parchment hover:opacity-90"
        >
          + New service
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-ink/50">
          No services yet. Add one, or run{" "}
          <code className="font-mono text-xs">npm run db:seed</code>.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((s, i) => (
            <li
              key={s.id}
              className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white/60 p-4 sm:flex-row sm:items-start sm:gap-4"
            >
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <MoveButtons
                  entity="service"
                  id={s.id}
                  first={i === 0}
                  last={i === items.length - 1}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base text-ink sm:text-lg">
                    {s.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-ink/55">
                    {s.description}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3 sm:border-0 sm:pt-0">
                <StatusControl
                  id={s.id}
                  status={s.status}
                  action={setServiceStatusAction}
                />
                <div className="flex gap-2">
                  <Link
                    href={`/admin/services/${s.id}`}
                    className="rounded-full border border-ink/15 px-3 py-2 text-xs text-ink/80 hover:border-ink/40"
                  >
                    Edit
                  </Link>
                  <DeleteButton
                    id={s.id}
                    name={s.title}
                    action={deleteServiceAction}
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
