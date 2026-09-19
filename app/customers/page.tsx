"use client";

import { useState } from "react";
import useSWR, { bustCache } from "@/lib/useSWR";
import type { Customer } from "@/lib/types";
import { SectionTitle } from "@/components/Cards";
import { apiClient } from "@/lib/api-client";

export default function CustomersPage() {
  const { data: customers, mutate } = useSWR<Customer[]>(
    "/api/customers",
    () => apiClient.customers.list()
  );
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      address: String(form.get("address")),
      type: String(form.get("type")) as Customer["type"],
    };
    setSaving(true);
    setError(null);
    try {
      await apiClient.customers.create(payload);
      bustCache();
      await mutate();
      setShowForm(false);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create customer");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionTitle
        title="Customers"
        sub={`${customers?.length ?? 0} accounts · residential, commercial, industrial`}
        action={
          <button
            className="btn-accent"
            onClick={() => {
              setError(null);
              setShowForm(true);
            }}
          >
            + New customer
          </button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customers?.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="badge bg-slate-100 text-slate-700">{c.type}</span>
              <span className="text-xs text-slate-400">{c.id}</span>
            </div>
            <p className="mt-2 text-base font-bold text-slate-900">{c.name}</p>
            <p className="mt-1 text-sm text-slate-500">{c.email}</p>
            <p className="text-sm text-slate-500">{c.phone}</p>
            <p className="mt-2 text-xs text-slate-500">{c.address}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-20 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
          <form onSubmit={handleSubmit} className="card w-full max-w-lg p-6">
            <h3 className="text-base font-bold">New customer</h3>
            <p className="text-xs text-slate-500">
              Connected to REST API (POST /api/customers)
            </p>
            {error && (
              <div className="mt-3 rounded-lg bg-red-50 p-2.5 text-xs font-semibold text-red-600">
                {error}
              </div>
            )}
            <div className="mt-4 grid gap-3">
              <input
                name="name"
                required
                placeholder="Full name / company"
                className="input"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="email"
                  required
                  type="email"
                  placeholder="Email"
                  className="input"
                />
                <input name="phone" placeholder="Phone" className="input" />
              </div>
              <input name="address" placeholder="Address" className="input" />
              <select name="type" className="input" defaultValue="Residential">
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
              </select>
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
                {saving ? "Saving…" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
