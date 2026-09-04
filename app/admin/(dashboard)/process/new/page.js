import SimpleContentForm from "@/app/admin/_components/SimpleContentForm";
import { saveStepAction } from "@/app/admin/actions";

export const metadata = { title: "New stage" };

export default function NewStagePage() {
  return (
    <SimpleContentForm
      initial={null}
      action={saveStepAction}
      backHref="/admin/process"
      noun="stage"
    />
  );
}
