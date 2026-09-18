import type { Customer, SolarProject, Ticket } from "@/lib/types";

export async function fetchProjects(): Promise<SolarProject[]> {
  const res = await fetch("/api/projects", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load projects");
  return res.json();
}

export async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch("/api/customers", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load customers");
  return res.json();
}

export async function fetchTickets(): Promise<Ticket[]> {
  const res = await fetch("/api/tickets", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load tickets");
  return res.json();
}

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
