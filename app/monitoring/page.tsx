"use client";

import { useMemo, useState } from "react";
import useSWR from "@/lib/useSWR";
import type { SolarProject } from "@/lib/types";
import { SectionTitle } from "@/components/Cards";
import { HealthBars } from "@/components/Charts";
import { apiClient, statusColor } from "@/lib/api-client";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Simulated 24h curve (deterministic per project so QA is reproducible).
function dayCurve(seed: number) {
  const hours = Array.from({ length: 24 }, (_, h) => h);
  return hours.map((h) => {
    const sun = h < 7 || h > 19 ? 0 : Math.sin(((h - 7) / 12) * Math.PI);
    const noise = ((seed * (h + 3)) % 7) / 100;
    return {
      hour: `${h}:00`,
      kw: Math.round((sun * (2 + (seed % 5)) + noise) * 100) / 100,
    };
  });
}

export default function MonitoringPage() {
  const { data: projects } = useSWR<SolarProject[]>(
    "/api/projects",
    () => apiClient.projects.list()
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = useMemo(() => {
    if (!projects || projects.length === 0) return null;
    return (
      projects.find((p) => p.id === (selectedId ?? projects[0].id)) ??
      projects[0]
    );
  }, [projects, selectedId]);

  const curve = useMemo(
    () => dayCurve(selected ? selected.capacityKwp * 10 : 5),
    [selected]
  );

  if (!projects || !selected)
    return <div className="card h-64 animate-pulse" />;

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Monitoring"
        sub="Live-style inverter telemetry · per-site output and fleet ranking"
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Select system
          </p>
          <div className="max-h-[380px] space-y-2 overflow-y-auto">
            {projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedId(p.id)}
                className={`w-full rounded-xl border p-3 text-left ${
                  selected.id === p.id
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-slate-900">{p.name}</p>
                  <span className={`badge ${statusColor(p.health)}`}>
                    {p.health}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {p.capacityKwp} kWp · {p.monthlyKwh.toLocaleString()} kWh/mo
                </p>
              </button>
            ))}
          </div>
        </div>
        <div className="card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {selected.name}
              </h3>
              <p className="text-xs text-slate-500">
                {selected.inverter} · {selected.panels} panels · Installed{" "}
                {selected.installDate}
              </p>
            </div>
            <span className={`badge ${statusColor(selected.status)}`}>
              {selected.status}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ["Capacity", `${selected.capacityKwp} kWp`],
              [
                "This month",
                `${selected.monthlyKwh.toLocaleString()} kWh`,
              ],
              ["CO₂ avoided", `${selected.co2Tons} t`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{k}</p>
                <p className="text-base font-bold">{v}</p>
              </div>
            ))}
          </div>
          <p className="mb-1 mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Today&apos;s power curve (kW)
          </p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} interval={2} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="kw"
                  stroke="#ca8a04"
                  fill="#fde68a"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card p-5">
        <SectionTitle
          title="Fleet ranking"
          sub="Top systems by monthly output"
        />
        <HealthBars projects={projects} />
      </div>
    </div>
  );
}
