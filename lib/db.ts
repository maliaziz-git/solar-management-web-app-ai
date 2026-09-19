import { promises as fs } from "fs";
import path from "path";
import type { Customer, SolarProject, Ticket } from "./types";
import {
  isFirebaseConfigured,
  firestoreGetAll,
  firestoreSaveAll,
} from "./firebase";

// ---------------------------------------------------------------------------
// Pluggable data layer.
// Default: file-backed JSON store (zero-config demo, works on deploy).
// Swap to PostgreSQL (Prisma — see prisma/schema.prisma) or Firebase
// (see lib/firebase.ts) by setting DATA_BACKEND=firebase or configuring
// Firebase environment variables.
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

function shouldUseFirebase(): boolean {
  return process.env.DATA_BACKEND === "firebase" || isFirebaseConfigured();
}

export const store = {
  projects: {
    all: async () => {
      if (shouldUseFirebase()) {
        try {
          const rows = await firestoreGetAll<SolarProject>("projects");
          if (rows.length > 0) return rows;
        } catch (err) {
          console.warn("[db] Firestore fetch failed, falling back to JSON:", err);
        }
      }
      return readJson<SolarProject[]>("projects.json", []);
    },
    save: async (rows: SolarProject[]) => {
      if (shouldUseFirebase()) {
        try {
          await firestoreSaveAll("projects", rows);
        } catch (err) {
          console.warn("[db] Firestore write failed, saving to JSON:", err);
        }
      }
      return writeJson("projects.json", rows);
    },
  },
  customers: {
    all: async () => {
      if (shouldUseFirebase()) {
        try {
          const rows = await firestoreGetAll<Customer>("customers");
          if (rows.length > 0) return rows;
        } catch (err) {
          console.warn("[db] Firestore fetch failed, falling back to JSON:", err);
        }
      }
      return readJson<Customer[]>("customers.json", []);
    },
    save: async (rows: Customer[]) => {
      if (shouldUseFirebase()) {
        try {
          await firestoreSaveAll("customers", rows);
        } catch (err) {
          console.warn("[db] Firestore write failed, saving to JSON:", err);
        }
      }
      return writeJson("customers.json", rows);
    },
  },
  tickets: {
    all: async () => {
      if (shouldUseFirebase()) {
        try {
          const rows = await firestoreGetAll<Ticket>("tickets");
          if (rows.length > 0) return rows;
        } catch (err) {
          console.warn("[db] Firestore fetch failed, falling back to JSON:", err);
        }
      }
      return readJson<Ticket[]>("tickets.json", []);
    },
    save: async (rows: Ticket[]) => {
      if (shouldUseFirebase()) {
        try {
          await firestoreSaveAll("tickets", rows);
        } catch (err) {
          console.warn("[db] Firestore write failed, saving to JSON:", err);
        }
      }
      return writeJson("tickets.json", rows);
    },
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
