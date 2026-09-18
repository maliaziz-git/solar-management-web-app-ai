"use client";

import { useMemo, useState } from "react";
import useSWR, { bustCache } from "@/lib/useSWR";
import type { Customer, ProjectStatus, SolarProject } from "@/lib/types";
import { SectionTitle } from "@/components/Cards";
import { statusColor } from "@/lib/api-client";

const STATUSES: ("All" | ProjectStatus)[] = ["All", "Survey", "Proposal", "Installation", "Inspection", "Active", "Maintenance"];

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("fetch failed");
  return res.json();
}

export default function ProjectsPage() {
  const { data: projects, mutate } = useSWR<SolarProject[]>("/api/projects", get);
  const { data: customers } = useSWR<Customer[]>("/api/customers", get);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SolarProject | null>(null);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      const hitQ = query === "" || `${p.name} ${p.address} ${p.inverter}`.toLowerCase().includes(query.toLowerCase());
      const hitS = status === "All" || p.status === status;
      return hitQ && hitS;
    });
  }, [projects, query, status]);

  const customerName = (id: string) => customers?.find((c) => c.id === id)?.name ?? id;

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    bustCache();
    await mutate();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")),
      customerId: String(form.get("customerId")),
      address: String(form.get("address")),
      capacityKwp: Number(form.get("capacityKwp")),
      panels: Number(form.get("panels")),
      inverter: String(form.get("inverter")),
      status: String(form.get("status")),
      progress: Number(form.get("progress")),
      installDate: String(form.get("installDate")),
      monthlyKwh: Number(form.get("monthlyKwh")),
      savingsRm: Number(form.get("savingsRm")),
      health: String(form.get("health")),
    };
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/projects/${editing.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } else {
        await fetch("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      }
      bustCache();
      await mutate();
      setShowForm(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Solar projects"
        sub={`${filtered.length} of ${projects?.length ?? 0} installations · search, filter, create, update status`}
        action={
          <button className="btn-accent" onClick={() => { setEditing(null); setShowForm(true); }}>
            + New project
          </button>
        }
      />

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <input className="input sm:max-w-xs" placeholder="Search name, address, inverter…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatus(s)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${status === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="table w-full min-w-[860px]">
          <thead className="bg-slate-50">
            <tr><th>Project / Customer</th><th>Status</th><th>Progress</th><th className="text-right">Capacity</th><th className="text-right">Output/mo</th><th>Health</th><th className="text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td>
                  <p className="font-semibold text-slate-900">{p.name}</p>
                  <p className="text-xs text-slate-500">{customerName(p.customerId)} · {p.address}</p>
                  <p className="text-xs text-slate-400">{p.panels} panels · {p.inverter}</p>
                </td>
                <td><span className={`badge ${statusColor(p.status)}`}>{p.status}</span></td>
                <td>
                  <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-yellow-400" style={{ width: `${p.progress}%` }} /></div>
                  <p className="mt-1 text-xs text-slate-500">{p.progress}%</p>
                </td>
                <td className="text-right font-semibold">{p.capacityKwp} kWp</td>
                <td className="text-right">{p.monthlyKwh.toLocaleString()} kWh</td>
                <td><span className={`badge ${statusColor(p.health)}`}>{p.health}</span></td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200" onClick={() => { setEditing(p); setShowForm(true); }}>Edit</button>
                    <button className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100" onClick={() => handleDelete(p.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">No projects match. Try clearing filters.</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
          <form onSubmit={handleSubmit} className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-base font-bold">{editing ? "Edit project" : "New project"}</h3>
            <p className="text-xs text-slate-500">POST / PATCH /api/projects — validated, tested flow</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold">Name<input name="name" required defaultValue={editing?.name} className="input mt-1" /></label>
              <label className="text-xs font-semibold">Customer
                <select name="customerId" required defaultValue={editing?.customerId} className="input mt-1">
                  {customers?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold sm:col-span-2">Site address<input name="address" defaultValue={editing?.address} className="input mt-1" /></label>
              <label className="text-xs font-semibold">Capacity (kWp)<input name="capacityKwp" type="number" step="0.1" defaultValue={editing?.capacityKwp ?? 8} className="input mt-1" /></label>
              <label className="text-xs font-semibold">Panels<input name="panels" type="number" defaultValue={editing?.panels ?? 18} className="input mt-1" /></label>
              <label className="text-xs font-semibold sm:col-span-2">Inverter<input name="inverter" defaultValue={editing?.inverter} className="input mt-1" /></label>
              <label className="text-xs font-semibold">Status
                <select name="status" defaultValue={editing?.status ?? "Survey"} className="input mt-1">
                  {STATUSES.filter((s) => s !== "All").map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold">Progress %<input name="progress" type="number" min={0} max={100} defaultValue={editing?.progress ?? 10} className="input mt-1" /></label>
              <label className="text-xs font-semibold">Install date<input name="installDate" type="date" defaultValue={editing?.installDate ?? "2026-10-01"} className="input mt-1" /></label>
              <label className="text-xs font-semibold">Monthly kWh<input name="monthlyKwh" type="number" defaultValue={editing?.monthlyKwh ?? 0} className="input mt-1" /></label>
              <label className="text-xs font-semibold">Savings RM/mo<input name="savingsRm" type="number" defaultValue={editing?.savingsRm ?? 0} className="input mt-1" /></label>
              <label className="text-xs font-semibold">Health
                <select name="health" defaultValue={editing?.health ?? "Good"} className="input mt-1">
                  {["Excellent", "Good", "Needs Attention", "Critical"].map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
              <button disabled={saving} className="btn-primary">{saving ? "Saving…" : editing ? "Save changes" : "Create project"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
