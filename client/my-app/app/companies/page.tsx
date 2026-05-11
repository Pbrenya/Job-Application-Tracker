"use client";

import { useEffect, useState } from "react";
import AppShell from "@/app/components/AppShell";
import RequireAuth from "@/app/components/RequireAuth";
import {
  Company,
  createCompany,
  deleteCompany,
  getCompanies,
  updateCompany,
} from "@/app/lib/api";

type CompanyFormState = {
  name: string;
  location: string;
  website: string;
};

const emptyForm: CompanyFormState = {
  name: "",
  location: "",
  website: "",
};

const toOptionalString = (value: string) =>
  value.trim() === "" ? undefined : value.trim();

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState<CompanyFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CompanyFormState>(emptyForm);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCompanies = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStatus("");

    if (!form.name.trim()) {
      setError("Company name is required.");
      return;
    }

    try {
      const created = await createCompany({
        name: form.name.trim(),
        location: toOptionalString(form.location),
        website: toOptionalString(form.website),
      });
      setCompanies((prev) => [created, ...prev]);
      setForm(emptyForm);
      setStatus("Company created.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create company.");
    }
  };

  const startEdit = (company: Company) => {
    setEditingId(company.id);
    setEditForm({
      name: company.name ?? "",
      location: company.location ?? "",
      website: company.website ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) {
      return;
    }

    setError("");
    setStatus("");

    try {
      const updated = await updateCompany(editingId, {
        name: editForm.name.trim(),
        location: toOptionalString(editForm.location),
        website: toOptionalString(editForm.website),
      });
      setCompanies((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setEditingId(null);
      setStatus("Company updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update company.");
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this company?");
    if (!confirmed) {
      return;
    }

    setError("");
    setStatus("");
    try {
      await deleteCompany(id);
      setCompanies((prev) => prev.filter((item) => item.id !== id));
      setStatus("Company deleted.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete company.");
    }
  };

  return (
    <RequireAuth>
      <AppShell>
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-semibold">Companies</h1>
          {loading ? <p className="text-sm">Loading...</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {status ? <p className="text-sm text-green-700">{status}</p> : null}

          <section className="rounded-md border border-zinc-200 p-4">
            <h2 className="text-sm font-semibold">Add company</h2>
            <form className="mt-4 grid gap-4" onSubmit={handleCreate}>
              <label className="text-sm text-zinc-700">
                Name
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label className="text-sm text-zinc-700">
                Location
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  value={form.location}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      location: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm text-zinc-700">
                Website
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  type="url"
                  value={form.website}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      website: event.target.value,
                    }))
                  }
                />
              </label>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
              >
                Add company
              </button>
            </form>
          </section>

          <section className="rounded-md border border-zinc-200 p-4">
            <h2 className="text-sm font-semibold">Company list</h2>
            {companies.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-600">No companies yet.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {companies.map((company) => {
                  const isEditing = editingId === company.id;
                  return (
                    <div
                      key={company.id}
                      className="rounded-md border border-zinc-200 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">
                            {company.name}
                          </div>
                          <div className="text-xs text-zinc-600">
                            {company.location || "No location"}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <button
                            type="button"
                            className="rounded-md border border-zinc-300 px-2 py-1"
                            onClick={() => startEdit(company)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-zinc-300 px-2 py-1"
                            onClick={() => handleDelete(company.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {company.website ? (
                        <div className="mt-1 text-xs text-zinc-600">
                          Website: {company.website}
                        </div>
                      ) : null}

                      {isEditing ? (
                        <form
                          className="mt-4 grid gap-4"
                          onSubmit={handleUpdate}
                        >
                          <label className="text-sm text-zinc-700">
                            Name
                            <input
                              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                              value={editForm.name}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  name: event.target.value,
                                }))
                              }
                              required
                            />
                          </label>
                          <label className="text-sm text-zinc-700">
                            Location
                            <input
                              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                              value={editForm.location}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  location: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="text-sm text-zinc-700">
                            Website
                            <input
                              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                              type="url"
                              value={editForm.website}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  website: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="submit"
                              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
                              onClick={cancelEdit}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </AppShell>
    </RequireAuth>
  );
}
