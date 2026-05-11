"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/app/components/AppShell";
import RequireAuth from "@/app/components/RequireAuth";
import {
  Application,
  Company,
  createApplication,
  deleteApplication,
  getApplications,
  getCompanies,
  updateApplication,
} from "@/app/lib/api";

type ApplicationFormState = {
  company_id: string;
  job_title: string;
  stage_id: string;
  salary_min: string;
  salary_max: string;
  applied_at: string;
  job_url: string;
  description: string;
};

const emptyForm: ApplicationFormState = {
  company_id: "",
  job_title: "",
  stage_id: "",
  salary_min: "",
  salary_max: "",
  applied_at: "",
  job_url: "",
  description: "",
};

const toOptionalNumber = (value: string) =>
  value.trim() === "" ? undefined : Number(value);

const toOptionalString = (value: string) =>
  value.trim() === "" ? undefined : value.trim();

const formatDateInput = (value?: string | null) => {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString().slice(0, 10);
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState<ApplicationFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ApplicationFormState>(emptyForm);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const companyMap = useMemo(
    () => new Map(companies.map((company) => [company.id, company.name])),
    [companies]
  );

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [apps, companyList] = await Promise.all([
        getApplications(),
        getCompanies(),
      ]);
      setApplications(apps);
      setCompanies(companyList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const buildPayload = (state: ApplicationFormState) => {
    if (!state.company_id || !state.job_title) {
      throw new Error("Company and job title are required.");
    }

    const stageId = Number(state.stage_id);
    if (Number.isNaN(stageId)) {
      throw new Error("Stage must be a number.");
    }

    return {
      company_id: state.company_id,
      job_title: state.job_title.trim(),
      stage_id: stageId,
      description: toOptionalString(state.description),
      applied_at: toOptionalString(state.applied_at),
      salary_min: toOptionalNumber(state.salary_min),
      salary_max: toOptionalNumber(state.salary_max),
      job_url: toOptionalString(state.job_url),
    };
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setStatus("");

    try {
      const payload = buildPayload(form);
      const created = await createApplication(payload);
      setApplications((prev) => [created, ...prev]);
      setForm(emptyForm);
      setStatus("Application created.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create application."
      );
    }
  };

  const startEdit = (application: Application) => {
    setEditingId(application.id);
    setEditForm({
      company_id: application.company_id,
      job_title: application.job_title ?? "",
      stage_id: application.stage_id?.toString() ?? "",
      salary_min: application.salary_min?.toString() ?? "",
      salary_max: application.salary_max?.toString() ?? "",
      applied_at: formatDateInput(application.applied_at ?? undefined),
      job_url: application.job_url ?? "",
      description: application.description ?? "",
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
      const payload = buildPayload(editForm);
      const updated = await updateApplication(editingId, payload);
      setApplications((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setEditingId(null);
      setStatus("Application updated.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update application."
      );
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this application?");
    if (!confirmed) {
      return;
    }

    setError("");
    setStatus("");
    try {
      await deleteApplication(id);
      setApplications((prev) => prev.filter((item) => item.id !== id));
      setStatus("Application deleted.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete application."
      );
    }
  };

  return (
    <RequireAuth>
      <AppShell>
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-semibold">Applications</h1>
          {loading ? <p className="text-sm">Loading...</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {status ? <p className="text-sm text-green-700">{status}</p> : null}

          <section className="rounded-md border border-zinc-200 p-4">
            <h2 className="text-sm font-semibold">Add application</h2>
            <form className="mt-4 grid gap-4" onSubmit={handleCreate}>
              <label className="text-sm text-zinc-700">
                Company
                <select
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  value={form.company_id}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      company_id: event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-zinc-700">
                Job title
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  value={form.job_title}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      job_title: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label className="text-sm text-zinc-700">
                Stage id
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  type="number"
                  value={form.stage_id}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      stage_id: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <label className="text-sm text-zinc-700">
                Applied date
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  type="date"
                  value={form.applied_at}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      applied_at: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm text-zinc-700">
                Salary min
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  type="number"
                  value={form.salary_min}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      salary_min: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm text-zinc-700">
                Salary max
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  type="number"
                  value={form.salary_max}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      salary_max: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm text-zinc-700">
                Job URL
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  type="url"
                  value={form.job_url}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      job_url: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm text-zinc-700">
                Description
                <textarea
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      description: event.target.value,
                    }))
                  }
                  rows={3}
                />
              </label>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
              >
                Add application
              </button>
            </form>
          </section>

          <section className="rounded-md border border-zinc-200 p-4">
            <h2 className="text-sm font-semibold">Current applications</h2>
            {applications.length === 0 ? (
              <p className="mt-3 text-sm text-zinc-600">No applications yet.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {applications.map((application) => {
                  const companyName =
                    companyMap.get(application.company_id) ?? "Unknown company";
                  const isEditing = editingId === application.id;
                  return (
                    <div
                      key={application.id}
                      className="rounded-md border border-zinc-200 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-semibold">
                            {application.job_title}
                          </div>
                          <div className="text-xs text-zinc-600">
                            {companyName}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                          <Link
                            className="rounded-md border border-zinc-300 px-2 py-1"
                            href={`/applications/${application.id}`}
                          >
                            Details
                          </Link>
                          <button
                            type="button"
                            className="rounded-md border border-zinc-300 px-2 py-1"
                            onClick={() => startEdit(application)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-md border border-zinc-300 px-2 py-1"
                            onClick={() => handleDelete(application.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-zinc-600">
                        Stage: {application.stage_id}
                        {application.applied_at
                          ? ` | Applied: ${formatDateInput(
                              application.applied_at
                            )}`
                          : ""}
                      </div>
                      {application.resume_path ? (
                        <div className="mt-1 text-xs text-zinc-600">
                          Resume: {application.resume_path}
                        </div>
                      ) : null}

                      {isEditing ? (
                        <form
                          className="mt-4 grid gap-4"
                          onSubmit={handleUpdate}
                        >
                          <label className="text-sm text-zinc-700">
                            Company
                            <select
                              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                              value={editForm.company_id}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  company_id: event.target.value,
                                }))
                              }
                              required
                            >
                              <option value="">Select company</option>
                              {companies.map((company) => (
                                <option key={company.id} value={company.id}>
                                  {company.name}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="text-sm text-zinc-700">
                            Job title
                            <input
                              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                              value={editForm.job_title}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  job_title: event.target.value,
                                }))
                              }
                              required
                            />
                          </label>
                          <label className="text-sm text-zinc-700">
                            Stage id
                            <input
                              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                              type="number"
                              value={editForm.stage_id}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  stage_id: event.target.value,
                                }))
                              }
                              required
                            />
                          </label>
                          <label className="text-sm text-zinc-700">
                            Applied date
                            <input
                              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                              type="date"
                              value={editForm.applied_at}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  applied_at: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="text-sm text-zinc-700">
                            Salary min
                            <input
                              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                              type="number"
                              value={editForm.salary_min}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  salary_min: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="text-sm text-zinc-700">
                            Salary max
                            <input
                              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                              type="number"
                              value={editForm.salary_max}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  salary_max: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="text-sm text-zinc-700">
                            Job URL
                            <input
                              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                              type="url"
                              value={editForm.job_url}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  job_url: event.target.value,
                                }))
                              }
                            />
                          </label>
                          <label className="text-sm text-zinc-700">
                            Description
                            <textarea
                              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                              value={editForm.description}
                              onChange={(event) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  description: event.target.value,
                                }))
                              }
                              rows={3}
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
