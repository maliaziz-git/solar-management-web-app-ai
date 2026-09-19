import { NextResponse } from "next/server";
import { isFirebaseConfigured } from "@/lib/firebase";

export async function GET() {
  const firebaseConfigured = isFirebaseConfigured();
  const backend =
    process.env.DATA_BACKEND === "firebase" || firebaseConfigured
      ? "firebase"
      : "json";

  return NextResponse.json({
    ok: true,
    service: "solar-management-web-app",
    time: new Date().toISOString(),
    backend,
    firebaseConfigured,
  });
}
