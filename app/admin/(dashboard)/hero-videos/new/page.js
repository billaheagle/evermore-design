import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { countHeroVideos, MAX_HERO_VIDEOS } from "@/lib/heroVideos";
import HeroVideoForm from "@/app/admin/_components/HeroVideoForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Upload hero video" };

export default async function NewHeroVideoPage() {
  if ((await countHeroVideos()) >= MAX_HERO_VIDEOS) redirect("/admin/hero-videos");

  const projects = await prisma.project.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true, name: true, status: true },
  });
  return <HeroVideoForm initial={null} projects={projects} />;
}
