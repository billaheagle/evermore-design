import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjects, getProjectBySlug } from "@/lib/projects";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import ProjectGallery from "@/components/ui/ProjectGallery";
import ZoomableImage from "@/components/ui/ZoomableImage";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  return {
    title: project.name,
    description: project.concept,
    openGraph: {
      title: `${project.name} — Evermore Design`,
      description: project.concept,
      images: project.hero
        ? [{ url: project.hero, width: 1200, height: 800 }]
        : [],
    },
  };
}

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const [project, projects] = await Promise.all([
    getProjectBySlug(slug),
    getProjects(),
  ]);
  if (!project) notFound();

  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(currentIndex + 1) % projects.length] || project;
  const plate = String(currentIndex + 1).padStart(2, "0");

  const meta = [
    ["Location", project.location],
    ["Year", project.year],
    ["Category", project.category],
    ["Scope", project.scope],
  ].filter(([, v]) => v);

  return (
    <article data-nav-theme="light" className="bg-bone text-noir">
      {/* ── Title page ───────────────────────────────────────────── */}
      <header className="mx-auto max-w-[1600px] px-6 pb-12 pt-32 md:px-[6vw] md:pb-16 md:pt-40">
        <div className="flex items-center justify-between archive-label text-noir/45">
          <Link href="/#work" className="hover:text-clay">
            ← Archive
          </Link>
          <span>Plate {plate}</span>
        </div>
        <h1 className="mt-10 max-w-[14ch] font-display text-[clamp(2.6rem,9vw,8rem)] font-light leading-[0.95] tracking-[-0.02em]">
          {project.name}
        </h1>
        <p className="mt-6 archive-label text-noir/45">
          {project.category} — {project.location} / {project.year}
        </p>
      </header>

      <ZoomableImage
        src={project.hero}
        alt={project.name}
        priority
        sizes="100vw"
        wrapperClassName="bleed-x aspect-[16/10] md:aspect-[16/8]"
      />

      <div className="mx-auto max-w-[1600px] px-6 md:px-[6vw]">
        <RevealOnScroll
          as="dl"
          className="grid grid-cols-2 gap-x-8 gap-y-8 border-b border-noir/12 py-12 sm:grid-cols-4 md:py-16"
        >
          {meta.map(([label, value]) => (
            <div key={label}>
              <dt className="archive-label text-noir/40">{label}</dt>
              <dd className="mt-2 font-display text-lg font-light">{value}</dd>
            </div>
          ))}
        </RevealOnScroll>

        {project.concept && (
          <RevealOnScroll className="grid gap-6 py-14 md:grid-cols-12 md:py-20">
            <p className="archive-label text-noir/45 md:col-span-3">
              The brief
            </p>
            <p className="max-w-2xl whitespace-pre-line text-[clamp(1.1rem,2vw,1.5rem)] font-light leading-relaxed text-noir/75 md:col-span-8">
              {project.concept}
            </p>
          </RevealOnScroll>
        )}

        {project.before &&
          project.after &&
          project.before !== project.after && (
            <RevealOnScroll className="pb-16 md:pb-24">
              <p className="archive-label mb-5 text-noir/45">
                Before / After
              </p>
              <BeforeAfterSlider
                before={project.before}
                after={project.after}
                beforeAlt={`${project.name} before renovation`}
                afterAlt={`${project.name} after renovation`}
              />
            </RevealOnScroll>
          )}

        <ProjectGallery images={project.gallery} projectName={project.name} />
      </div>

      {next.slug !== project.slug && (
        <Link
          href={`/work/${next.slug}`}

          data-nav-theme="dark"
          className="group relative flex min-h-[44vh] items-end overflow-hidden bg-noir px-6 py-12 text-parchment md:px-[6vw]"
        >
          <Image
            src={next.hero}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-40 transition-transform duration-[1400ms] ease-archive group-hover:scale-105"
          />
          <div className="relative z-10">
            <p className="archive-label mb-4 text-parchment/60">Next plate</p>
            <h2 className="font-display text-[clamp(2rem,6vw,5rem)] font-light italic leading-none">
              {next.name}
            </h2>
          </div>
        </Link>
      )}
    </article>
  );
}
