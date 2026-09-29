import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brewery Search",
  description: "BFF-powered brewery search built with Next.js and Django",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
