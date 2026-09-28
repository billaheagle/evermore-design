import { prisma } from "@/lib/prisma";

// The homepage carousel never shows more than this many clips; the admin
// refuses to add past it.
export const MAX_HERO_VIDEOS = 5;

// PUBLISHED clips for the homepage hero, shaped for the carousel. `href` is
// only set when the linked project is itself published — otherwise the
// "View project" link would lead to a 404.
export async function getHeroVideos() {
  const rows = await prisma.heroVideo.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: MAX_HERO_VIDEOS,
    include: { project: { select: { slug: true, status: true } } },
  });
  return rows.map((v) => ({
    id: v.id,
    src: v.src,
    srcPortrait: v.srcPortrait,
    poster: v.poster,
    caption: v.caption,
    note: v.note,
    href:
      v.project?.status === "PUBLISHED" ? `/work/${v.project.slug}` : "",
  }));
}

// Every clip, any status — for the admin list.
export async function listHeroVideos() {
  return prisma.heroVideo.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { project: { select: { name: true, status: true } } },
  });
}

export async function getHeroVideo(id) {
  return prisma.heroVideo.findUnique({ where: { id } });
}

export async function countHeroVideos() {
  return prisma.heroVideo.count();
}
