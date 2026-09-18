"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Activity,
  Wrench,
  Sun,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/monitoring", label: "Monitoring", icon: Activity },
  { href: "/tickets", label: "Maintenance", icon: Wrench },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-900 text-slate-200 md:flex">
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400">
          <Sun className="h-6 w-6 text-slate-900" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">SOLS Energy</p>
          <p className="text-xs text-slate-400">Solar Management</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-yellow-400 text-slate-900"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-3 rounded-xl bg-slate-800 p-4 text-xs leading-relaxed text-slate-300">
        <p className="font-semibold text-white">Intern build · v1.0</p>
        <p className="mt-1">
          Next.js + React + TS + Tailwind. REST APIs backed by JSON now,
          PostgreSQL / Firebase ready.
        </p>
      </div>
      {/* Mobile bottom nav is rendered separately in Topbar */}
    </aside>
  );
}
