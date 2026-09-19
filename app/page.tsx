"use client";

import useSWR from "@/lib/useSWR";
import type { DashboardMetrics, SolarProject, Ticket } from "@/lib/types";
import { KpiCard, SectionTitle } from "@/components/Cards";
import { GenerationChart, StatusDonut } from "@/components/Charts";
import { apiClient, statusColor, formatRm } from "@/lib/api-client";
import Link from "next/link";
import { Zap, Sun, Leaf, Wallet, Wrench, FolderKanban } from "lucide-react";

export default function DashboardPage() {
  const { data: metrics } = useSWR<DashboardMetrics>("/api/metrics", () =>
    apiClient.metrics.get()
  );
  const { data: projects } = useSWR<SolarProject[]>("/api/projects", () =>
    apiClient.projects.list()
  );
  const { data: tickets } = useSWR<Ticket[]>("/api/tickets", () =>
    apiClient.tickets.list()
  );

  if (!metrics || !projects || !tickets) {
    return (
      <div className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card h-32" />
        ))}
      </div>
    );
  }

  const recent = [...projects]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 5);
  const openTickets = tickets.filter(
    (t) => t.status === "Open" || t.status === "In Progress"
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Fleet capacity"
          value={`${metrics.totalCapacityKwp} kWp`}
          sub={`${metrics.totalProjects} sites · ${metrics.activeProjects} active`}
          icon={<Sun className="h-4 w-4" />}
        />
        <KpiCard
          label="Energy this month"
          value={`${metrics.energyThisMonthKwh.toLocaleString()} kWh`}
          sub="Across all monitored systems"
          icon={<Zap className="h-4 w-4" />}
        />
        <KpiCard
          label="Customer savings"
          value={formatRm(metrics.savingsThisMonthRm)}
          sub="Estimated bill savings / month"
          icon={<Wallet className="h-4 w-4" />}
        />
        <KpiCard
          label="CO₂ avoided"
          value={`${metrics.co2AvoidedTons} t`}
          sub={`Fleet health ${metrics.fleetHealthPct}% · ${metrics.openTickets} open tickets`}
          icon={<Leaf className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <SectionTitle
            title="Generation trend"
            sub="Actual vs expected output (kWh, last 12 months)"
          />
          <GenerationChart data={metrics.generationTrend} />
        </div>
        <div className="card p-5">
          <SectionTitle title="Pipeline by status" sub="Where every project sits" />
          <StatusDonut data={metrics.statusBreakdown} />
          <div className="mt-2 grid grid-cols-2 gap-2">
            {metrics.statusBreakdown.map((s) => (
              <div
                key={s.status}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs"
              >
                <span className="font-medium text-slate-600">{s.status}</span>
                <span className="font-bold text-slate-900">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <SectionTitle
              title="Recently updated projects"
              sub="Latest field + office activity"
            />
            <Link href="/projects" className="btn-primary text-xs">
              <FolderKanban className="h-3.5 w-3.5" /> View all
            </Link>
          </div>
          <table className="table w-full">
            <thead className="bg-slate-50">
              <tr>
                <th>Project</th>
                <th>Status</th>
                <th className="text-right">kWp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td>
                    <p className="font-semibold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.address}</p>
                  </td>
                  <td>
                    <span className={`badge ${statusColor(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="text-right font-semibold">{p.capacityKwp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-3">
            <SectionTitle
              title="Open maintenance"
              sub={`${openTickets.length} tickets need attention`}
            />
            <Link href="/tickets" className="btn-primary text-xs">
              <Wrench className="h-3.5 w-3.5" /> Triage
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {openTickets.slice(0, 5).map((t) => (
              <li
                key={t.id}
                className="flex items-start justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                  <p className="text-xs text-slate-500">
                    {t.assignee} · {t.status}
                  </p>
                </div>
                <span className={`badge ${statusColor(t.priority)}`}>
                  {t.priority}
                </span>
              </li>
            ))}
            {openTickets.length === 0 && (
              <li className="px-5 py-6 text-sm text-slate-500">
                Inbox zero. Nice work.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
