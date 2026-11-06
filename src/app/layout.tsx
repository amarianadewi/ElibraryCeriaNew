import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-Library Kaliwungu 05 Ceria",
  description: "Perpustakaan Digital Siswa SD Negeri Kaliwungu 05 - Membaca Menyenangkan, Berprestasi Ceria!",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased selection:bg-orange-200 selection:text-orange-900">
        {children}
      </body>
    </html>
  );
}
