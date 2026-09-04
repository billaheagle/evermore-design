"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

export default function ProjectCard({ project, className, priority = false }) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      layout
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
    >
      <Link
        href={`/work/${project.slug}`}

        className="group block"
        aria-label={`View ${project.name}`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-noir/5">
          <Image
            src={project.hero}
            alt={`${project.name}, ${project.category} project in ${project.location}`}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover grayscale-[0.12] transition-all duration-[1200ms] ease-archive group-hover:scale-[1.03] group-hover:grayscale-0"
          />
        </div>

        {/* Caption sits below the image rather than floating over it — reads
            as a catalogue plate, not a hover card. */}
        <div className="mt-4 flex items-baseline justify-between gap-4">
          <div>
            <h3 className="font-display text-lg italic text-noir transition-colors group-hover:text-clay">
              {project.name}
            </h3>
            <p className="archive-label mt-1.5 text-noir/45">
              {project.location} · {project.category}
            </p>
          </div>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-noir/40">
            {project.year}
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
