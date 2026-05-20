import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const CHANNEL = process.env.NEXT_PUBLIC_CHANNEL ?? "quin69";

export const metadata: Metadata = {
  title: {
    default: `${CHANNEL} VODs`,
    template: `%s | ${CHANNEL} VODs`,
  },
  description: `Watch ${CHANNEL} VOD archive with full chat replay, chapter navigation, and more.`,
  openGraph: {
    type: "website",
    siteName: `${CHANNEL} VODs`,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
        style={{ backgroundColor: "var(--color-bg-base)" }}
      >
        {children}
      </body>
    </html>
  );
}
