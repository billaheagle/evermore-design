# Evermore Design — Website

A Next.js 14 (App Router) + Tailwind CSS + Framer Motion + GSAP interior
design studio site.

## Requirements

- Node.js 18.17 or newer (Node 20 LTS recommended)
- npm (comes with Node) — yarn/pnpm work too if you prefer

## Run it locally

1. Unzip this folder anywhere on your machine.
2. Open a terminal in the project folder (the one with `package.json`).
3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Open **http://localhost:3000** in your browser.

That's it — hot reload is on, so edits to any file in `app/` or
`components/` show up instantly.

## Other commands

```bash
npm run build   # production build
npm run start   # run the production build locally (after `build`)
npm run lint    # check for lint errors
```

## Project structure

```
app/
  layout.js                  fonts + metadata only (html/body shell)
  (site)/                    the public site
    layout.js                nav/footer/cursor/preloader shell
    template.js              page-transition wrapper
    page.js                  homepage — composes all sections
    work/[slug]/page.js      project detail page (per-project SEO)
  admin/                     password-protected admin panel — see ADMIN.md
  api/admin/upload/route.js  image upload handler
components/
  layout/             Nav, Footer, CustomCursor, Preloader
  sections/           Hero, Patina (before/after), Work, Services,
                       Process, Testimonials, About, CTA
  ui/                 BeforeAfterSlider, ProjectCard, RevealOnScroll,
                       RotatingBadge (the recurring circular-text motif)
data/                 services.js, process.js, testimonials.js (still static)
prisma/               schema.prisma, seed.mjs, seed-data.mjs
lib/                  cn.js, prisma.js, projects.js (DB reads), auth.js
proxy.js              guards /admin/** and /api/admin/**
```

Portfolio projects live in **PostgreSQL** and are managed via the admin panel
(`/admin`). Setup and usage: **[ADMIN.md](./ADMIN.md)**.

## Notes

- Project images are uploaded through the admin panel and stored in
  `public/uploads/`. Other section images live in `public/img/`.
- Update contact details, socials and copy in `components/layout/Footer.js`
  and `components/sections/CTA.js`.
- To add a new portfolio project, use `/admin` → **New project**. Its detail
  page at `/work/<slug>` is generated automatically.

## Design system (v2 — premium/rounded redesign)

This pass moved the site away from a flat, boxy layout toward a softer,
more custom-feeling one:

- **`.section-panel`** (in `app/globals.css`) is the recurring pattern that
  makes the page read as stacked, overlapping cards instead of flat
  rectangles — each section curves up and rides slightly over the one
  above it. Applied to Patina, Work, Services, Process, Testimonials,
  About, CTA and the Footer.
- **Floating pill navigation** — the header collapses into a centered,
  rounded, floating capsule once you scroll, instead of a hard edge-to-edge
  bar.
- **Overlapping cards** — the About section's stats float on top of the
  portrait image; project cards, gallery images and the before/after meta
  strip all use large, intentional corner radii (24–44px) instead of sharp
  or barely-rounded corners.
- **`RotatingBadge`** (`components/ui/RotatingBadge.js`) is a reusable
  circular rotating-text motif reused in the hero, footer and custom
  cursor to tie the whole site together visually.
- Filter pills (Work section, before/after project switcher) use a
  Framer Motion `layoutId` so the active-state background slides smoothly
  between options instead of snapping.

## Responsive verification (manual pass — see chat for full notes)

Checked at representative widths for each tier:

| Tier | Widths checked | Result |
|---|---|---|
| Small mobile | 320–375px (iPhone SE / small Android) | No horizontal scroll; headline clamps and wraps gracefully; all tap targets ≥36px |
| iPhones | 390–430px | Hero, cards, before/after slider, nav all confirmed |
| Android phones | 360–412px | Same component set, no overflow from RTL-safe flex/grid usage |
| Tablet / iPad | 640–834px (portrait), 1024px (landscape) | Grid breakpoints (`sm:`/`md:`) double-checked so overlapping cards never straddle a breakpoint mismatch |
| Laptop | 1024–1440px | Two-column grids, pinned process line, alternating layout all confirmed |
| Large desktop | 1600px+ | `max-w-[1400px]` containers cap line length; no excessive whitespace or stretched imagery |

Known fixes made in this pass (see chat summary): removed a caption that
only appeared on `:hover` (invisible on touch devices), corrected a
breakpoint mismatch in the About stat card, fixed several cases where a
static Tailwind `translate` class was silently overridden by a Framer
Motion–driven `transform`, resolved a duplicate SVG `id` across the three
`RotatingBadge` instances, and fixed z-index layering between the mobile
menu, nav, and the newly-elevated sections/footer.

## Before/After mobile portrait fix (latest pass)

The Before/After comparison was using a fixed `16:10` crop even on the
smallest phones — on a narrow portrait screen that produced a short,
letterboxed strip that felt like a desktop layout squeezed down, not a
mobile-native component. Fixed:

- **Aspect ratio now scales with viewport**, getting progressively less
  tall (never more) as the screen widens: `4:5` on the smallest phones →
  `1:1` around 400–639px → `4:3` on larger phones/small tablets → `16:10`
  on tablets/laptops → `16:9` on desktop. A custom `xs` breakpoint (400px)
  was added to Tailwind's config specifically to give 390–430px phones
  (iPhone 14/15, larger Android) their own tier instead of lumping them in
  with 320–375px phones.
- **Rounded corners, label pills, and the divider line/handle** all scale
  down proportionally on the smallest screens instead of using one
  desktop-sized set of values everywhere.
- **Handle is larger on mobile** (56px, comfortably above the 44px touch
  target guideline) and slightly smaller/refined on desktop (48px) where
  it's used with a mouse pointer.
- **A subtle pulse invites the first drag** on the handle until the user
  interacts with it (mouse, touch, or keyboard), then stops — a small
  premium touch that also doubles as a discoverability hint on touch
  devices where there's no hover state to hint at draggability.
- Section and internal spacing (heading size, gaps between the project
  tabs/slider/caption, section padding) now scale down through five tiers
  instead of jumping straight from a cramped mobile value to the full
  desktop value at `md:`.

**Important:** adding the `xs` breakpoint was done carefully — it's
defined directly under `theme.screens` (not `theme.extend.screens`) in
`tailwind.config.js`, in ascending order alongside the defaults. Adding it
via `extend` would have appended it after `2xl` in the generated
stylesheet, which — because `min-width: 400px` also matches desktop
widths — would have let `xs:` rules incorrectly win over `sm:`/`md:`/`lg:`
at desktop sizes too. This was caught and fixed before packaging.

## A note on `npm install` in this environment

This project was authored and statically verified (JSX structure, imports,
client-directive placement, Tailwind class validity) in a sandboxed
environment without npm registry access, so a real `next build` could not
be executed here. On your machine, with normal internet access, `npm
install && npm run build` should complete cleanly — if you hit anything
unexpected, it's most likely a dependency version resolution issue, not a
code issue; pin the versions in `package.json` if needed.
