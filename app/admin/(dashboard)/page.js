import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteProjectAction, setProjectStatusAction } from "@/app/admin/actions";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import StatusControl from "@/app/admin/_components/StatusControl";

export const dynamic = "force-dynamic";

const PER_PAGE = 6;
const STATUS_FILTERS = ["PUBLISHED", "DRAFT", "HIDDEN"];

function buildHref({ status, page }) {
  const sp = new URLSearchParams();
  if (status) sp.set("status", status);
  if (page && page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `/admin?${qs}` : "/admin";
}

export default async function AdminProjectsPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const status = STATUS_FILTERS.includes(sp.status) ? sp.status : null;
  const requestedPage = Math.max(1, Number(sp.page) || 1);

  const where = status ? { status } : {};

  const [total, grouped] = await Promise.all([
    prisma.project.count({ where }),
    prisma.project.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = grouped.reduce(
    (acc, g) => ({ ...acc, [g.status]: g._count._all }),
    {}
  );
  const totalAll = grouped.reduce((n, g) => n + g._count._all, 0);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(requestedPage, totalPages);

  const projects = await prisma.project.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { gallery: true } } },
    skip: (page - 1) * PER_PAGE,
    take: PER_PAGE,
  });

  const tabs = [
    { key: null, label: "All", count: totalAll },
    ...STATUS_FILTERS.map((s) => ({
      key: s,
      label: s.charAt(0) + s.slice(1).toLowerCase(),
      count: counts[s] || 0,
    })),
  ];

  const rangeStart = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const rangeEnd = Math.min(page * PER_PAGE, total);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div>
          <h1 className="font-display text-2xl italic text-ink sm:text-3xl">
            Projects
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            {total === 0
              ? "Nothing here yet."
              : `Showing ${rangeStart}–${rangeEnd} of ${total}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/categories"
            className="text-xs text-ink/50 hover:text-ink"
          >
            Manage categories
          </Link>
          <Link
            href="/admin/projects/new"
            className="rounded-full bg-ink px-4 py-2.5 text-sm text-parchment hover:opacity-90"
          >
            + New project
          </Link>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-ink/10 pb-4">
        {tabs.map((t) => {
          const active = t.key === status;
          return (
            <Link
              key={t.label}
              href={buildHref({ status: t.key, page: 1 })}
              className={
                "rounded-full px-3.5 py-1.5 text-xs transition-colors " +
                (active
                  ? "bg-ink text-parchment"
                  : "border border-ink/15 text-ink/60 hover:border-ink/40")
              }
            >
              {t.label}
              <span className={active ? "ml-1.5 text-parchment/60" : "ml-1.5 text-ink/35"}>
                {t.count}
              </span>
            </Link>
          );
        })}
      </div>

      {projects.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-ink/50">
          {totalAll === 0 ? (
            <>
              No projects yet. Create your first one, or run{" "}
              <code className="font-mono text-xs">npm run db:seed</code> to import
              the original portfolio.
            </>
          ) : (
            <>Nothing with this status.</>
          )}
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white/60 p-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-ink/5 sm:h-16 sm:w-24">
                  {p.heroImage && (
                    <Image
                      src={p.heroImage}
                      alt=""
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base text-ink sm:text-lg">
                    {p.name}
                  </p>
                  <p className="truncate font-mono text-[11px] uppercase tracking-wide text-ink/45">
                    {[p.category, p.location, p.year].filter(Boolean).join(" — ")} ·{" "}
                    {p._count.gallery} gallery
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3 sm:border-0 sm:pt-0">
                <StatusControl
                  id={p.id}
                  status={p.status}
                  action={setProjectStatusAction}
                />
                <div className="flex gap-2">
                  {p.status === "PUBLISHED" && (
                    <Link
                      href={`/work/${p.slug}`}
                      target="_blank"
                      className="rounded-full border border-ink/15 px-3 py-2 text-xs text-ink/60 hover:border-ink/40"
                    >
                      View
                    </Link>
                  )}
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="rounded-full border border-ink/15 px-3 py-2 text-xs text-ink/80 hover:border-ink/40"
                  >
                    Edit
                  </Link>
                  <DeleteButton
                    id={p.id}
                    name={p.name}
                    action={deleteProjectAction}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-8 flex items-center justify-between gap-4 text-sm"
        >
          <PageLink
            href={buildHref({ status, page: page - 1 })}
            disabled={page <= 1}
          >
            ← Previous
          </PageLink>

          <span className="text-xs text-ink/50 sm:hidden">
            Page {page} of {totalPages}
          </span>
          <div className="hidden items-center gap-1 sm:flex">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={buildHref({ status, page: n })}
                aria-current={n === page ? "page" : undefined}
                className={
                  "min-w-8 rounded-lg px-2.5 py-1.5 text-center text-xs transition-colors " +
                  (n === page
                    ? "bg-ink text-parchment"
                    : "text-ink/55 hover:bg-ink/5")
                }
              >
                {n}
              </Link>
            ))}
          </div>

          <PageLink
            href={buildHref({ status, page: page + 1 })}
            disabled={page >= totalPages}
          >
            Next →
          </PageLink>
        </nav>
      )}
    </div>
  );
}

function PageLink({ href, disabled, children }) {
  if (disabled) {
    return (
      <span className="rounded-full border border-ink/10 px-4 py-2 text-xs text-ink/25">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="rounded-full border border-ink/15 px-4 py-2 text-xs text-ink/70 hover:border-ink/40"
    >
      {children}
    </Link>
  );
}
