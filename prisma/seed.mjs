// Seeds the database with the studio's existing portfolio (prisma/seed-data.mjs).
// Safe to re-run: it upserts by slug and rebuilds each project's gallery.

import { PrismaClient } from "@prisma/client";
import { projects } from "./seed-data.mjs";
import { testimonials } from "../data/testimonials.js";
import { services } from "../data/services.js";
import { process as processSteps } from "../data/process.js";
import { defaultSettings } from "../lib/siteDefaults.js";

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  "Residential",
  "Apartment",
  "Commercial",
  "Hospitality",
];

function slugify(v) {
  return v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seedCategories() {
  // Seed the managed list from the defaults plus any category string already
  // used by a project, so the dropdown covers everything on first run.
  const used = await prisma.project.findMany({
    distinct: ["category"],
    select: { category: true },
  });
  const names = [
    ...new Set([...DEFAULT_CATEGORIES, ...used.map((u) => u.category)]),
  ].filter(Boolean);

  let i = 0;
  for (const name of names) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name, slug: slugify(name), sortOrder: i++ },
    });
  }
  console.log(`  ✓ ${names.length} categories`);
}

async function seedTestimonials() {
  // Only seed on an empty table — after that the admin panel owns this data.
  if ((await prisma.testimonial.count()) > 0) return;
  let i = 0;
  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: {
        quote: t.quote,
        name: t.name,
        location: t.location ?? "",
        sortOrder: i++,
      },
    });
  }
  console.log(`  ✓ ${testimonials.length} testimonials`);
}

async function seedServices() {
  if ((await prisma.service.count()) > 0) return;
  let i = 0;
  for (const s of services) {
    await prisma.service.create({
      data: { title: s.title, description: s.description ?? "", sortOrder: i++ },
    });
  }
  console.log(`  ✓ ${services.length} services`);
}

async function seedProcess() {
  if ((await prisma.processStep.count()) > 0) return;
  let i = 0;
  for (const p of processSteps) {
    await prisma.processStep.create({
      data: { title: p.title, description: p.description ?? "", sortOrder: i++ },
    });
  }
  console.log(`  ✓ ${processSteps.length} process steps`);
}

async function seedSettings() {
  const existing = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  if (existing) return;
  await prisma.siteSettings.create({
    data: { id: "singleton", ...defaultSettings },
  });
  console.log("  ✓ site settings");
}

async function main() {
  let i = 0;
  for (const p of projects) {
    const base = {
      name: p.name,
      location: p.location ?? "",
      year: p.year ?? "",
      category: p.category ?? "Residential",
      scope: p.scope ?? "",
      concept: p.concept ?? "",
      heroImage: p.hero,
      beforeImage: p.before ? p.before : null,
      afterImage: p.after ? p.after : null,
      sortOrder: i++,
    };

    const gallery = {
      create: (p.gallery ?? []).map((g, idx) => ({
        src: g.src,
        wide: Boolean(g.wide),
        sortOrder: idx,
      })),
    };

    await prisma.project.upsert({
      where: { slug: p.slug },
      update: { ...base, gallery: { deleteMany: {}, ...gallery } },
      create: { slug: p.slug, ...base, gallery },
    });

    console.log(`  ✓ ${p.slug}`);
  }

  await seedCategories();
  await seedTestimonials();
  await seedServices();
  await seedProcess();
  await seedSettings();
}

main()
  .then(async () => {
    const count = await prisma.project.count();
    console.log(`Seed complete — ${count} projects in the database.`);
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
