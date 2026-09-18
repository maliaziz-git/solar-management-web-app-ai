import { promises as fs } from "fs";
import path from "path";
import type { Customer, SolarProject, Ticket } from "./types";

// ---------------------------------------------------------------------------
// Pluggable data layer.
// Default: file-backed JSON store (zero-config demo, works on deploy).
// Swap to PostgreSQL (Prisma — see prisma/schema.prisma) or Firebase
// (see lib/firebase.ts) by replacing these functions without touching API/UI.
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");

// In-memory overlay. On read-only serverless filesystems (e.g. Vercel)
// disk writes fail — the app then keeps serving from memory so the demo
// stays fully functional per instance. Locally, disk remains source of truth.
const mem = new Map<string, unknown>();

async function readJson<T>(file: string, fallback: T): Promise<T> {
  if (mem.has(file)) return mem.get(file) as T;
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), "utf-8");
    const parsed = JSON.parse(raw) as T;
    mem.set(file, parsed);
    return parsed;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  mem.set(file, data);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      path.join(DATA_DIR, file),
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  } catch {
    // Read-only filesystem (serverless deploy): in-memory copy above keeps
    // the app working. Use PostgreSQL / Firebase for persistent prod data.
    console.warn(`[db] disk write skipped for ${file} (read-only fs?)`);
  }
}

export const store = {
  projects: {
    all: () => readJson<SolarProject[]>("projects.json", []),
    save: (rows: SolarProject[]) => writeJson("projects.json", rows),
  },
  customers: {
    all: () => readJson<Customer[]>("customers.json", []),
    save: (rows: Customer[]) => writeJson("customers.json", rows),
  },
  tickets: {
    all: () => readJson<Ticket[]>("tickets.json", []),
    save: (rows: Ticket[]) => writeJson("tickets.json", rows),
  },
};

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
