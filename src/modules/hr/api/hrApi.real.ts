import { api } from "@/lib/apiCall";
import type { HrApi } from "./hrApi.contract";
import type {
  DepartmentHierarchy,
  Employee,
  EmployeeListFilters,
  EmployeeListResponse,
  KpiSnapshot,
  Pagination,
} from "./types";

/**
 * Builds the query string for `listEmployees`. Mirrors the filter shape the
 * old project used, but with cleaner camelCase keys; see `docs/hr-api.md` for
 * the exact contract the backend should honor.
 */
function buildEmployeesQuery(filters: EmployeeListFilters, pagination: Pagination): string {
  const p = new URLSearchParams();
  p.set("page", String(pagination.page));
  p.set("limit", String(pagination.limit));
  if (filters.search) p.set("search", filters.search);

  const arrayParam = (key: string, values?: string[]) => {
    if (values && values.length) p.set(key, values.join(","));
  };
  arrayParam("department", filters.departmentFilter);
  arrayParam("excludeDept", filters.excludeDeptNames);
  arrayParam("wing", filters.wingFilter);
  arrayParam("reportingHead", filters.reportingHeadFilter);
  arrayParam("gender", filters.genderFilter);
  arrayParam("employmentType", filters.employmentTypeFilter);
  arrayParam("employeeStatus", filters.employeeStatusFilter);
  arrayParam("attendance", filters.attendanceFilter);
  arrayParam("leave", filters.leaveFilter);
  if (filters.foodCategoryFilter !== undefined) {
    p.set("foodCategory", String(filters.foodCategoryFilter));
  }
  if (filters.fromDate) p.set("fromDate", filters.fromDate);
  if (filters.toDate) p.set("toDate", filters.toDate);

  return p.toString();
}

export const hrApiReal: HrApi = {
  getKpiCounts: (date: string) => api.get<KpiSnapshot>(`/hr/analytics/basic-counts/${date}`),

  getDepartmentHierarchy: () => api.get<DepartmentHierarchy>("/hr/analytics/dept-counts"),

  listEmployees: (filters, pagination) =>
    api.get<EmployeeListResponse>(`/hr/employees?${buildEmployeesQuery(filters, pagination)}`),

  listEmployeesUnderHead: (headId: string) =>
    api.get<{ employees: Employee[] }>(`/hr/employees/under-head/${headId}`),
};
