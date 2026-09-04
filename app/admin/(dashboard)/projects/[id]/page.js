import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProjectForm from "@/app/admin/_components/ProjectForm";
import { listCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }) {
  const { id } = await params;
  const [project, categories] = await Promise.all([
    prisma.project.findUnique({
      where: { id },
      include: { gallery: { orderBy: { sortOrder: "asc" } } },
    }),
    listCategories(),
  ]);
  if (!project) notFound();

  return <ProjectForm initial={project} categories={categories} />;
}
