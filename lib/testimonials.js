import { prisma } from "@/lib/prisma";

// The "In their words" quotes shown on the public site — PUBLISHED only.
export async function getPublishedTestimonials() {
  return prisma.testimonial.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

// Every testimonial, any status — for the admin list.
export async function listTestimonials() {
  return prisma.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function getTestimonial(id) {
  return prisma.testimonial.findUnique({ where: { id } });
}
