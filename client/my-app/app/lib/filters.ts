import type { AnalyticsStats, Application, Company } from "@/app/lib/api";

export type FilterState = {
  role: string;
  location: string;
  stageId: string;
  month: string;
  salaryMin: string;
  salaryMax: string;
};

const STAGES = [
  "Applied",
  "Screening",
  "Interview",
  "Offer",
  "Rejected",
  "Hired",
];

export const STAGE_OPTIONS = [
  { value: "", label: "Any stage" },
  ...STAGES.map((label, index) => ({
    value: String(index + 1),
    label,
  })),
];

const normalize = (value: string) => value.toLowerCase();

const matchesText = (value: string, query: string) =>
  normalize(value).includes(normalize(query));

const getMonthKey = (value?: string | null) => {
  if (!value) {
    return "";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return parsed.toISOString().slice(0, 7);
};

const getStageLabel = (stageId: number) =>
  STAGES[stageId - 1] ?? `Stage ${stageId}`;

export const applyApplicationFilters = (
  applications: Application[],
  companies: Company[],
  filters: FilterState
) => {
  const locationByCompany = new Map(
    companies.map((company) => [company.id, company.location ?? ""])
  );

  return applications.filter((application) => {
    if (filters.role.trim()) {
      const title = application.job_title ?? "";
      if (!matchesText(title, filters.role.trim())) {
        return false;
      }
    }

    if (filters.location.trim()) {
      const location = locationByCompany.get(application.company_id) ?? "";
      if (!matchesText(location, filters.location.trim())) {
        return false;
      }
    }

    if (filters.stageId.trim()) {
      const stageId = Number(filters.stageId);
      if (!Number.isNaN(stageId) && application.stage_id !== stageId) {
        return false;
      }
    }

    if (filters.month.trim()) {
      const monthKey = getMonthKey(application.applied_at ?? undefined);
      if (monthKey !== filters.month.trim()) {
        return false;
      }
    }

    const hasMin = filters.salaryMin.trim() !== "";
    const hasMax = filters.salaryMax.trim() !== "";
    if (hasMin || hasMax) {
      const minValue = hasMin ? Number(filters.salaryMin) : Number.NEGATIVE_INFINITY;
      const maxValue = hasMax ? Number(filters.salaryMax) : Number.POSITIVE_INFINITY;

      if (Number.isNaN(minValue) || Number.isNaN(maxValue)) {
        return false;
      }

      if (application.salary_min == null || application.salary_max == null) {
        return false;
      }

      if (application.salary_min < minValue || application.salary_max > maxValue) {
        return false;
      }
    }

    return true;
  });
};

export const applyCompanyFilters = (
  companies: Company[],
  filters: FilterState
) =>
  companies.filter((company) => {
    if (filters.role.trim()) {
      if (!matchesText(company.name ?? "", filters.role.trim())) {
        return false;
      }
    }

    if (filters.location.trim()) {
      if (!matchesText(company.location ?? "", filters.location.trim())) {
        return false;
      }
    }

    return true;
  });

export const buildAnalyticsStats = (
  applications: Application[],
  companies: Company[]
): AnalyticsStats => {
  const totalApplications = applications.length;

  const stageCounts = new Map<string, number>();
  STAGES.forEach((stage) => stageCounts.set(stage, 0));

  const companyNameById = new Map(
    companies.map((company) => [company.id, company.name])
  );
  const companyCounts = new Map<string, number>();
  const monthCounts = new Map<string, number>();

  applications.forEach((application) => {
    const stageLabel = getStageLabel(application.stage_id);
    stageCounts.set(stageLabel, (stageCounts.get(stageLabel) ?? 0) + 1);

    const companyName =
      companyNameById.get(application.company_id) ?? "Unknown company";
    companyCounts.set(companyName, (companyCounts.get(companyName) ?? 0) + 1);

    const monthKey = getMonthKey(application.applied_at ?? undefined);
    if (monthKey) {
      monthCounts.set(monthKey, (monthCounts.get(monthKey) ?? 0) + 1);
    }
  });

  const applicationsByStage = Array.from(stageCounts.entries()).map(
    ([name, count]) => ({ name, count })
  );

  const applicationsByCompany = Array.from(companyCounts.entries()).map(
    ([name, count]) => ({ name, count })
  );

  const applicationsOverTime = Array.from(monthCounts.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  return {
    totalApplications,
    applicationsByStage,
    applicationsByCompany,
    applicationsOverTime,
  };
};
