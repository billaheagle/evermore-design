"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "@/components/ui/Lightbox";
import { cn } from "@/lib/cn";

// A single image that opens full-screen when clicked. Used for the project
// hero. Pass-through props mirror next/image where it matters.
export default function ZoomableImage({
  src,
  alt = "",
  priority = false,
  sizes = "100vw",
  className,
  wrapperClassName,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}

        aria-label="View full size"
        className={cn("group relative block w-full overflow-hidden", wrapperClassName)}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn(
            "object-cover transition-transform duration-[1400ms] ease-archive group-hover:scale-[1.02]",
            className
          )}
        />
      </button>

      {open && (
        <Lightbox images={[{ src, alt }]} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
