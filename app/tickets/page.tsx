"use client";

import { useMemo, useState } from "react";
import useSWR, { bustCache } from "@/lib/useSWR";
import type { SolarProject, Ticket, TicketStatus, TicketPriority } from "@/lib/types";
import { SectionTitle } from "@/components/Cards";
import { apiClient, statusColor } from "@/lib/api-client";

const COLS: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];

export default function TicketsPage() {
  const { data: tickets, mutate } = useSWR<Ticket[]>(
    "/api/tickets",
    () => apiClient.tickets.list()
  );
  const { data: projects } = useSWR<SolarProject[]>(
    "/api/projects",
    () => apiClient.projects.list()
  );
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(COLS.map((c) => [c, [] as Ticket[]]));
    (tickets ?? []).forEach((t) => {
      (map[t.status] ??= []).push(t);
    });
    return map as Record<TicketStatus, Ticket[]>;
  }, [tickets]);

  async function move(id: string, status: TicketStatus) {
    try {
      await apiClient.tickets.update(id, { status });
      bustCache();
      await mutate();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update ticket status");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setSaving(true);
    setError(null);
    try {
      await apiClient.tickets.create({
        projectId: String(form.get("projectId")),
        title: String(form.get("title")),
        description: String(form.get("description")),
        priority: String(form.get("priority")) as TicketPriority,
        assignee: String(form.get("assignee")),
      });
      bustCache();
      await mutate();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create ticket");
    } finally {
      setSaving(false);
    }
  }

  const projectName = (id: string) =>
    projects?.find((p) => p.id === id)?.name ?? id;

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Maintenance board"
        sub="O&M Kanban · click ◀ ▶ to move tickets through QA-verified workflow"
        action={
          <button
            className="btn-accent"
            onClick={() => {
              setError(null);
              setShowForm(true);
            }}
          >
            + New ticket
          </button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {COLS.map((col) => (
          <div
            key={col}
            className="card flex min-h-[300px] flex-col bg-slate-50/60 p-3"
          >
            <div className="flex items-center justify-between px-1 pb-2">
              <p className="text-sm font-bold text-slate-800">{col}</p>
              <span className="badge bg-slate-200 text-slate-700">
                {byStatus[col]?.length ?? 0}
              </span>
            </div>
            <div className="space-y-2">
              {(byStatus[col] ?? []).map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {t.title}
                    </p>
                    <span className={`badge ${statusColor(t.priority)}`}>
                      {t.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {projectName(t.projectId)}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                    {t.description}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">{t.assignee}</p>
                  <div className="mt-2 flex gap-1">
                    {COLS[COLS.indexOf(col) - 1] && (
                      <button
                        onClick={() => move(t.id, COLS[COLS.indexOf(col) - 1])}
                        className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold"
                        title="Move back"
                      >
                        ◀
                      </button>
                    )}
                    {COLS[COLS.indexOf(col) + 1] && (
                      <button
                        onClick={() => move(t.id, COLS[COLS.indexOf(col) + 1])}
                        className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-bold text-white"
                        title="Move forward"
                      >
                        ▶
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
          <form
            onSubmit={handleSubmit}
            className="card w-full max-w-lg p-6"
          >
            <h3 className="text-base font-bold">New maintenance ticket</h3>
            <p className="text-xs text-slate-500">
              Connected to REST API (POST /api/tickets)
            </p>
            {error && (
              <div className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}
            <div className="mt-4 grid gap-3">
              <select
                name="projectId"
                required
                className="input"
                defaultValue={projects?.[0]?.id}
              >
                {projects?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                name="title"
                required
                placeholder="Title e.g. Inverter fault code E031"
                className="input"
              />
              <textarea
                name="description"
                placeholder="Repro steps, logs, photos…"
                rows={3}
                className="input"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  name="priority"
                  className="input"
                  defaultValue="Medium"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
                <input
                  name="assignee"
                  placeholder="Assignee"
                  defaultValue="O&M Team"
                  className="input"
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold"
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
              >
                Cancel
              </button>
              <button disabled={saving} className="btn-primary">
                {saving ? "Saving…" : "Create ticket"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
