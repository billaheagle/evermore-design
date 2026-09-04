import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { defaultSettings } from "@/lib/siteDefaults";

// ---- services --------------------------------------------------------------

export function getPublishedServices() {
  return prisma.service.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}
export function listServices() {
  return prisma.service.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}
export function getService(id) {
  return prisma.service.findUnique({ where: { id } });
}

// ---- process steps -------------------------------------------------------

export function getPublishedSteps() {
  return prisma.processStep.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}
export function listSteps() {
  return prisma.processStep.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}
export function getStep(id) {
  return prisma.processStep.findUnique({ where: { id } });
}

// ---- site settings (singleton) -----------------------------------------

// Always returns a full settings object: any stored field that is blank/unset
// falls back to the seed default. Wrapped in React `cache` so the layout and
// the page share one query per request.
export const getSettings = cache(async () => {
  const row = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
  });
  const merged = { ...defaultSettings, id: "singleton" };
  if (row) {
    for (const [k, v] of Object.entries(row)) {
      if (v === null || v === undefined || v === "") continue;
      if (Array.isArray(v) && v.length === 0) continue;
      merged[k] = v;
    }
  }
  return merged;
});

// ---- inquiries (contact form inbox) -----------------------------------

export function listInquiries() {
  return prisma.inquiry.findMany({
    orderBy: [{ handled: "asc" }, { createdAt: "desc" }],
  });
}

export function countNewInquiries() {
  return prisma.inquiry.count({ where: { handled: false } });
}
