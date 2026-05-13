"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/app/components/AppShell";
import RequireAuth from "@/app/components/RequireAuth";
import { useFilters } from "@/app/components/FiltersContext";
import {
  Company,
  createCompany,
  deleteCompany,
  getCompanies,
  updateCompany,
} from "@/app/lib/api";
import { applyCompanyFilters } from "@/app/lib/filters";

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

const cardTones = ["peach", "mint", "lavender", "sky", "pink", "slate"];

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [form, setForm] = useState<CompanyFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<CompanyFormState>(emptyForm);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const { filters } = useFilters();

  const filteredCompanies = useMemo(
    () => applyCompanyFilters(companies, filters),
    [companies, filters]
  );

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
      <AppShell fullBleed>
        <div className="jt-page">
          <div className="jt-page__head">
            <div>
              <h1>Companies</h1>
              <p className="jt-page__subtitle">
                Keep a clear list of the teams you are targeting.
              </p>
              <div className="jt-row">
                <span className="jt-pill">
                  Showing {filteredCompanies.length} of {companies.length}
                </span>
              </div>
            </div>
          </div>
          {loading ? <p className="jt-page__subtitle">Loading...</p> : null}
          {error ? <p className="jt-alert jt-alert--error">{error}</p> : null}
          {status ? (
            <p className="jt-alert jt-alert--success">{status}</p>
          ) : null}

          <div className="jt-split">
            <section className="jt-panel">
              <div className="jt-panel__title">Add company</div>
              <form className="jt-form" onSubmit={handleCreate}>
                <label className="jt-field">
                  Name
                  <input
                    className="jt-input"
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
                <label className="jt-field">
                  Location
                  <input
                    className="jt-input"
                    value={form.location}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        location: event.target.value,
                      }))
                    }
                  />
                </label>
                <label className="jt-field">
                  Website
                  <input
                    className="jt-input"
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
                <button type="submit" className="jt-button jt-button--primary">
                  Add company
                </button>
              </form>
            </section>

            <section className="jt-panel">
              <div className="jt-panel__title">Company list</div>
              {filteredCompanies.length === 0 ? (
                <p className="jt-page__subtitle">
                  {companies.length === 0
                    ? "No companies yet."
                    : "No companies match the current filters."}
                </p>
              ) : (
                <div className="jt-grid">
                  {filteredCompanies.map((company, index) => {
                    const isEditing = editingId === company.id;
                    return (
                      <div
                        key={company.id}
                        className={`jt-item-card jt-item-card--${
                          cardTones[index % cardTones.length]
                        }`}
                        style={{ animationDelay: `${0.05 * index}s` }}
                      >
                        <div className="jt-item-card__head">
                          <div>
                            <div className="jt-item-card__title">
                              {company.name}
                            </div>
                            <div className="jt-item-card__meta">
                              {company.location || "No location"}
                            </div>
                          </div>
                          <div className="jt-row">
                            <button
                              type="button"
                              className="jt-button jt-button--outline jt-button--sm"
                              onClick={() => startEdit(company)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="jt-button jt-button--outline jt-button--sm"
                              onClick={() => handleDelete(company.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        {company.website ? (
                          <div className="jt-item-card__meta">
                            Website: {company.website}
                          </div>
                        ) : null}

                        {isEditing ? (
                          <form className="jt-form" onSubmit={handleUpdate}>
                            <label className="jt-field">
                              Name
                              <input
                                className="jt-input"
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
                            <label className="jt-field">
                              Location
                              <input
                                className="jt-input"
                                value={editForm.location}
                                onChange={(event) =>
                                  setEditForm((prev) => ({
                                    ...prev,
                                    location: event.target.value,
                                  }))
                                }
                              />
                            </label>
                            <label className="jt-field">
                              Website
                              <input
                                className="jt-input"
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
