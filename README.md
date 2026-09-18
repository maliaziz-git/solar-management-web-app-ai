# SOLS Energy — Solar Management Web App

Portfolio build for the **Web App Developer Intern** role
([job post](https://www.solsenergy.com/careers/web-app-development-intern)).

**Stack (as requested):** Next.js + React.js + TypeScript + Tailwind CSS ·
PostgreSQL / Firebase-ready + REST APIs · React Native starter · Git & GitHub workflow.

## What it does

| Page | Route | Features |
|---|---|---|
| Dashboard | `/` | Fleet KPIs, 12-month generation vs expected chart, pipeline donut, recent projects, open maintenance |
| Projects | `/projects` | Search + status filter, full CRUD (POST/PATCH/DELETE `/api/projects`), progress bars, health badges |
| Customers | `/customers` | Customer cards + create flow (POST `/api/customers`) |
| Monitoring | `/monitoring` | Per-site power curve, system picker, fleet ranking chart |
| Maintenance | `/tickets` | O&M Kanban (Open → In Progress → Resolved → Closed), ticket CRUD |

**REST APIs:** `GET/POST /api/projects`, `GET/PATCH/DELETE /api/projects/[id]`,
`GET/POST /api/customers`, `GET/POST /api/tickets`, `PATCH/DELETE /api/tickets/[id]`,
`GET /api/metrics`, `GET /api/health`.

**Backend & data:** zero-config JSON store in `data/` by default so the demo runs
anywhere; `lib/db.ts` is a swappable adapter — `prisma/schema.prisma` for
PostgreSQL and `lib/firebase.ts` for Firebase. UI + API code doesn't change.

**Mobile:** `mobile/` is an Expo React Native starter hitting the same REST APIs.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # vitest: metrics + seed integrity
npm run build && npm start
```

## Git & GitHub workflow

```bash
git init && git add . && git commit -m "feat: solar management web app"
gh repo create solar-management-web-app --private --source=. --push
# branch per feature: git checkout -b feat/monitoring
# open PR against main — template + CI in .github/
```

Preview deployments: connect the repo to Vercel; every PR gets a URL.

## Deploy on Vercel

No config needed — import the repo at vercel.com/new and deploy.
PRs get automatic preview deployments via the GitHub integration.

> Note: the default JSON store persists to disk locally, but Vercel's
> filesystem is read-only, so demo writes there live in memory per
> instance (see `lib/db.ts`). For persistent production data, switch to
> PostgreSQL (`prisma/schema.prisma`) or Firebase (`lib/firebase.ts`).

## QA notes

See `QA_NOTES.md` — what was tested, repro steps, results. CI runs
`npm test` + `npm run build` on every PR.

## Tech direction notes

- App Router + serverless API routes (one deployable).
- `lib/useSWR.ts` — tiny client cache, no extra dep.
- Charts via `recharts`, icons via `lucide-react`.
- Responsive: sidebar on desktop, top tabs on mobile.
