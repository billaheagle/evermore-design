import { getSettings } from "@/lib/content";
import SettingsForm from "@/app/admin/_components/SettingsForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Site settings" };

export default async function SettingsPage() {
  const settings = await getSettings();
  return <SettingsForm initial={settings} />;
}
