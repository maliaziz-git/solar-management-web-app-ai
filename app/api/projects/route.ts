import { NextResponse } from "next/server";
import { store, newId, nowIso } from "@/lib/db";
import { seedProjects } from "@/lib/seed";
import type { SolarProject } from "@/lib/types";

async function ensureSeed(): Promise<SolarProject[]> {
  const rows = await store.projects.all();
  if (rows.length > 0) return rows;
  await store.projects.save(seedProjects);
  return seedProjects;
}

export async function GET() {
  const rows = await ensureSeed();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name || !body.customerId) {
    return NextResponse.json(
      { error: "name and customerId are required" },
      { status: 400 }
    );
  }
  const rows = await ensureSeed();
  const now = nowIso();
  const project: SolarProject = {
    id: newId("prj"),
    name: String(body.name),
    customerId: String(body.customerId),
    address: String(body.address ?? ""),
    capacityKwp: Number(body.capacityKwp ?? 0),
    panels: Number(body.panels ?? 0),
    inverter: String(body.inverter ?? ""),
    status: body.status ?? "Survey",
    progress: Number(body.progress ?? 10),
    installDate: String(body.installDate ?? now.slice(0, 10)),
    monthlyKwh: Number(body.monthlyKwh ?? 0),
    savingsRm: Number(body.savingsRm ?? 0),
    co2Tons: Number(body.co2Tons ?? 0),
    health: body.health ?? "Good",
    createdAt: now,
    updatedAt: now,
  };
  rows.push(project);
  await store.projects.save(rows);
  return NextResponse.json(project, { status: 201 });
}
