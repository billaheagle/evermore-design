import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/layout/Preloader";
import { getSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }) {
  const settings = await getSettings();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[999] focus:bg-copper focus:text-parchment focus:px-4 focus:py-2 focus:rounded-full"
      >
        Skip to content
      </a>
      <Preloader />
      <Nav settings={settings} />
      <div className="grain">
        <main id="main-content">{children}</main>
        <Footer settings={settings} />
      </div>
    </>
  );
}
