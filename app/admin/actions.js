"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  checkCredentials,
  createSessionToken,
  sessionCookieOptions,
  verifySessionToken,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteUploadedFiles } from "@/lib/uploads";

// ---- auth ------------------------------------------------------------------

export async function loginAction({ username, password, from }) {
  if (!checkCredentials(String(username || ""), String(password || ""))) {
    return { error: "Wrong username or password." };
  }

  const token = await createSessionToken(String(username));
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
  const dest = typeof from === "string" && from.startsWith("/admin") ? from : "/admin";
  redirect(dest);
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

async function assertAuthed() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) redirect("/admin/login");
}

// ---- projects ------------------------------------------------------------

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(desired, ignoreId) {
  const base = slugify(desired) || "project";
  let slug = base;
  let n = 2;
  // Loop until we find a slug not taken by a different project.
  // Small table, so a handful of queries is fine.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (!existing || existing.id === ignoreId) return slug;
    slug = `${base}-${n++}`;
  }
}

const PROJECT_STATUSES = ["DRAFT", "PUBLISHED", "HIDDEN"];

function normalizeStatus(value) {
  const v = String(value || "").toUpperCase();
  return PROJECT_STATUSES.includes(v) ? v : "PUBLISHED";
}

function normalizeGallery(gallery) {
  if (!Array.isArray(gallery)) return [];
  return gallery
    .map((g, i) => ({
      src: String(g?.src || "").trim(),
      wide: Boolean(g?.wide),
      sortOrder: i,
    }))
    .filter((g) => g.src);
}

// `input` is a plain object sent from the admin form:
// { id?, name, slug?, location, year, category, scope, concept,
//   heroImage, beforeImage, afterImage, sortOrder, gallery: [{src, wide}] }
export async function saveProjectAction(input) {
  await assertAuthed();

  const name = String(input?.name || "").trim();
  const heroImage = String(input?.heroImage || "").trim();
  if (!name) return { error: "Name is required." };
  if (!heroImage) return { error: "A hero image is required." };

  const data = {
    name,
    location: String(input?.location || "").trim(),
    year: String(input?.year || "").trim(),
    category: String(input?.category || "Residential").trim() || "Residential",
    scope: String(input?.scope || "").trim(),
    concept: String(input?.concept || "").trim(),
    heroImage,
    beforeImage: String(input?.beforeImage || "").trim() || null,
    afterImage: String(input?.afterImage || "").trim() || null,
    status: normalizeStatus(input?.status),
    sortOrder: Number.isFinite(Number(input?.sortOrder)) ? Number(input.sortOrder) : 0,
  };

  const gallery = normalizeGallery(input?.gallery);
  const id = input?.id ? String(input.id) : null;
  const slug = await uniqueSlug(input?.slug || name, id);

  if (id) {
    // Clean up any uploaded images this edit dropped (replaced hero/before/
    // after, or removed gallery items).
    const prev = await prisma.project.findUnique({
      where: { id },
      include: { gallery: true },
    });
    if (prev) {
      const before = new Set(
        [prev.heroImage, prev.beforeImage, prev.afterImage, ...prev.gallery.map((g) => g.src)].filter(Boolean)
      );
      const after = new Set(
        [data.heroImage, data.beforeImage, data.afterImage, ...gallery.map((g) => g.src)].filter(Boolean)
      );
      await deleteUploadedFiles([...before].filter((u) => !after.has(u)));
    }

    await prisma.project.update({
      where: { id },
      data: {
        ...data,
        slug,
        gallery: {
          deleteMany: {},
          create: gallery,
        },
      },
    });
  } else {
    await prisma.project.create({
      data: { ...data, slug, gallery: { create: gallery } },
    });
  }

  revalidatePath("/");
  revalidatePath("/work/[slug]", "page");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProjectAction(formData) {
  await assertAuthed();
  const id = String(formData.get("id") || "");
  if (!id) return;

  const project = await prisma.project.findUnique({
    where: { id },
    include: { gallery: true },
  });
  await prisma.project.delete({ where: { id } });
  if (project) {
    await deleteUploadedFiles([
      project.heroImage,
      project.beforeImage,
      project.afterImage,
      ...project.gallery.map((g) => g.src),
    ]);
  }

  revalidatePath("/");
  revalidatePath("/work/[slug]", "page");
  revalidatePath("/admin");
}

// Quick status change from the projects list (Draft / Published / Hidden),
// without opening the full edit form.
export async function setProjectStatusAction(formData) {
  await assertAuthed();
  const id = String(formData.get("id") || "");
  const status = normalizeStatus(formData.get("status"));
  if (!id) return;
  await prisma.project.update({ where: { id }, data: { status } });
  revalidatePath("/");
  revalidatePath("/work/[slug]", "page");
  revalidatePath("/admin");
}

// ---- categories --------------------------------------------------------

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/work/[slug]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
}

