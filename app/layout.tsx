import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mindful Eye - Protect What Matters Most: Your Child's Mind and Future",
  description: "Become the vigilant, connected parent your child needs. Weekly accountability system for educational transparency, safety monitoring, and parent empowerment. Start protecting your family today.",
  keywords: ["parenting", "child safety", "educational transparency", "parent accountability", "family values", "child protection", "parenting app"],
  authors: [{ name: "Mindful Eye" }],
  openGraph: {
    title: "Mindful Eye - Protect Your Child's Mind and Future",
    description: "Become the vigilant, connected parent your child needs with our weekly accountability system.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mindful Eye - Protect Your Child's Mind and Future",
    description: "Weekly accountability system for engaged parents who want to protect their children's education and values.",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
