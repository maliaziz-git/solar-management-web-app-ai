import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "solar-management-web-app",
    time: new Date().toISOString(),
  });
}
