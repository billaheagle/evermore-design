# Admin panel & database

The portfolio ("Work") is now stored in **PostgreSQL** and edited through a
password-protected admin panel at **`/admin`**. The public pages read from the
same database.

## 1. Configure `.env`

`.env` was created for you (gitignored). Fill in the database URL and change the
login:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public
ADMIN_USERNAME=admin
ADMIN_PASSWORD=evermore-admin-2026        # change this
AUTH_SECRET=<already generated>
```

- **`DATABASE_URL`** – any PostgreSQL instance (Neon, Supabase, RDS, a local
  server, …).
- **`ADMIN_USERNAME` / `ADMIN_PASSWORD`** – the *only* credentials that can sign
  in. There is no user table and no signup. Change the password.
- **`AUTH_SECRET`** – signs the session cookie. Regenerate any time with
  `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
  (invalidates existing logins).

## 2. Create the tables and seed the existing portfolio

```bash
npm run db:push      # creates the Project / GalleryImage tables
npm run db:seed      # imports the 7 existing projects from prisma/seed-data.mjs
```

`db:seed` is safe to re-run (it upserts by slug).

Optional: `npm run db:studio` opens Prisma Studio to inspect the data.

## 3. Use it

```bash
npm run dev
```

- Sign in at `http://localhost:3000/admin/login`
- Tabs: **Projects** (+ Categories), **Services**, **Process**, **In their
  words**, **Inbox**, **Settings**. Almost every word on the public site is
  editable — only the section headings/numbers and the hero material ribbon
  are still in code.
- `/admin` – project list, with a per-row **status dropdown**, **Edit** /
  **Delete** / **View**, and **+ New project**. The list is **paginated**
  (6 per page, `PER_PAGE` in `app/admin/(dashboard)/page.js`) and has
  **status filter tabs** (All / Published / Draft / Hidden) with counts.
- The form covers: **status**, name, slug (auto from name, editable),
  **category** (a dropdown from the managed list), location, year, scope, sort
  order, concept, **hero image**, **before / after images**, and a **gallery**
  (multi-upload, reorder, mark images "wide", remove).
- Click any image thumbnail in the form — or any gallery photo / the hero on a
  public `/work/<slug>` page — to open it full-screen (arrow keys / Esc).

## Publication status

Every project has a status, changeable from the list (a dropdown per row) or in
the edit form:

| Status | On the public site? | Use |
|---|---|---|
| **Published** | Yes | Live. The default for new and imported projects. |
| **Draft** | No | Work in progress — never shown publicly, including its `/work/<slug>` page (404). |
| **Hidden** | No | Was published, temporarily pulled. Same public effect as Draft. |

Only `PUBLISHED` projects are returned by `lib/projects.js`, so the home page,
project pages, the before/after section and the category filter all respect it
automatically. The admin list "View" link only appears for published projects.

## Services & Process

**`/admin/services`** and **`/admin/process`** are simple list editors (add /
edit / delete, Draft / Published / Hidden status, ↑ / ↓ to reorder). Process
stage numbers are derived from order, not typed. If every item is hidden the
whole section disappears from the site.

## Site settings

**`/admin/settings`** holds the editable copy for almost the whole site:

- **Hero** — eyebrow, kicker, headline (one line per row), link label, and the
  **material ribbon** (4 image + material + note rows; blank image = hidden).
- **Section headings** — the eyebrow + heading above Before/After, Work,
  Services, Process and "In their words" (the 01–07 numbers stay fixed).
- **About** — eyebrow, heading, paragraph, image, caption, up to 4 facts.
- **CTA + contact/footer** — headings, and every contact detail (email, phone,
  WhatsApp number + prefilled message, Instagram, address, footer blurb).

Wrap words in `*asterisks*` to render them in the italic accent colour. Blank
fields fall back to `lib/siteDefaults.js`.

## Inbox

**`/admin/inbox`** collects submissions from the site's contact form (in the
"Get in touch" section). Mark done / delete per message; the nav tab shows a
count of unread ones. The form has a honeypot + per-IP rate limit + a
minimum-fill-time check against bots. Set `RESEND_API_KEY` + `INQUIRY_NOTIFY_TO`
in `.env` to also get an email per enquiry — otherwise just read them here.

## In their words (testimonials)

**`/admin/testimonials`** is full CRUD for the quotes in the site's "In their
words" section: add, edit, delete, reorder (sort order), and the same
**Draft / Published / Hidden** status as projects. Only `PUBLISHED` quotes
appear on the site; if every quote is hidden the whole section disappears.
`npm run db:seed` seeds the table (once) from `data/testimonials.js`.

## Categories

**`/admin/categories`** manages the list of options shown in the project
form's category dropdown.

- `Project.category` stays a plain string. The `Category` table is just the
  managed option list.
- **Renaming** a category cascades: every project using the old name is
  updated to the new one (one transaction).
- **Deleting** a category leaves existing projects' labels untouched — the
  name simply stops appearing in the dropdown. Each row shows how many
  projects currently use it.
- `npm run db:seed` seeds the table from four defaults plus any category
  string already in use.

## Image uploads

Uploaded files are saved to **`public/uploads/`** and referenced by path
(`/uploads/xxxxx.jpg`). That folder is gitignored except for `.gitkeep`.

- Max 10 MB per file; JPEG / PNG / WebP / AVIF / GIF.
- Deleting a project removes its database rows but **not** the image files on
  disk (clean `public/uploads/` manually if needed).
- **Deployment note:** local-folder uploads work on a VPS / self-hosted Node
  server. They do **not** persist on platforms with an ephemeral/read-only
  filesystem (Vercel, etc.) — moving to S3 / Supabase Storage / Cloudinary means
  swapping the body of `app/api/admin/upload/route.js` and nothing else.

## How it fits together

| File | Role |
|---|---|
| `prisma/schema.prisma` | `Project` (+ `ProjectStatus`), `Category`, `Testimonial`, `Service`, `ProcessStep`, `SiteSettings`, `Inquiry`, `GalleryImage` |
| `lib/categories.js` | read queries for the managed category list |
| `lib/testimonials.js` | read queries for the "In their words" quotes |
| `lib/content.js` | read queries for services, process, settings, inbox |
| `lib/siteDefaults.js` | default site copy (seed + blank-field fallback) |
| `lib/uploads.js` | removes orphaned files from `public/uploads/` on delete |
| `prisma/seed.mjs`, `prisma/seed-data.mjs` | one-time import of the original portfolio |
| `lib/prisma.js` | Prisma client singleton |
| `lib/projects.js` | read queries used by the public pages |
| `lib/auth.js` | credential check + signed session cookie (`jose`) |
| `proxy.js` | guards `/admin/**` and `/api/admin/**` |
| `app/admin/**` | login page + dashboard (route group `(dashboard)`) |
| `app/admin/actions.js` | server actions: login, logout, project/testimonial save/delete/set-status, category create/rename/delete |
| `components/ui/Lightbox.js` | shared full-screen image viewer (admin form + public project pages) |
| `app/api/admin/upload/route.js` | image upload handler |
| `app/(site)/**` | the public site (moved under a route group so `/admin` doesn't get the public nav/footer) |

The public home page and project pages are `dynamic = "force-dynamic"` so edits
appear immediately; server actions also call `revalidatePath` after every write.
