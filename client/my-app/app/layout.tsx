import type { Metadata } from "next";
import { FiltersProvider } from "@/app/components/FiltersContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Job Application Tracker",
  description: "Track job applications, companies, and interviews.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="jt-body">
        <FiltersProvider>{children}</FiltersProvider>
      </body>
    </html>
  );
}
