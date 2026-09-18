import { NextResponse } from "next/server";
import { store, newId, nowIso } from "@/lib/db";
import { seedTickets } from "@/lib/seed";
import type { Ticket } from "@/lib/types";

async function ensureSeed(): Promise<Ticket[]> {
  const rows = await store.tickets.all();
  if (rows.length > 0) return rows;
  await store.tickets.save(seedTickets);
  return seedTickets;
}

export async function GET() {
  const rows = await ensureSeed();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.title || !body.projectId) {
    return NextResponse.json(
      { error: "title and projectId are required" },
      { status: 400 }
    );
  }
  const rows = await ensureSeed();
  const now = nowIso();
  const ticket: Ticket = {
    id: newId("tck"),
    projectId: String(body.projectId),
    title: String(body.title),
    description: String(body.description ?? ""),
    status: body.status ?? "Open",
    priority: body.priority ?? "Medium",
    assignee: String(body.assignee ?? "Unassigned"),
    createdAt: now,
    updatedAt: now,
  };
  rows.push(ticket);
  await store.tickets.save(rows);
  return NextResponse.json(ticket, { status: 201 });
}
