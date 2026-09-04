import { Fraunces, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Fraunces carries every display line now — a variable serif with real
// character (its "wonk" and soft axes give the large sizes a set, almost
// letterpress feel rather than a rendered-default one). Used light (300–400)
// at poster scale; italic is reserved for a single accent per section.
const display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://evermore.design"),
  title: {
    default: "Evermore Design — Interiors Built to Outlast the Trend",
    template: "%s — Evermore Design",
  },
  description:
    "Evermore Design is a Jakarta-based interior design studio shaping residential, apartment, commercial and hospitality spaces around materials that improve with age.",
  keywords: [
    "interior design studio Jakarta",
    "premium interior design",
    "residential interior design",
    "Evermore Design",
  ],
  openGraph: {
    title: "Evermore Design — Interiors Built to Outlast the Trend",
    description:
      "A Jakarta-based interior design studio shaping spaces around materials that improve with age.",
    url: "https://evermore.design",
    siteName: "Evermore Design",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
