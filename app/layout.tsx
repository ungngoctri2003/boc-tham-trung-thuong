import type { Metadata } from "next";
import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vòng quay may mắn DSSolution",
  description: "Lì xì đầu năm - Vòng quay may mắn nội bộ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="antialiased min-h-screen tet-bg font-sans" suppressHydrationWarning>
        <header className="flex items-center gap-3 p-4 border-b border-gray-200/50">
          <Image
            src="/logo.png"
            alt="Vòng quay may mắn"
            width={48}
            height={48}
            className="object-contain"
          />
          <span className="font-semibold text-lg">Vòng quay may mắn DSSolution</span>
        </header>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
