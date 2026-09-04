import Link from "next/link";
import { listSteps } from "@/lib/content";
import { deleteStepAction, setStepStatusAction } from "@/app/admin/actions";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import StatusControl from "@/app/admin/_components/StatusControl";
import MoveButtons from "@/app/admin/_components/MoveButtons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Process" };

export default async function ProcessAdminPage() {
  const items = await listSteps();
  const live = items.filter((s) => s.status === "PUBLISHED").length;
  const liveIndex = items
    .filter((s) => s.status === "PUBLISHED")
    .map((s) => s.id);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div>
          <h1 className="font-display text-2xl italic text-ink sm:text-3xl">
            Process
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            {items.length === 0
              ? "Nothing yet."
              : `${items.length} stage${items.length === 1 ? "" : "s"}, ${live} live · numbered by order`}
          </p>
        </div>
        <Link
          href="/admin/process/new"
          className="rounded-full bg-ink px-4 py-2.5 text-sm text-parchment hover:opacity-90"
        >
          + New stage
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-ink/50">
          No stages yet. Add one, or run{" "}
          <code className="font-mono text-xs">npm run db:seed</code>.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((s, i) => {
            const stageNo = liveIndex.indexOf(s.id);
            return (
              <li
                key={s.id}
                className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white/60 p-4 sm:flex-row sm:items-start sm:gap-4"
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <MoveButtons
                    entity="processStep"
                    id={s.id}
                    first={i === 0}
                    last={i === items.length - 1}
                  />
                  <span className="mt-0.5 font-mono text-[11px] text-ink/35">
                    {stageNo >= 0 ? String(stageNo + 1).padStart(2, "0") : "—"}
                  </span>
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
                    action={setStepStatusAction}
                  />
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/process/${s.id}`}
                      className="rounded-full border border-ink/15 px-3 py-2 text-xs text-ink/80 hover:border-ink/40"
                    >
                      Edit
                    </Link>
                    <DeleteButton
                      id={s.id}
                      name={s.title}
                      action={deleteStepAction}
                    />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
