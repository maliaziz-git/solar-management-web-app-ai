import { NextResponse } from "next/server";
import { store, newId, nowIso } from "@/lib/db";
import { seedCustomers } from "@/lib/seed";
import type { Customer } from "@/lib/types";

async function ensureSeed(): Promise<Customer[]> {
  const rows = await store.customers.all();
  if (rows.length > 0) return rows;
  await store.customers.save(seedCustomers);
  return seedCustomers;
}

export async function GET() {
  const rows = await ensureSeed();
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name || !body.email) {
    return NextResponse.json(
      { error: "name and email are required" },
      { status: 400 }
    );
  }
  const rows = await ensureSeed();
  const customer: Customer = {
    id: newId("cus"),
    name: String(body.name),
    email: String(body.email),
    phone: String(body.phone ?? ""),
    address: String(body.address ?? ""),
    type: body.type ?? "Residential",
    createdAt: nowIso(),
  };
  rows.push(customer);
  await store.customers.save(rows);
  return NextResponse.json(customer, { status: 201 });
}
