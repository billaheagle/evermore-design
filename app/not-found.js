import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="grain flex min-h-[100svh] flex-col items-center justify-center bg-bone px-6 text-center text-noir">
      <p className="archive-label text-noir/40">Error 404</p>
      <h1 className="mt-6 font-display text-[clamp(2.5rem,10vw,7rem)] font-light leading-[0.95]">
        This page has{" "}
        <span className="italic text-clay">moved on</span>.
      </h1>
      <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-noir/55">
        The address you followed doesn&apos;t point anywhere any more — a project
        may have been renamed, or the link was mistyped.
      </p>
      <Link
        href="/"
        className="group mt-10 inline-flex items-center gap-3 font-display text-lg italic text-noir"
      >
        <span className="border-b border-noir/40 pb-1 transition-colors group-hover:border-clay group-hover:text-clay">
          Back to the studio
        </span>
        <span
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-1.5"
        >
          →
        </span>
      </Link>
    </main>
  );
}
