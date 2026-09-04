import Hero from "@/components/sections/Hero";
import Patina from "@/components/sections/Patina";
import Work from "@/components/sections/Work";
import Services from "@/components/sections/Services";
import Process from "@/components/sections/Process";
import Testimonials from "@/components/sections/Testimonials";
import About from "@/components/sections/About";
import CTA from "@/components/sections/CTA";
import { getProjects, getCategories, getPatinaProjects } from "@/lib/projects";
import { getPublishedTestimonials } from "@/lib/testimonials";
import {
  getPublishedServices,
  getPublishedSteps,
  getSettings,
} from "@/lib/content";

// Content is admin-editable, so render on each request rather than pinning
// a build-time snapshot.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [
    projects,
    categories,
    patinaProjects,
    testimonials,
    services,
    steps,
    settings,
  ] = await Promise.all([
    getProjects(),
    getCategories(),
    getPatinaProjects(),
    getPublishedTestimonials(),
    getPublishedServices(),
    getPublishedSteps(),
    getSettings(),
  ]);

  return (
    <>
      <Hero settings={settings} />
      <Patina projects={patinaProjects} settings={settings} />
      <Work projects={projects} categories={categories} settings={settings} />
      <Services services={services} settings={settings} />
      <Process steps={steps} settings={settings} />
      <Testimonials items={testimonials} settings={settings} />
      <About settings={settings} />
      <CTA settings={settings} />
    </>
  );
}
