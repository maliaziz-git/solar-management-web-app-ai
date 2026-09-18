import { describe, it, expect } from "vitest";
import { buildMetrics } from "@/lib/metrics";
import { seedProjects, seedTickets } from "@/lib/seed";

describe("buildMetrics", () => {
  it("aggregates fleet totals from projects", () => {
    const m = buildMetrics(seedProjects, seedTickets);
    expect(m.totalProjects).toBe(seedProjects.length);
    expect(m.totalCapacityKwp).toBeCloseTo(
      seedProjects.reduce((s, p) => s + p.capacityKwp, 0),
      5
    );
    expect(m.energyThisMonthKwh).toBe(
      seedProjects.reduce((s, p) => s + p.monthlyKwh, 0)
    );
    expect(m.generationTrend).toHaveLength(12);
    expect(m.statusBreakdown.reduce((s, x) => s + x.count, 0)).toBe(
      seedProjects.length
    );
  });

  it("counts open tickets correctly", () => {
    const m = buildMetrics(seedProjects, seedTickets);
    expect(m.openTickets).toBe(2);
  });

  it("handles empty fleet without crashing", () => {
    const m = buildMetrics([], []);
    expect(m.totalCapacityKwp).toBe(0);
    expect(m.fleetHealthPct).toBe(100);
    expect(m.generationTrend).toHaveLength(12);
  });
});
