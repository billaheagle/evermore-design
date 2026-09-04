import { prisma } from "@/lib/prisma";

// Every query on this file is for the public site, so it only ever sees
// projects the admin has marked PUBLISHED. Drafts and hidden projects are
// invisible here (including on their /work/[slug] page).
const PUBLIC_WHERE = { status: "PUBLISHED" };

// Shapes a Prisma Project row into the plain object the public components
// already expect (`hero`, `before`, `after`, `gallery: [{ src, wide }]`),
// so the section components did not need to change when we moved off the
// old static data/projects.js file.
function toPublicProject(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    location: row.location,
    year: row.year,
    category: row.category,
    scope: row.scope,
    concept: row.concept,
    hero: row.heroImage,
    before: row.beforeImage || "",
    after: row.afterImage || "",
    gallery: (row.gallery || []).map((g) => ({ src: g.src, wide: g.wide })),
  };
}

export async function getProjects() {
  const rows = await prisma.project.findMany({
    where: PUBLIC_WHERE,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { gallery: { orderBy: { sortOrder: "asc" } } },
  });
  return rows.map(toPublicProject);
}

export async function getProjectBySlug(slug) {
  const row = await prisma.project.findFirst({
    where: { slug, ...PUBLIC_WHERE },
    include: { gallery: { orderBy: { sortOrder: "asc" } } },
  });
  return row ? toPublicProject(row) : null;
}

// "All" plus every distinct category actually in use, so the Work-section
// filter never shows a tab that resolves to an empty grid.
export async function getCategories() {
  const rows = await prisma.project.findMany({
    where: PUBLIC_WHERE,
    distinct: ["category"],
    select: { category: true },
    orderBy: { category: "asc" },
  });
  return ["All", ...rows.map((r) => r.category).filter(Boolean)];
}

// The Patina "before / after" section can only show projects that actually
// have both images, otherwise the slider renders a broken <Image>.
export async function getPatinaProjects(limit = 4) {
  const all = await getProjects();
  return all.filter((p) => p.before && p.after).slice(0, limit);
}
