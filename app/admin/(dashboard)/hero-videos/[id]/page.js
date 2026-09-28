import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getHeroVideo } from "@/lib/heroVideos";
import HeroVideoForm from "@/app/admin/_components/HeroVideoForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit hero video" };

export default async function EditHeroVideoPage({ params }) {
  const { id } = await params;
  const [video, projects] = await Promise.all([
    getHeroVideo(id),
    prisma.project.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { id: true, name: true, status: true },
    }),
  ]);
  if (!video) notFound();

  return <HeroVideoForm initial={video} projects={projects} />;
}
