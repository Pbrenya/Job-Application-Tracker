"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { FilterState } from "@/app/lib/filters";

const defaultFilters: FilterState = {
  role: "",
  location: "",
  stageId: "",
  month: "",
  salaryMin: "",
  salaryMax: "",
};

type FiltersContextValue = {
  filters: FilterState;
  setFilters: (next: Partial<FilterState>) => void;
  resetFilters: () => void;
};

const FiltersContext = createContext<FiltersContextValue | null>(null);

export const FiltersProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFiltersState] = useState<FilterState>(defaultFilters);

  const setFilters = (next: Partial<FilterState>) => {
    setFiltersState((prev) => ({ ...prev, ...next }));
  };

  const resetFilters = () => {
    setFiltersState(defaultFilters);
  };

  const value = useMemo(
    () => ({ filters, setFilters, resetFilters }),
    [filters]
  );

  return (
    <FiltersContext.Provider value={value}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error("useFilters must be used within FiltersProvider");
  }
  return context;
};
