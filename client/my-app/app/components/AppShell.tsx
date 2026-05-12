"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/app/lib/auth";
import { useFilters } from "@/app/components/FiltersContext";
import { STAGE_OPTIONS } from "@/app/lib/filters";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/applications", label: "Applications" },
  { href: "/companies", label: "Companies" },
  { href: "/analytics", label: "Analytics" },
];

export default function AppShell({
  children,
  fullBleed = false,
  showFilters = true,
}: {
  children: React.ReactNode;
  fullBleed?: boolean;
  showFilters?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { filters, setFilters, resetFilters } = useFilters();

  const activeFilters = [
    { label: "Role", value: filters.role.trim() },
    { label: "Location", value: filters.location.trim() },
    {
      label: "Experience",
      value: filters.stageId
        ? STAGE_OPTIONS.find((option) => option.value === filters.stageId)
            ?.label ?? ""
        : "",
    },
    {
      label: "Month",
      value: filters.month.trim(),
    },
    {
      label: "Salary",
      value: formatSalary(filters.salaryMin, filters.salaryMax),
    },
  ].filter((item) => item.value);

  const salaryMaxValue = Number(filters.salaryMax);
  const salaryRangeValue = Number.isNaN(salaryMaxValue)
    ? 20000
    : salaryMaxValue;

  const handleLogout = () => {
    clearToken();
    router.replace("/login");
  };

  return (
    <div className={`jt-app ${fullBleed ? "jt-app--full" : ""}`.trim()}>
      <div className="jt-backdrop" aria-hidden="true" />
      <div className="jt-shell">
        <header className="jt-topbar">
          <div className="jt-brand">
            <span className="jt-logo" />
            Job Application Tracker
          </div>
          <nav className="jt-nav">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`jt-nav__item ${isActive ? "is-active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="jt-actions">
            <span className="jt-location">New York, NY</span>
            <button type="button" className="jt-icon" aria-label="Notifications">
              <span className="jt-icon__dot" />
            </button>
            <button type="button" className="jt-icon" aria-label="Settings">
              <span className="jt-icon__dot" />
            </button>
            <div className="jt-avatar" />
            <button type="button" className="jt-ghost" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </header>
        {showFilters ? (
          <section className="jt-filterbar" aria-label="Quick filters">
            <label className="jt-filter">
              <span className="jt-filter-icon" />
              <span className="jt-filter__field">
                <span className="jt-filter__label">Role focus</span>
                <input
                  type="text"
                  value={filters.role}
                  placeholder="Designer"
                  onChange={(event) =>
                    setFilters({ role: event.target.value })
                  }
                />
              </span>
              <span className="jt-chevron" />
            </label>
            <label className="jt-filter">
              <span className="jt-filter-icon" />
              <span className="jt-filter__field">
                <span className="jt-filter__label">Work location</span>
                <input
                  type="text"
                  value={filters.location}
                  placeholder="Remote"
                  onChange={(event) =>
                    setFilters({ location: event.target.value })
                  }
                />
              </span>
              <span className="jt-chevron" />
            </label>
            <label className="jt-filter">
              <span className="jt-filter-icon" />
              <span className="jt-filter__field">
                <span className="jt-filter__label">Experience</span>
                <select
                  value={filters.stageId}
                  onChange={(event) =>
                    setFilters({ stageId: event.target.value })
                  }
                >
                  {STAGE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </span>
              <span className="jt-chevron" />
            </label>
            <label className="jt-filter">
              <span className="jt-filter-icon" />
              <span className="jt-filter__field">
                <span className="jt-filter__label">Per month</span>
                <input
                  type="month"
                  value={filters.month}
                  onChange={(event) =>
                    setFilters({ month: event.target.value })
                  }
                />
              </span>
              <span className="jt-chevron" />
            </label>
            <div className="jt-salary">
              <div className="jt-salary-head">
                <span>Salary range</span>
                <button
                  type="button"
                  className="jt-salary-reset"
                  onClick={() =>
                    setFilters({ salaryMin: "", salaryMax: "" })
                  }
                >
                  Reset
                </button>
              </div>
              <div className="jt-salary-inputs">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Min"
                  value={filters.salaryMin}
                  onChange={(event) =>
                    setFilters({ salaryMin: event.target.value })
                  }
                />
                <span>to</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Max"
                  value={filters.salaryMax}
                  onChange={(event) =>
                    setFilters({ salaryMax: event.target.value })
                  }
                />
              </div>
              <input
                type="range"
                min="0"
                max="200000"
                value={filters.salaryMax === "" ? 20000 : salaryRangeValue}
                onChange={(event) =>
                  setFilters({ salaryMax: event.target.value })
                }
              />
            </div>
          </section>
        ) : null}
        <main className={`jt-main ${showFilters ? "" : "jt-main--wide"}`}>
          {showFilters ? (
            <aside className="jt-sidebar">
              <div className="jt-promo">
                <p>Get your best profession with LuckyJob</p>
                <button type="button">Learn more</button>
              </div>
              <div className="jt-filters-panel">
                <div className="jt-filters-title">Active filters</div>
                {activeFilters.length === 0 ? (
                  <p className="jt-page__subtitle">No filters applied.</p>
                ) : (
                  <div className="jt-chip-group">
                    {activeFilters.map((filter) => (
                      <span key={filter.label} className="jt-chip">
                        {filter.label}: {filter.value}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  className="jt-button jt-button--outline"
                  onClick={resetFilters}
                >
                  Clear filters
                </button>
              </div>
            </aside>
          ) : null}
          <section className="jt-workspace">{children}</section>
        </main>
      </div>
    </div>
  );
}

const formatSalary = (minValue: string, maxValue: string) => {
  const min = minValue.trim();
  const max = maxValue.trim();

  if (min && max) {
    return `$${min} - $${max}`;
  }
  if (min) {
    return `From $${min}`;
  }
  if (max) {
    return `Up to $${max}`;
  }
  return "";
};
