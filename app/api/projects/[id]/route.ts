import { NextResponse } from "next/server";
import { store, nowIso } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const rows = await store.projects.all();
  const found = rows.find((p) => p.id === params.id);
  if (!found) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(found);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const rows = await store.projects.all();
  const idx = rows.findIndex((p) => p.id === params.id);
  if (idx === -1)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  rows[idx] = { ...rows[idx], ...body, id: params.id, updatedAt: nowIso() };
  await store.projects.save(rows);
  return NextResponse.json(rows[idx]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const rows = await store.projects.all();
  const next = rows.filter((p) => p.id !== params.id);
  if (next.length === rows.length)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await store.projects.save(next);
  return NextResponse.json({ ok: true });
}
