import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

export const metadata: Metadata = {
  title: "Peptide Tracker",
  description: "A comprehensive peptide tracking and management system",
  keywords: "peptide, tracking, management, research, science",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}