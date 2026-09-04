import SimpleContentForm from "@/app/admin/_components/SimpleContentForm";
import { saveServiceAction } from "@/app/admin/actions";

export const metadata = { title: "New service" };

export default function NewServicePage() {
  return (
    <SimpleContentForm
      initial={null}
      action={saveServiceAction}
      backHref="/admin/services"
      noun="service"
    />
  );
}
