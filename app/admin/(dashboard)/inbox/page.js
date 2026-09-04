import { listInquiries } from "@/lib/content";
import InquiryRow from "@/app/admin/_components/InquiryRow";

export const dynamic = "force-dynamic";
export const metadata = { title: "Inbox" };

export default async function InboxPage() {
  const items = await listInquiries();
  const unread = items.filter((i) => !i.handled).length;

  return (
    <div>
      <h1 className="font-display text-2xl italic text-ink sm:text-3xl">Inbox</h1>
      <p className="mt-1 text-sm text-ink/50">
        {items.length === 0
          ? "No messages yet."
          : `${items.length} message${items.length === 1 ? "" : "s"}, ${unread} new · from the site's contact form`}
      </p>

      {items.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-dashed border-ink/20 p-10 text-center text-sm text-ink/50">
          Nothing here yet. Messages sent through the contact form on the site
          land here.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((inquiry) => (
            <InquiryRow key={inquiry.id} inquiry={inquiry} />
          ))}
        </ul>
      )}
    </div>
  );
}
