import { NextResponse } from "next/server";
import { store } from "@/lib/db";
import { buildMetrics } from "@/lib/metrics";
import { seedProjects, seedTickets } from "@/lib/seed";

export async function GET() {
  let projects = await store.projects.all();
  if (projects.length === 0) {
    projects = seedProjects;
    await store.projects.save(projects);
  }
  let tickets = await store.tickets.all();
  if (tickets.length === 0) {
    tickets = seedTickets;
    await store.tickets.save(tickets);
  }
  return NextResponse.json(buildMetrics(projects, tickets));
}
