import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import AdminNav from "@/app/admin/_components/AdminNav";
import { countNewInquiries } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  const inboxCount = await countNewInquiries().catch(() => 0);
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-6 md:py-12">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-ink/10 pb-5 sm:pb-6">
        <Link
          href="/admin"
          className="font-display italic text-lg text-ink sm:text-xl"
        >
          Evermore <span className="not-italic text-copper">Design</span>
          <span className="ml-2.5 font-mono text-[10px] uppercase tracking-widest2 text-ink/40">
            Admin
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="rounded-full border border-ink/15 px-3.5 py-2 text-xs text-ink/70 hover:border-ink/40"
          >
            View site ↗
          </Link>
          <form action={logoutAction}>
            <button className="rounded-full border border-ink/15 px-3.5 py-2 text-xs text-ink/70 hover:border-ink/40">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <AdminNav inboxCount={inboxCount} />

      <main className="pt-6 sm:pt-8">{children}</main>
    </div>
  );
}
