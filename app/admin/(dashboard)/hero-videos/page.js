import Link from "next/link";
import { listHeroVideos, MAX_HERO_VIDEOS } from "@/lib/heroVideos";
import {
  deleteHeroVideoAction,
  setHeroVideoStatusAction,
} from "@/app/admin/actions";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import MoveButtons from "@/app/admin/_components/MoveButtons";
import StatusControl from "@/app/admin/_components/StatusControl";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hero videos" };

export default async function HeroVideosAdminPage() {
  const items = await listHeroVideos();
  const live = items.filter((v) => v.status === "PUBLISHED").length;
  const full = items.length >= MAX_HERO_VIDEOS;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3">
        <div>
          <h1 className="font-display text-2xl italic text-ink sm:text-3xl">
            Hero videos
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            {items.length} / {MAX_HERO_VIDEOS} videos, {live} live
          </p>
        </div>
        {full ? (
          <span className="rounded-full border border-ink/15 px-4 py-2.5 text-sm text-ink/40">
            Limit of {MAX_HERO_VIDEOS} reached
          </span>
        ) : (
          <Link
            href="/admin/hero-videos/new"
            className="rounded-full bg-ink px-4 py-2.5 text-sm text-parchment hover:opacity-90"
          >
            + Upload video
          </Link>
        )}
      </div>

      <p className="mt-4 max-w-2xl text-sm text-ink/55">
        Short clips that play under the homepage headline, in this order.
        Landscape 16:9, 10–15 seconds; they start muted and visitors can turn the sound on. An optional portrait cut is used on upright phones. Keep each file under about
        4 MB so the page stays fast. Caption and project link are optional;
        without a link the &ldquo;View project&rdquo; button is hidden. With
        no live videos, the hero shows the material swatches instead.
      </p>

      {items.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-ink/50">
          No videos yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((v, i) => (
            <li
              key={v.id}
              className="flex flex-col gap-3 rounded-2xl border border-ink/10 bg-white/60 p-4 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                <MoveButtons
                  entity="heroVideo"
                  id={v.id}
                  first={i === 0}
                  last={i === items.length - 1}
                />
                <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-lg bg-noir sm:w-40">
                  {v.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v.poster} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <video
                      src={`${v.src}#t=0.1`}
                      muted
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover"
                    />
                  )}
                  <span className="absolute left-1.5 top-1.5 rounded bg-noir/70 px-1.5 font-mono text-[10px] text-bone">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base text-ink sm:text-lg">
                    {v.caption || (
                      <span className="italic text-ink/40">No caption</span>
                    )}
                  </p>
                  {v.note && (
                    <p className="mt-0.5 truncate text-sm text-ink/55">{v.note}</p>
                  )}
                  <p className="mt-1 truncate font-mono text-[11px] uppercase tracking-wide text-ink/45">
                    {v.project
                      ? `→ ${v.project.name}${v.project.status === "PUBLISHED" ? "" : " (not published, link hidden)"}`
                      : "No project link"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-ink/10 pt-3 sm:border-0 sm:pt-0">
                <StatusControl
                  id={v.id}
                  status={v.status}
                  action={setHeroVideoStatusAction}
                />
                <div className="flex gap-2">
                  <Link
                    href={`/admin/hero-videos/${v.id}`}
                    className="rounded-full border border-ink/15 px-3 py-2 text-xs text-ink/80 hover:border-ink/40"
                  >
                    Edit
                  </Link>
                  <DeleteButton
                    id={v.id}
                    name={v.caption || `video ${i + 1}`}
                    action={deleteHeroVideoAction}
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
