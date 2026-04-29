/**
 * HR module wire types. Keep in lockstep with `docs/hr-api.md`.
 */

export interface EmployeeStat {
  key: EmployeeStatKey;
  title: string;
  count: number;
}

export type EmployeeStatKey =
  | "total"
  | "interval"
  | "magic_lamp"
  | "skillx"
  | "male"
  | "female"
  | "permanent"
  | "post_working"
  | "notice_period"
  | "probation"
  | "long_leave"
  | "resigned"
  | "today_present"
  | "today_leave"
  | "today_work_from_home"
  | "lunch_count"
  | "evening_food_count";

export interface Wing {
  /** Stable wing id; used as React key + for OGD employees-under-head lookup. */
  headId: string;
  wingName: string;
  wingHead: string;
  count: number;
}

export interface DepartmentNode {
  id: string;
  department: string;
  /** Reporting head's display name. */
  manager: string;
  /** User id of the reporting head — used for "employees under head" lookup. */
  managerId: string;
  count: number;
  wings: Wing[];
  /**
   * Some departments (e.g. OGD) have wings whose employees are queried by
   * head id rather than by department/wing name. The flag tells the frontend
   * to use the head-id endpoint instead of the filter-paginated one.
   */
  wingsUseHeadIdLookup: boolean;
}

export interface KpiSnapshot {
  /** YYYY-MM-DD this snapshot was scoped to. */
  date: string;
  stats: EmployeeStat[];
  generatedAt: string;
}

export interface DepartmentHierarchy {
  departments: DepartmentNode[];
  generatedAt: string;
}

/* -------- Employees list (drill-down from KPI clicks + department modals) -------- */

export interface Employee {
  /** Stable user id. */
  id: string;
  name: string;
  /** Photo asset id; the frontend builds the URL. */
  photo: string | null;
  email?: string;
  department?: string;
  designation?: string;
  employmentType?: string;
  status?: string;
}

export interface EmployeeListFilters {
  search?: string;
  /** Department display names. */
  departmentFilter?: string[];
  /** Display names to *exclude* (used for "Interval Employees" → exclude SkillX/MagicLamp). */
  excludeDeptNames?: string[];
  wingFilter?: string[];
  reportingHeadFilter?: string[];
  genderFilter?: ("Male" | "Female")[];
  employmentTypeFilter?: string[];
  employeeStatusFilter?: string[];
  attendanceFilter?: string[];
  leaveFilter?: string[];
  /** 1 = lunch, 2 = evening food. Surfaces lunch/evening-food drill-downs. */
  foodCategoryFilter?: 1 | 2;
  fromDate?: string;
  toDate?: string;
}

export interface Pagination {
  page: number;
  limit: number;
}

export interface PageMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface EmployeeListResponse {
  employees: Employee[];
  meta: PageMeta;
}
