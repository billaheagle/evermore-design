"use client";

import { useState } from "react";
import Image from "next/image";
import RevealOnScroll from "@/components/ui/RevealOnScroll";
import Lightbox from "@/components/ui/Lightbox";
import { cn } from "@/lib/cn";

export default function ProjectGallery({ images, projectName }) {
  const [viewer, setViewer] = useState(null);
  if (!images?.length) return null;

  return (
    <>
      <div className="grid grid-cols-1 gap-6 pb-24 sm:grid-cols-2 md:gap-10">
        {images.map((img, i) => (
          <RevealOnScroll
            key={img.src}
            delay={Math.min(i * 0.05, 0.2)}
            className={cn(
              img.wide ? "sm:col-span-2" : "",
              !img.wide && i % 2 === 1 && "sm:mt-16"
            )}
          >
            <button
              type="button"
              onClick={() => setViewer(i)}

              aria-label={`View image ${i + 1} full size`}
              className={cn(
                "group relative block w-full overflow-hidden bg-noir/5",
                img.wide ? "aspect-[16/9]" : "aspect-[4/5]"
              )}
            >
              <Image
                src={img.src}
                alt={`${projectName} interior detail`}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-[1200ms] ease-archive group-hover:scale-[1.03]"
              />
            </button>
          </RevealOnScroll>
        ))}
      </div>

      {viewer !== null && (
        <Lightbox
          images={images.map((im) => ({
            src: im.src,
            alt: `${projectName} interior detail`,
          }))}
          startIndex={viewer}
          onClose={() => setViewer(null)}
        />
      )}
    </>
  );
}
