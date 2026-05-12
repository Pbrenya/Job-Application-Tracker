"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/app/components/AppShell";
import RequireAuth from "@/app/components/RequireAuth";
import { useFilters } from "@/app/components/FiltersContext";
import { Application, Company, getApplications, getCompanies } from "@/app/lib/api";
import { applyApplicationFilters, buildAnalyticsStats } from "@/app/lib/filters";

export default function AnalyticsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { filters } = useFilters();

  useEffect(() => {
    const loadStats = async () => {
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
          err instanceof Error ? err.message : "Unable to load analytics."
        );
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const filteredApplications = useMemo(
    () => applyApplicationFilters(applications, companies, filters),
    [applications, companies, filters]
  );

  const stats = useMemo(
    () => buildAnalyticsStats(filteredApplications, companies),
    [filteredApplications, companies]
  );

  return (
    <RequireAuth>
      <AppShell fullBleed>
        <div className="jt-page">
          <div className="jt-page__head">
            <div>
              <h1>Analytics</h1>
              <p className="jt-page__subtitle">
                See how your applications move through stages.
              </p>
            </div>
          </div>
          {loading ? <p className="jt-page__subtitle">Loading...</p> : null}
          {error ? <p className="jt-alert jt-alert--error">{error}</p> : null}
          {!loading ? (
            <div className="jt-grid jt-grid--3">
              <div className="jt-card jt-card--mint">
                <div className="jt-card__title">Applications by stage</div>
                <div className="jt-list">
                  {stats.applicationsByStage.map((stage) => (
                    <div key={stage.name}>
                      {stage.name}: {stage.count}
                    </div>
                  ))}
                </div>
              </div>
              <div className="jt-card jt-card--lavender">
                <div className="jt-card__title">Applications by company</div>
                <div className="jt-list">
                  {stats.applicationsByCompany.map((company) => (
                    <div key={company.name}>
                      {company.name}: {company.count}
                    </div>
                  ))}
                </div>
              </div>
              <div className="jt-card jt-card--peach">
                <div className="jt-card__title">Applications over time</div>
                <div className="jt-list">
                  {stats.applicationsOverTime.map((month) => (
                    <div key={month.month}>
                      {month.month}: {month.count}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
