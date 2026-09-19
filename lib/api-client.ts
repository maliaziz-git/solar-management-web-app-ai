import type { Customer, DashboardMetrics, SolarProject, Ticket } from "@/lib/types";

export interface HealthResponse {
  ok: boolean;
  service: string;
  time: string;
  backend: "firebase" | "json";
  firebaseConfigured: boolean;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return "";
  }
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.EXPO_PUBLIC_API_URL ||
    ""
  );
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${getBaseUrl()}${path}`;
  const headers = new Headers(options.headers || {});

  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let errorMsg = `Request to ${path} failed with status ${res.status}`;
    let errorData: unknown;
    try {
      errorData = await res.json();
      if (typeof errorData === "object" && errorData !== null && "error" in errorData) {
        errorMsg = String((errorData as { error: unknown }).error);
      }
    } catch {
      // Non-JSON response
    }
    throw new ApiError(errorMsg, res.status, errorData);
  }

  return res.json();
}

export const apiClient = {
  projects: {
    list: () => request<SolarProject[]>("/api/projects"),
    get: (id: string) => request<SolarProject>(`/api/projects/${encodeURIComponent(id)}`),
    create: (payload: Partial<SolarProject> & { name: string; customerId: string }) =>
      request<SolarProject>("/api/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<SolarProject>) =>
      request<SolarProject>(`/api/projects/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/projects/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
  },
  customers: {
    list: () => request<Customer[]>("/api/customers"),
    create: (payload: Partial<Customer> & { name: string; email: string }) =>
      request<Customer>("/api/customers", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  },
  tickets: {
    list: () => request<Ticket[]>("/api/tickets"),
    create: (payload: Partial<Ticket> & { title: string; projectId: string }) =>
      request<Ticket>("/api/tickets", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    update: (id: string, payload: Partial<Ticket>) =>
      request<Ticket>(`/api/tickets/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/api/tickets/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }),
  },
  metrics: {
    get: () => request<DashboardMetrics>("/api/metrics"),
  },
  health: {
    get: () => request<HealthResponse>("/api/health"),
  },
};

// Backwards-compatible utility functions
export const fetchProjects = apiClient.projects.list;
export const fetchCustomers = apiClient.customers.list;
export const fetchTickets = apiClient.tickets.list;

export function statusColor(status: string): string {
  switch (status) {
    case "Active":
    case "Resolved":
    case "Closed":
    case "Excellent":
      return "bg-emerald-100 text-emerald-700";
    case "Installation":
    case "In Progress":
    case "Good":
      return "bg-sky-100 text-sky-700";
    case "Survey":
    case "Proposal":
    case "Open":
      return "bg-yellow-100 text-yellow-800";
    case "Inspection":
    case "Medium":
      return "bg-violet-100 text-violet-700";
    case "Maintenance":
    case "High":
    case "Needs Attention":
      return "bg-orange-100 text-orange-700";
    case "Urgent":
    case "Critical":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export function formatRm(n: number): string {
  return `RM ${n.toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;
}
