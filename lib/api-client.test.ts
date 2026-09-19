import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiClient, statusColor, formatRm, ApiError } from "./api-client";

describe("apiClient", () => {
  const originalFetch = global.fetch;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.EXPO_PUBLIC_API_URL;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env = { ...originalEnv };
  });

  it("apiClient.projects.list calls /api/projects", async () => {
    const mockData = [{ id: "prj-1", name: "Test Project" }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const result = await apiClient.projects.list();
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/projects",
      expect.objectContaining({ cache: "no-store" })
    );
    expect(result).toEqual(mockData);
  });

  it("apiClient respects NEXT_PUBLIC_APP_URL when present", async () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://solar-mgmt.vercel.app";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    await apiClient.projects.list();
    expect(global.fetch).toHaveBeenCalledWith(
      "https://solar-mgmt.vercel.app/api/projects",
      expect.anything()
    );
  });

  it("apiClient.projects.create sends POST with json payload", async () => {
    const payload = { name: "New Solar Site", customerId: "cus-1" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "prj-2", ...payload }),
    } as Response);

    const result = await apiClient.projects.create(payload);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/projects",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      })
    );
    expect(result.name).toBe("New Solar Site");
  });

  it("apiClient.projects.update sends PATCH with json payload", async () => {
    const payload = { progress: 50 };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "prj-1", progress: 50 }),
    } as Response);

    const result = await apiClient.projects.update("prj-1", payload);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/projects/prj-1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify(payload),
      })
    );
    expect(result.progress).toBe(50);
  });

  it("apiClient.projects.delete sends DELETE", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    const result = await apiClient.projects.delete("prj-1");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/projects/prj-1",
      expect.objectContaining({ method: "DELETE" })
    );
    expect(result.ok).toBe(true);
  });

  it("apiClient throws ApiError on non-ok status with server message", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "name and customerId are required" }),
    } as Response);

    await expect(
      apiClient.projects.create({ name: "", customerId: "" })
    ).rejects.toThrow("name and customerId are required");
  });

  it("apiClient.health.get returns health status", async () => {
    const mockHealth = {
      ok: true,
      service: "solar-management-web-app",
      time: "2026-09-19T00:00:00.000Z",
      backend: "json" as const,
      firebaseConfigured: false,
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockHealth,
    } as Response);

    const health = await apiClient.health.get();
    expect(health.ok).toBe(true);
    expect(health.backend).toBe("json");
  });
});

describe("apiClient utility helpers", () => {
  it("statusColor maps statuses correctly", () => {
    expect(statusColor("Active")).toContain("emerald");
    expect(statusColor("Installation")).toContain("sky");
    expect(statusColor("Survey")).toContain("yellow");
    expect(statusColor("Critical")).toContain("red");
    expect(statusColor("Unknown")).toContain("slate");
  });

  it("formatRm formats Malaysian Ringgit", () => {
    expect(formatRm(1500)).toBe("RM 1,500");
    expect(formatRm(0)).toBe("RM 0");
  });
});
