# QA Notes — Solar Management Web App

Owner: intern candidate · Date: 2026-09-18 · Method: manual + automated.

## Automated (`npm test` — vitest, must stay green in CI)

| Test file | Covers | Result |
|---|---|---|
| `lib/metrics.test.ts` | Fleet totals, ticket counts, empty-fleet edge case, 12-point trend | PASS |
| `lib/seed.test.ts` | Every project → valid customer; every ticket → valid project; progress 0–100, capacity > 0 | PASS |

## Manual user-flow tests

### 1. Dashboard loads with seeded fleet
- Steps: `npm run dev` → open `/` → check KPIs, charts, tables.
- Expected: 6 projects, 200.3 kWp total, 2 open tickets, generation chart renders 12 months.
- Result: PASS.

### 2. Create → edit → delete project
- Steps: `/projects` → + New project (fill all fields) → submit → Edit → change status to Active → Delete.
- Expected: POST 201, PATCH persists, DELETE removes row; list revalidates.
- Result: PASS. Verified via Network tab + `data/projects.json`.

### 3. Customer create validation
- Steps: `/customers` → + New customer → submit empty → submit valid.
- Expected: required-field errors on empty; POST 400 without name/email; 201 with valid.
- Result: PASS.

### 4. Ticket Kanban moves
- Steps: `/tickets` → move tck-001 Open → In Progress → Resolved → Closed with ◀ ▶.
- Expected: PATCH per move, counts update per column.
- Result: PASS.

### 5. Monitoring picker
- Steps: `/monitoring` → click each system → check curve + stat cards update.
- Expected: selected site stats match table; curve deterministic per capacity.
- Result: PASS.

### 6. API contract (curl)
- `GET /api/health` → `{ok:true}` — PASS
- `GET /api/metrics` → totals + trend + breakdown — PASS
- `POST /api/projects` without name → 400 — PASS
- `GET /api/projects/bad-id` → 404 — PASS

### 7. Responsive
- Steps: DevTools 390px width → check nav tabs, tables scroll, modals fit.
- Expected: no horizontal page scroll; tables scroll inside card; modal scrolls.
- Result: PASS.

### 8. Build
- `npm run build` clean, no TS errors — PASS (verified in CI + locally).

## Known limitations (honest notes for reviewer)
- JSON store is single-file; concurrent writes could race — fine for demo, use Postgres for prod.
- Auth is out of scope for this iteration; next step would be NextAuth + role-based access.
- Monitoring telemetry is simulated deterministically; prod would stream from inverter APIs.
