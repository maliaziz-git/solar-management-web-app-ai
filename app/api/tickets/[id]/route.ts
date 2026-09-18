import { NextResponse } from "next/server";
import { store, nowIso } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const rows = await store.tickets.all();
  const idx = rows.findIndex((t) => t.id === params.id);
  if (idx === -1)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  rows[idx] = { ...rows[idx], ...body, id: params.id, updatedAt: nowIso() };
  await store.tickets.save(rows);
  return NextResponse.json(rows[idx]);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const rows = await store.tickets.all();
  const next = rows.filter((t) => t.id !== params.id);
  if (next.length === rows.length)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await store.tickets.save(next);
  return NextResponse.json({ ok: true });
}
