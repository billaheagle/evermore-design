import { prisma } from "@/lib/prisma";

// The managed category list, used by the admin project form. Ordered by the
// admin-set sortOrder then name. (Named `listCategories`, not `getCategories`,
// to avoid confusion with lib/projects.js's public Work-filter helper.)
export async function listCategories() {
  return prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

// Category rows + how many projects currently use each (by string match),
// for the /admin/categories manager.
export async function listCategoriesWithUsage() {
  const [categories, projects] = await Promise.all([
    listCategories(),
    prisma.project.groupBy({ by: ["category"], _count: { _all: true } }),
  ]);
  const usage = projects.reduce(
    (acc, p) => ({ ...acc, [p.category]: p._count._all }),
    {}
  );
  return categories.map((c) => ({ ...c, projectCount: usage[c.name] || 0 }));
}
