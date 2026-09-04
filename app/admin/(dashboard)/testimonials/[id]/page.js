import { notFound } from "next/navigation";
import { getTestimonial } from "@/lib/testimonials";
import TestimonialForm from "@/app/admin/_components/TestimonialForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit quote" };

export default async function EditTestimonialPage({ params }) {
  const { id } = await params;
  const testimonial = await getTestimonial(id);
  if (!testimonial) notFound();

  return <TestimonialForm initial={testimonial} />;
}
