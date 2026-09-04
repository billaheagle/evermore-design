import { notFound } from "next/navigation";
import { getStep } from "@/lib/content";
import SimpleContentForm from "@/app/admin/_components/SimpleContentForm";
import { saveStepAction } from "@/app/admin/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit stage" };

export default async function EditStagePage({ params }) {
  const { id } = await params;
  const step = await getStep(id);
  if (!step) notFound();

  return (
    <SimpleContentForm
      initial={step}
      action={saveStepAction}
      backHref="/admin/process"
      noun="stage"
    />
  );
}
