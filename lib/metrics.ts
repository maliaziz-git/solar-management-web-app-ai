import type { DashboardMetrics, SolarProject, Ticket } from "./types";

export function buildMetrics(
  projects: SolarProject[],
  tickets: Ticket[]
): DashboardMetrics {
  const totalCapacityKwp = projects.reduce((s, p) => s + p.capacityKwp, 0);
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const energyThisMonthKwh = projects.reduce((s, p) => s + p.monthlyKwh, 0);
  const savingsThisMonthRm = projects.reduce((s, p) => s + p.savingsRm, 0);
  const co2AvoidedTons = projects.reduce((s, p) => s + p.co2Tons, 0);
  const healthy = projects.filter(
    (p) => p.health === "Excellent" || p.health === "Good"
  ).length;
  const fleetHealthPct =
    projects.length === 0 ? 100 : Math.round((healthy / projects.length) * 100);
  const openTickets = tickets.filter(
    (t) => t.status === "Open" || t.status === "In Progress"
  ).length;

  const statuses = [
    "Survey",
    "Proposal",
    "Installation",
    "Inspection",
    "Active",
    "Maintenance",
  ] as const;
  const statusBreakdown = statuses.map((status) => ({
    status,
    count: projects.filter((p) => p.status === status).length,
  }));

  // Deterministic 12-month trend derived from current fleet output.
  const months = [
    "Oct", "Nov", "Dec", "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul", "Aug", "Sep",
  ];
  const base = Math.max(energyThisMonthKwh, 1200);
  const factors = [0.82, 0.78, 0.75, 0.8, 0.86, 0.95, 1.0, 1.04, 1.0, 0.97, 0.92, 1.0];
  const generationTrend = months.map((month, i) => ({
    month,
    kwh: Math.round(base * factors[i]),
    expected: Math.round(base * 0.98),
  }));

  return {
    totalCapacityKwp: Math.round(totalCapacityKwp * 10) / 10,
    activeProjects,
    totalProjects: projects.length,
    energyThisMonthKwh,
    savingsThisMonthRm,
    co2AvoidedTons: Math.round(co2AvoidedTons * 10) / 10,
    fleetHealthPct,
    openTickets,
    generationTrend,
    statusBreakdown,
  };
}
