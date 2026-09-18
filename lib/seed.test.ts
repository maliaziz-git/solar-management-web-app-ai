import { describe, it, expect } from "vitest";
import { seedCustomers, seedProjects, seedTickets } from "./seed";

describe("seed data integrity", () => {
  it("projects reference existing customers", () => {
    const ids = new Set(seedCustomers.map((c) => c.id));
    for (const p of seedProjects) {
      expect(ids.has(p.customerId)).toBe(true);
    }
  });

  it("tickets reference existing projects", () => {
    const ids = new Set(seedProjects.map((p) => p.id));
    for (const t of seedTickets) {
      expect(ids.has(t.projectId)).toBe(true);
    }
  });

  it("project fields are sane", () => {
    for (const p of seedProjects) {
      expect(p.capacityKwp).toBeGreaterThan(0);
      expect(p.progress).toBeGreaterThanOrEqual(0);
      expect(p.progress).toBeLessThanOrEqual(100);
    }
  });
});
