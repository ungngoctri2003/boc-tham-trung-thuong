import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vòng quay may mắn | DSSolution",
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
        {children}
      </body>
    </html>
  );
}
