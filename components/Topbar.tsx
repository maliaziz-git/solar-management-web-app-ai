"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun } from "lucide-react";
import useSWR from "@/lib/useSWR";
import { apiClient, type HealthResponse } from "@/lib/api-client";

export function Topbar() {
  const pathname = usePathname();
  const { data: health } = useSWR<HealthResponse>("/api/health", () =>
    apiClient.health.get()
  );

  const TITLES: Record<string, string> = {
    "/": "Dashboard",
    "/projects": "Projects",
    "/customers": "Customers",
    "/monitoring": "Monitoring",
    "/tickets": "Maintenance",
  };
  const slug = pathname.split("/")[1] ?? "";
  const title =
    TITLES[pathname] ??
    (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : "Dashboard");

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 md:hidden">
            <Sun className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 sm:text-lg">
              {title}
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              Kuala Lumpur · Fleet overview · Updated just now
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {health?.ok ? (
            <div className="flex items-center gap-1.5">
              <span className="badge bg-emerald-100 text-emerald-700">
                ● REST API Connected
              </span>
              <span className="badge hidden bg-slate-100 text-slate-700 sm:inline-flex">
                {health.backend === "firebase" ? "🔥 Firebase" : "📁 Local Store"}
              </span>
            </div>
          ) : (
            <span className="badge bg-amber-100 text-amber-700">
              ● Connecting to API...
            </span>
          )}
          <Link href="/projects" className="btn-accent hidden sm:inline-flex">
            + New project
          </Link>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
        {[
          ["Dashboard", "/"],
          ["Projects", "/projects"],
          ["Customers", "/customers"],
          ["Monitoring", "/monitoring"],
          ["Maintenance", "/tickets"],
        ].map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold ${
              pathname === href
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
