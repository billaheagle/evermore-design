export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-paper text-ink font-sans">{children}</div>
  );
}