export async function createCategoryAction(formData) {
  await assertAuthed();
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "A name is required." };

  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return { error: "That category already exists." };

  const count = await prisma.category.count();
  await prisma.category.create({
    data: { name, slug: slugify(name) || `category-${count + 1}`, sortOrder: count },
  });
  revalidateAll();
  return { ok: true };
}

export async function renameCategoryAction(formData) {
  await assertAuthed();
  const id = String(formData.get("id") || "");
  const name = String(formData.get("name") || "").trim();
  if (!id || !name) return { error: "A name is required." };

  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) return { error: "Category not found." };
  if (name === current.name) return { ok: true };

  const clash = await prisma.category.findUnique({ where: { name } });
  if (clash) return { error: "Another category already has that name." };

  // Rename cascades to every project using the old string value.
  await prisma.$transaction([
    prisma.category.update({
      where: { id },
      data: { name, slug: slugify(name) || current.slug },
    }),
    prisma.project.updateMany({
      where: { category: current.name },
      data: { category: name },
    }),
  ]);
  revalidateAll();
  return { ok: true };
}

export async function deleteCategoryAction(formData) {
  await assertAuthed();
  const id = String(formData.get("id") || "");
  if (!id) return;
  // Projects keep their string category value; it just leaves the dropdown.
  await prisma.category.delete({ where: { id } });
  revalidateAll();
}

// ---- testimonials ("In their words") ---------------------------------

// `input` is a plain object from the admin form:
//   { id?, quote, name, location, status, sortOrder }
export async function saveTestimonialAction(input) {
  await assertAuthed();

  const quote = String(input?.quote || "").trim();
  const name = String(input?.name || "").trim();
  if (!quote) return { error: "A quote is required." };
  if (!name) return { error: "A name is required." };

  const data = {
    quote,
    name,
    location: String(input?.location || "").trim(),
    status: normalizeStatus(input?.status),
    sortOrder: Number.isFinite(Number(input?.sortOrder))
      ? Number(input.sortOrder)
      : 0,
  };

  const id = input?.id ? String(input.id) : null;
  if (id) {
    await prisma.testimonial.update({ where: { id }, data });
  } else {
    await prisma.testimonial.create({ data });
  }

  revalidatePath("/");
  revalidatePath("/admin/testimonials");
  redirect("/admin/testimonials");
}

