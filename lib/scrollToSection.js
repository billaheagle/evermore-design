"use client";

// Clearance below the fixed nav when landing on a section.
const NAV_OFFSET = 88;

/**
 * rAF-driven smooth scroll to an absolute Y. We animate it ourselves rather
 * than relying on `window.scrollTo({ behavior: "smooth" })` or CSS
 * `scroll-behavior: smooth`, both of which are inconsistent under Next 16
 * (sometimes silently a no-op).
 */
export function smoothScrollTo(targetY, duration = 620) {
  targetY = Math.max(0, targetY);
  const startY = window.scrollY;
  const delta = targetY - startY;
  if (Math.abs(delta) < 2) return;

  const start = performance.now();
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  let done = false;

  function frame(now) {
    if (done) return;
    const p = Math.min(1, (now - start) / duration);
    window.scrollTo(0, Math.round(startY + delta * easeOutCubic(p)));
    if (p < 1) requestAnimationFrame(frame);
    else done = true;
  }
  requestAnimationFrame(frame);

  // Safety net: if rAF is throttled (background/inactive tab) the loop never
  // advances — land instantly once the animation window has passed.
  setTimeout(() => {
    if (!done) {
      done = true;
      window.scrollTo(0, targetY);
    }
  }, duration + 100);
}

/** Smooth-scroll a section into view under the fixed nav. */
export function scrollToId(id) {
  const el = typeof document !== "undefined" && document.getElementById(id);
  if (!el) return false;
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
  smoothScrollTo(top);
  window.history.replaceState(null, "", `#${id}`);
  return true;
}

/**
 * Click handler for same-page anchor links ("/#work", "#work").
 *
 * Next 16's `<Link>` hash handling on the *current* route is unreliable —
 * clicks would land on the section before the target, or not scroll at all.
 * We take over. Cross-page links (element not on this page) fall through
 * untouched so Next handles the real navigation.
 */
export function handleSectionNav(event, href) {
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return;
  const id = href.slice(hashIndex + 1);
  if (scrollToId(id)) event.preventDefault();
}
