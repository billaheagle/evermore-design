import { notFound } from "next/navigation";
import { getService } from "@/lib/content";
import SimpleContentForm from "@/app/admin/_components/SimpleContentForm";
import { saveServiceAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit service" };

export default async function EditServicePage({ params }) {
  const { id } = await params;
  const service = await getService(id);
  if (!service) notFound();

  return (
    <SimpleContentForm
      initial={service}
      action={saveServiceAction}
      backHref="/admin/services"
      noun="service"
    />
  );
}
