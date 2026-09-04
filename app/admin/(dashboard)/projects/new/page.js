import ProjectForm from "@/app/admin/_components/ProjectForm";
import { listCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";
export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  const categories = await listCategories();
  return <ProjectForm initial={null} categories={categories} />;
}
