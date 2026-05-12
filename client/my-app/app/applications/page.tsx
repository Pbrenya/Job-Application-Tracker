"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/app/components/AppShell";
import RequireAuth from "@/app/components/RequireAuth";
import { useFilters } from "@/app/components/FiltersContext";
import {
  Application,
  Company,
  createApplication,
  deleteApplication,
  getApplications,
  getCompanies,
  updateApplication,
} from "@/app/lib/api";
import { applyApplicationFilters } from "@/app/lib/filters";

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

const cardTones = ["peach", "mint", "lavender", "sky", "pink", "slate"];

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
  const { filters } = useFilters();

  const companyMap = useMemo(
    () => new Map(companies.map((company) => [company.id, company.name])),
    [companies]
  );

  const filteredApplications = useMemo(
    () => applyApplicationFilters(applications, companies, filters),
    [applications, companies, filters]
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
      <AppShell fullBleed>
        <div className="jt-page">
          <div className="jt-page__head">
            <div>
              <h1>Applications</h1>
              <p className="jt-page__subtitle">
                Manage every role, stage, and salary range in one place.
              </p>
            </div>
            <Link className="jt-button jt-button--outline" href="/companies">
              Manage companies
            </Link>
          </div>
          {loading ? <p className="jt-page__subtitle">Loading...</p> : null}
          {error ? <p className="jt-alert jt-alert--error">{error}</p> : null}
          {status ? (
            <p className="jt-alert jt-alert--success">{status}</p>
          ) : null}

          <div className="jt-split">
            <section className="jt-panel">
              <div className="jt-panel__title">Add application</div>
              <form className="jt-form" onSubmit={handleCreate}>
                <label className="jt-field">
                  Company
                  <select
                    className="jt-select"
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
                <label className="jt-field">
                  Job title
                  <input
                    className="jt-input"
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
                <label className="jt-field">
                  Stage id
                  <input
                    className="jt-input"
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
                <label className="jt-field">
                  Applied date
                  <input
                    className="jt-input"
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
                <label className="jt-field">
                  Salary min
                  <input
                    className="jt-input"
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
                <label className="jt-field">
                  Salary max
                  <input
                    className="jt-input"
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
                <label className="jt-field">
                  Job URL
                  <input
                    className="jt-input"
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
                <label className="jt-field">
                  Description
                  <textarea
                    className="jt-textarea"
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
                <button type="submit" className="jt-button jt-button--primary">
                  Add application
                </button>
              </form>
            </section>

            <section className="jt-panel">
              <div className="jt-panel__title">Current applications</div>
              {filteredApplications.length === 0 ? (
                <p className="jt-page__subtitle">
                  {applications.length === 0
                    ? "No applications yet."
                    : "No applications match the current filters."}
                </p>
              ) : (
                <div className="jt-grid">
                  {filteredApplications.map((application, index) => {
                    const companyName =
                      companyMap.get(application.company_id) ??
                      "Unknown company";
                    const isEditing = editingId === application.id;
                    return (
                      <div
                        key={application.id}
                        className={`jt-item-card jt-item-card--${
                          cardTones[index % cardTones.length]
                        }`}
                        style={{ animationDelay: `${0.05 * index}s` }}
                      >
                        <div className="jt-item-card__head">
                          <div>
                            <div className="jt-item-card__title">
                              {application.job_title}
                            </div>
                            <div className="jt-item-card__meta">
                              {companyName}
                            </div>
                          </div>
                          <div className="jt-row">
                            <Link
                              className="jt-button jt-button--outline jt-button--sm"
                              href={`/applications/${application.id}`}
                            >
                              Details
                            </Link>
                            <button
                              type="button"
                              className="jt-button jt-button--outline jt-button--sm"
                              onClick={() => startEdit(application)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="jt-button jt-button--outline jt-button--sm"
                              onClick={() => handleDelete(application.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="jt-item-card__meta">
                          Stage: {application.stage_id}
                          {application.applied_at
                            ? ` | Applied: ${formatDateInput(
                                application.applied_at
                              )}`
                            : ""}
                        </div>
                        {application.resume_path ? (
                          <div className="jt-item-card__meta">
                            Resume: {application.resume_path}
                          </div>
                        ) : null}

                        {isEditing ? (
                          <form className="jt-form" onSubmit={handleUpdate}>
                            <label className="jt-field">
                              Company
                              <select
                                className="jt-select"
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
                            <label className="jt-field">
                              Job title
                              <input
                                className="jt-input"
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
                            <label className="jt-field">
                              Stage id
                              <input
                                className="jt-input"
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
                            <label className="jt-field">
                              Applied date
                              <input
                                className="jt-input"
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
                            <label className="jt-field">
                              Salary min
                              <input
                                className="jt-input"
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
                            <label className="jt-field">
                              Salary max
                              <input
                                className="jt-input"
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
                            <label className="jt-field">
                              Job URL
                              <input
                                className="jt-input"
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
                            <label className="jt-field">
                              Description
                              <textarea
                                className="jt-textarea"
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
                            <div className="jt-row">
                              <button
                                type="submit"
                                className="jt-button jt-button--primary jt-button--sm"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="jt-button jt-button--outline jt-button--sm"
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
        </div>
      </AppShell>
    </RequireAuth>
  );
}
