import Image from "next/image";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import { accentText } from "@/lib/accentText";

export default function About({ settings = {} }) {
  const facts = Array.isArray(settings.aboutFacts)
    ? settings.aboutFacts.filter((f) => f?.label || f?.value)
    : [];

  return (
    <section
      id="about"
      data-nav-theme="light"
      className="relative z-[60] overflow-hidden bg-bone py-24 md:py-32"
    >
      <div className="mx-auto max-w-[1600px] px-6 md:px-[6vw]">
        <RevealOnScroll className="grid gap-6 md:grid-cols-12">
          <span className="font-display text-[clamp(3rem,9vw,7rem)] font-light leading-none text-noir/12 md:col-span-2">
            06
          </span>
          <div className="md:col-span-9 md:col-start-4">
            <p className="archive-label mb-6 text-noir/45">
              {settings.aboutEyebrow}
            </p>
            <h2 className="max-w-[14ch] font-display text-[clamp(2.4rem,7vw,6rem)] font-light leading-[0.98] text-noir">
              {accentText(settings.aboutHeading)}
            </h2>
          </div>
        </RevealOnScroll>

        <div className="mt-16 grid gap-12 md:mt-24 md:grid-cols-12 md:gap-16">
          {settings.aboutImage && (
            <RevealOnScroll className="md:col-span-4 md:col-start-2">
              <figure>
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-noir/5">
                  <Image
                    src={settings.aboutImage}
                    alt="A recent Evermore Design project"
                    fill
                    sizes="(max-width: 768px) 100vw, 32vw"
                    className="object-cover grayscale-[0.15]"
                  />
                </div>
                {settings.aboutImageCaption && (
                  <figcaption className="archive-label mt-3 text-noir/40">
                    {settings.aboutImageCaption}
                  </figcaption>
                )}
              </figure>
            </RevealOnScroll>
          )}

          <RevealOnScroll delay={0.08} className="md:col-span-6">
            <p className="max-w-md whitespace-pre-line text-[clamp(1rem,1.6vw,1.15rem)] font-light leading-relaxed text-noir/70">
              {settings.aboutBody}
            </p>

            {facts.length > 0 && (
              <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-noir/12 pt-8">
                {facts.map((f, i) => (
                  <div key={i}>
                    <dt className="archive-label text-noir/40">{f.label}</dt>
                    <dd className="mt-2 font-display text-lg font-light text-noir">
                      {f.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
