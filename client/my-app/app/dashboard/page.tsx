"use client";

import { useEffect, useState } from "react";
import AppShell from "@/app/components/AppShell";
import RequireAuth from "@/app/components/RequireAuth";
import { AnalyticsStats, getAnalytics } from "@/app/lib/api";

export default function DashboardPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getAnalytics();
        setStats(data);
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

  return (
    <RequireAuth>
      <AppShell>
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          {loading ? <p className="text-sm">Loading...</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {!loading && stats ? (
            <div className="grid gap-6">
              <div className="rounded-md border border-zinc-200 p-4">
                <div className="text-sm text-zinc-600">Total applications</div>
                <div className="text-2xl font-semibold">
                  {stats.totalApplications}
                </div>
              </div>
              <div className="rounded-md border border-zinc-200 p-4">
                <h2 className="text-sm font-semibold">By stage</h2>
                <ul className="mt-2 text-sm text-zinc-600">
                  {stats.applicationsByStage.map((stage) => (
                    <li key={stage.name}>
                      {stage.name}: {stage.count}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-zinc-200 p-4">
                <h2 className="text-sm font-semibold">Top companies</h2>
                <ul className="mt-2 text-sm text-zinc-600">
                  {stats.applicationsByCompany.map((company) => (
                    <li key={company.name}>
                      {company.name}: {company.count}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </div>
      </AppShell>
    </RequireAuth>
  );
}
