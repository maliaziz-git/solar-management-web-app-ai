"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import type { DashboardMetrics } from "@/lib/types";

const PIE_COLORS = ["#facc15", "#38bdf8", "#a78bfa", "#34d399", "#fb923c", "#94a3b8"];

export function GenerationChart({ data }: { data: DashboardMetrics["generationTrend"] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={52} />
          <Tooltip />
          <Area type="monotone" dataKey="kwh" name="Generated (kWh)" stroke="#ca8a04" fill="#fde68a" strokeWidth={2} />
          <Area type="monotone" dataKey="expected" name="Expected (kWh)" stroke="#94a3b8" fill="transparent" strokeDasharray="5 5" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatusDonut({ data }: { data: DashboardMetrics["statusBreakdown"] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="status" innerRadius={55} outerRadius={90} paddingAngle={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HealthBars({ projects }: { projects: { name: string; monthlyKwh: number }[] }) {
  const top = [...projects].sort((a, b) => b.monthlyKwh - a.monthlyKwh).slice(0, 6);
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={top} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="monthlyKwh" name="kWh / month" fill="#0c1b2a" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
