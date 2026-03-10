import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Facebook Organic Analyzer",
  description: "Analysera organisk Facebook-data för ditt team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="sv">
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