export async function deleteTestimonialAction(formData) {
  await assertAuthed();
  const id = String(formData.get("id") || "");
  if (!id) return;
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function setTestimonialStatusAction(formData) {
  await assertAuthed();
  const id = String(formData.get("id") || "");
  const status = normalizeStatus(formData.get("status"));
  if (!id) return;
  await prisma.testimonial.update({ where: { id }, data: { status } });
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

// ---- services --------------------------------------------------------

export async function saveServiceAction(input) {
  await assertAuthed();
  const title = String(input?.title || "").trim();
  if (!title) return { error: "A title is required." };
  const data = {
    title,
    description: String(input?.description || "").trim(),
    status: normalizeStatus(input?.status),
    sortOrder: Number.isFinite(Number(input?.sortOrder)) ? Number(input.sortOrder) : 0,
  };
  const id = input?.id ? String(input.id) : null;
  if (id) await prisma.service.update({ where: { id }, data });
  else {
    const count = await prisma.service.count();
    await prisma.service.create({ data: { ...data, sortOrder: count } });
  }
  revalidatePath("/");
  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function deleteServiceAction(formData) {
  await assertAuthed();
  const id = String(formData.get("id") || "");
  if (id) await prisma.service.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/services");
}

export async function setServiceStatusAction(formData) {
  await assertAuthed();
  const id = String(formData.get("id") || "");
  if (id)
    await prisma.service.update({
      where: { id },
      data: { status: normalizeStatus(formData.get("status")) },
    });
  revalidatePath("/");
  revalidatePath("/admin/services");
}

// ---- process steps -------------------------------------------------

export async function saveStepAction(input) {
  await assertAuthed();
  const title = String(input?.title || "").trim();
  if (!title) return { error: "A title is required." };
  const data = {
    title,
    description: String(input?.description || "").trim(),
    status: normalizeStatus(input?.status),
    sortOrder: Number.isFinite(Number(input?.sortOrder)) ? Number(input.sortOrder) : 0,
  };
  const id = input?.id ? String(input.id) : null;
  if (id) await prisma.processStep.update({ where: { id }, data });
  else {
    const count = await prisma.processStep.count();
    await prisma.processStep.create({ data: { ...data, sortOrder: count } });
  }
  revalidatePath("/");
  revalidatePath("/admin/process");
  redirect("/admin/process");
}

export async function deleteStepAction(formData) {
  await assertAuthed();
  const id = String(formData.get("id") || "");
  if (id) await prisma.processStep.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/process");
}

export async function setStepStatusAction(formData) {
  await assertAuthed();
  const id = String(formData.get("id") || "");
  if (id)
    await prisma.processStep.update({
      where: { id },
      data: { status: normalizeStatus(formData.get("status")) },
    });
  revalidatePath("/");
  revalidatePath("/admin/process");
}

// ---- reorder (shared ↑ / ↓ buttons) ---------------------------------

const REORDER_MODELS = {
  service: (p) => p.service,
  processStep: (p) => p.processStep,
  testimonial: (p) => p.testimonial,
};

export async function moveEntityAction(formData) {
  await assertAuthed();
  const entity = String(formData.get("entity") || "");
  const id = String(formData.get("id") || "");
  const dir = Number(formData.get("dir")) < 0 ? -1 : 1;
  const model = REORDER_MODELS[entity]?.(prisma);
  if (!model || !id) return;

  const rows = await model.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  const i = rows.findIndex((r) => r.id === id);
  const j = i + dir;
  if (i === -1 || j < 0 || j >= rows.length) return;

  // Rewrite the whole list's sortOrder to its (swapped) index — keeps values
  // dense and avoids ties.
  const order = rows.map((r) => r.id);
  [order[i], order[j]] = [order[j], order[i]];
  await prisma.$transaction(
    order.map((rid, idx) =>
      model.update({ where: { id: rid }, data: { sortOrder: idx } })
    )
  );

  revalidatePath("/");
  revalidatePath(`/admin/${entity === "processStep" ? "process" : entity + "s"}`);
}

// ---- site settings ------------------------------------------------

const SETTINGS_STRINGS = [
  "heroEyebrow",
  "heroKicker",
  "heroHeadline",
  "heroCtaLabel",
  "patinaEyebrow",
  "patinaHeading",
  "workEyebrow",
  "workHeading",
  "servicesEyebrow",
  "servicesHeading",
  "processEyebrow",
  "processHeading",
  "testimonialsHeading",
  "aboutEyebrow",
  "aboutHeading",
  "aboutBody",
  "aboutImage",
  "aboutImageCaption",
  "ctaEyebrow",
  "ctaHeading",
  "ctaBody",
  "ctaLinkLabel",
  "email",
  "phone",
  "whatsappNumber",
  "whatsappMessage",
  "instagramUrl",
  "addressLine",
  "footerBlurb",
];

export async function saveSettingsAction(input) {
  await assertAuthed();

  const data = {};
  for (const key of SETTINGS_STRINGS) {
    data[key] = String(input?.[key] ?? "").trim();
  }
  data.aboutFacts = Array.isArray(input?.aboutFacts)
    ? input.aboutFacts
        .map((f) => ({
          label: String(f?.label ?? "").trim(),
          value: String(f?.value ?? "").trim(),
        }))
        .filter((f) => f.label || f.value)
    : [];

  data.heroSwatches = Array.isArray(input?.heroSwatches)
    ? input.heroSwatches
        .map((s) => ({
          image: String(s?.image ?? "").trim(),
          material: String(s?.material ?? "").trim(),
          note: String(s?.note ?? "").trim(),
        }))
        .filter((s) => s.image || s.material)
    : [];

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true };
}

// ---- inquiries (contact form) -----------------------------------

// Naive per-IP rate limit. In-memory, so it resets on redeploy and isn't
// shared across instances — enough to blunt a bot loop, not a real WAF.
const inquiryHits = new Map(); // ip -> number[] (timestamps)
const RL_WINDOW = 10 * 60 * 1000;
const RL_MAX = 4;

async function clientIp() {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

function rateLimited(ip) {
  const now = Date.now();
  const recent = (inquiryHits.get(ip) || []).filter((t) => now - t < RL_WINDOW);
  if (recent.length >= RL_MAX) {
    inquiryHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  inquiryHits.set(ip, recent);
  return false;
}

// Public — no auth. Called from the site's contact form.
export async function submitInquiryAction(input) {
  // Honeypot: real users never fill a hidden field. Silently accept & drop.
  if (String(input?.company || "").trim()) return { ok: true };
  // Too fast to be a human filling the form.
  const elapsed = Date.now() - Number(input?.startedAt || 0);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 2500) {
    return { ok: true };
  }

  const ip = await clientIp();
  if (rateLimited(ip)) {
    return { error: "Too many messages from here — please try again later." };
  }

  const name = String(input?.name || "").trim();
  const email = String(input?.email || "").trim();
  const message = String(input?.message || "").trim();
  if (!name || !email || !message) {
    return { error: "Please fill in your name, email and a message." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "That email address doesn't look right." };
  }
  if (message.length > 4000) {
    return { error: "That message is a little long — please trim it." };
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      name: name.slice(0, 120),
      email: email.slice(0, 160),
      projectType: String(input?.projectType || "").trim().slice(0, 120),
      message,
    },
  });

  await notifyInquiry(inquiry).catch(() => {});
  revalidatePath("/admin/inbox");
  return { ok: true };
}

// Optional email notification. No-op unless RESEND_API_KEY + INQUIRY_NOTIFY_TO
// are set — no dependency, just a fetch to Resend's API.
async function notifyInquiry(inquiry) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_NOTIFY_TO;
  if (!key || !to) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.INQUIRY_NOTIFY_FROM || "Evermore Design <onboarding@resend.dev>",
      to: [to],
      reply_to: inquiry.email,
      subject: `New enquiry — ${inquiry.name}`,
      text: [
        `Name: ${inquiry.name}`,
        `Email: ${inquiry.email}`,
        inquiry.projectType && `Project: ${inquiry.projectType}`,
        "",
        inquiry.message,
      ]
        .filter(Boolean)
        .join("\n"),
    }),
  });
}

export async function setInquiryHandledAction(formData) {
  await assertAuthed();
  const id = String(formData.get("id") || "");
  const handled = String(formData.get("handled")) === "true";
  if (id) await prisma.inquiry.update({ where: { id }, data: { handled } });
  revalidatePath("/admin/inbox");
}

export async function deleteInquiryAction(formData) {
  await assertAuthed();
  const id = String(formData.get("id") || "");
  if (id) await prisma.inquiry.delete({ where: { id } });
  revalidatePath("/admin/inbox");
}
