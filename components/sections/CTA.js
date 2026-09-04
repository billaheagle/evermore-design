import Link from "next/link";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import ContactForm from "@/components/ui/ContactForm";
import { accentText } from "@/lib/accentText";

export default function CTA({ settings = {} }) {
  const wa = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, "")}` +
      (settings.whatsappMessage
        ? `?text=${encodeURIComponent(settings.whatsappMessage)}`
        : "")
    : null;

  return (
    <section
      id="cta"
      data-nav-theme="dark"
      className="relative z-[70] bg-noir pb-20 pt-24 text-parchment md:pb-28 md:pt-36"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-[6vw]">
        <RevealOnScroll>
          <p className="archive-label mb-8 text-parchment/45">
            07 — {settings.ctaEyebrow || "Get in touch"}
          </p>
          <h2 className="max-w-[13ch] font-display text-[clamp(2.6rem,9vw,8rem)] font-light leading-[0.95]">
            {accentText(settings.ctaHeading)}
          </h2>
        </RevealOnScroll>

        <RevealOnScroll
          delay={0.08}
          className="mt-14 grid gap-x-16 gap-y-12 border-t border-parchment/15 pt-10 md:grid-cols-12"
        >
          <div className="md:col-span-5">
            <p className="max-w-sm text-[15px] font-light leading-relaxed text-parchment/60">
              {settings.ctaBody}
            </p>

            <div className="mt-8 flex flex-col gap-3">
              {wa && (
                <Link
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 font-display text-xl italic"
                >
                  <span className="border-b border-parchment/40 pb-0.5 transition-colors group-hover:border-clay group-hover:text-clay">
                    {settings.ctaLinkLabel || "Message the studio"}
                  </span>
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              )}
              {settings.email && (
                <a
                  href={`mailto:${settings.email}`}
                  className="archive-label text-parchment/50 underline-offset-4 hover:text-parchment hover:underline"
                >
                  {settings.email}
                </a>
              )}
            </div>
          </div>

          <div className="md:col-span-7">
            <ContactForm />
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
