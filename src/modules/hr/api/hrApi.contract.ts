import type {
  DepartmentHierarchy,
  Employee,
  EmployeeListFilters,
  EmployeeListResponse,
  KpiSnapshot,
  Pagination,
} from "./types";

export interface HrApi {
  /** KPI counts scoped to a specific date (YYYY-MM-DD). */
  getKpiCounts(date: string): Promise<KpiSnapshot>;

  /** Department + wings hierarchy (not date-scoped). */
  getDepartmentHierarchy(): Promise<DepartmentHierarchy>;

  /** Paginated employees with arbitrary filter combinations. */
  listEmployees(
    filters: EmployeeListFilters,
    pagination: Pagination
  ): Promise<EmployeeListResponse>;

  /**
   * Non-paginated employees reporting to a specific head id. Used for the
   * OGD wings flow where wings are addressed by head, not by name.
   */
  listEmployeesUnderHead(headId: string): Promise<{ employees: Employee[] }>;
}
