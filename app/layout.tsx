import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";

export const metadata: Metadata = {
  title: "SOLS Energy — Solar Management",
  description:
    "Manage solar projects, customers, monitoring and maintenance. Built with Next.js, React, TypeScript, Tailwind.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar />
            <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
            <footer className="border-t border-slate-200 bg-white px-6 py-4 text-xs text-slate-500">
              SOLS Energy · Solar Management Web App · Next.js + TypeScript +
              Tailwind · REST APIs · PostgreSQL / Firebase ready
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
