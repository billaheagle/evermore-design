import Link from "next/link";
import { listCategoriesWithUsage } from "@/lib/categories";
import CategoryManager from "@/app/admin/_components/CategoryManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await listCategoriesWithUsage();

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl italic text-ink sm:text-3xl">
            Categories
          </h1>
          <p className="mt-1 text-sm text-ink/50">
            The options shown when choosing a project&rsquo;s category.
          </p>
        </div>
        <Link
          href="/admin"
          className="shrink-0 pt-1.5 text-xs text-ink/50 hover:text-ink"
        >
          ← Projects
        </Link>
      </div>

      <div className="mt-6 sm:mt-8">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
