export type ProjectStatus =
  | "Survey"
  | "Proposal"
  | "Installation"
  | "Inspection"
  | "Active"
  | "Maintenance";

export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: "Residential" | "Commercial" | "Industrial";
  createdAt: string;
}

export interface SolarProject {
  id: string;
  name: string;
  customerId: string;
  address: string;
  capacityKwp: number;
  panels: number;
  inverter: string;
  status: ProjectStatus;
  progress: number;
  installDate: string;
  monthlyKwh: number;
  savingsRm: number;
  co2Tons: number;
  health: "Excellent" | "Good" | "Needs Attention" | "Critical";
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignee: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerationPoint {
  month: string;
  kwh: number;
  expected: number;
}

export interface DashboardMetrics {
  totalCapacityKwp: number;
  activeProjects: number;
  totalProjects: number;
  energyThisMonthKwh: number;
  savingsThisMonthRm: number;
  co2AvoidedTons: number;
  fleetHealthPct: number;
  openTickets: number;
  generationTrend: GenerationPoint[];
  statusBreakdown: { status: ProjectStatus; count: number }[];
}
