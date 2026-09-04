import { getProjects } from "@/lib/projects";

const SITE_URL = "https://evermore-design.com";

// Re-generate at most hourly so projects published in /admin appear without
// a redeploy, without hitting the database on every crawler request.
export const revalidate = 3600;

export default async function sitemap() {
  let projects = [];
  try {
    projects = await getProjects();
  } catch {
    // DB unreachable at build/revalidate time — still emit the home page.
    projects = [];
  }

  const now = new Date();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${SITE_URL}/work/${project.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    })),
  ];
}
