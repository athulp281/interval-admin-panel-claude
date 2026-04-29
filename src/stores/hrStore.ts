import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { hrApi } from "@/modules/hr/api";
import type { ApiError } from "@/modules/auth/api/types";
import type {
  DepartmentHierarchy,
  Employee,
  EmployeeListFilters,
  EmployeeListResponse,
  KpiSnapshot,
  Pagination,
} from "@/modules/hr/api/types";

interface HrState {
  /** KPI counts (date-scoped). */
  kpi: KpiSnapshot | null;
  kpiLoading: boolean;
  kpiError: ApiError | null;

  /** Department + wings hierarchy. */
  hierarchy: DepartmentHierarchy | null;
  hierarchyLoading: boolean;
  hierarchyError: ApiError | null;

  /** Currently-open employees drill-down (paginated). */
  employees: EmployeeListResponse | null;
  employeesLoading: boolean;
  employeesError: ApiError | null;
  /** Last filter set; lets the page issue Refresh / page-change easily. */
  employeesFilters: EmployeeListFilters;
  employeesPagination: Pagination;

  /** OGD wings flow — non-paginated. */
  employeesUnderHead: Employee[] | null;
  employeesUnderHeadLoading: boolean;
}

interface HrActions {
  fetchKpi: (date: string, opts?: { force?: boolean }) => Promise<void>;
  fetchHierarchy: (opts?: { force?: boolean }) => Promise<void>;
  fetchEmployees: (filters: EmployeeListFilters, pagination: Pagination) => Promise<void>;
  fetchEmployeesUnderHead: (headId: string) => Promise<void>;
  resetEmployees: () => void;
}

export type HrStore = HrState & HrActions;

const STALE_MS = 60_000;

export const useHrStore = create<HrStore>()(
  devtools(
    immer((set, get) => ({
      kpi: null,
      kpiLoading: false,
      kpiError: null,
      hierarchy: null,
      hierarchyLoading: false,
      hierarchyError: null,
      employees: null,
      employeesLoading: false,
      employeesError: null,
      employeesFilters: {},
      employeesPagination: { page: 1, limit: 12 },
      employeesUnderHead: null,
      employeesUnderHeadLoading: false,

      fetchKpi: async (date, { force = false } = {}) => {
        const { kpi, kpiLoading } = get();
        if (kpiLoading) return;
        if (
          !force &&
          kpi &&
          kpi.date === date &&
          Date.now() - new Date(kpi.generatedAt).getTime() < STALE_MS
        ) {
          return;
        }
        set((s) => {
          s.kpiLoading = true;
          s.kpiError = null;
        });
        try {
          const data = await hrApi.getKpiCounts(date);
          set((s) => {
            s.kpi = data;
            s.kpiLoading = false;
          });
        } catch (err) {
          set((s) => {
            s.kpiError = err as ApiError;
            s.kpiLoading = false;
          });
        }
      },

      fetchHierarchy: async ({ force = false } = {}) => {
        const { hierarchy, hierarchyLoading } = get();
        if (hierarchyLoading) return;
        if (
          !force &&
          hierarchy &&
          Date.now() - new Date(hierarchy.generatedAt).getTime() < STALE_MS
        ) {
          return;
        }
        set((s) => {
          s.hierarchyLoading = true;
          s.hierarchyError = null;
        });
        try {
          const data = await hrApi.getDepartmentHierarchy();
          set((s) => {
            s.hierarchy = data;
            s.hierarchyLoading = false;
          });
        } catch (err) {
          set((s) => {
            s.hierarchyError = err as ApiError;
            s.hierarchyLoading = false;
          });
        }
      },

      fetchEmployees: async (filters, pagination) => {
        set((s) => {
          s.employeesLoading = true;
          s.employeesError = null;
          s.employeesFilters = filters;
          s.employeesPagination = pagination;
        });
        try {
          const data = await hrApi.listEmployees(filters, pagination);
          set((s) => {
            s.employees = data;
            s.employeesLoading = false;
          });
        } catch (err) {
          set((s) => {
            s.employeesError = err as ApiError;
            s.employeesLoading = false;
          });
        }
      },

      fetchEmployeesUnderHead: async (headId) => {
        set((s) => {
          s.employeesUnderHeadLoading = true;
        });
        try {
          const { employees } = await hrApi.listEmployeesUnderHead(headId);
          set((s) => {
            s.employeesUnderHead = employees;
            s.employeesUnderHeadLoading = false;
          });
        } catch {
          set((s) => {
            s.employeesUnderHead = [];
            s.employeesUnderHeadLoading = false;
          });
        }
      },

      resetEmployees: () =>
        set((s) => {
          s.employees = null;
          s.employeesError = null;
          s.employeesFilters = {};
          s.employeesPagination = { page: 1, limit: 12 };
          s.employeesUnderHead = null;
        }),
    })),
    { name: "HrStore" }
  )
);

/* -------- Selectors -------- */
export const useKpi = () => useHrStore((s) => s.kpi);
export const useKpiLoading = () => useHrStore((s) => s.kpiLoading);
export const useKpiError = () => useHrStore((s) => s.kpiError);
export const useHierarchy = () => useHrStore((s) => s.hierarchy);
export const useHierarchyLoading = () => useHrStore((s) => s.hierarchyLoading);
