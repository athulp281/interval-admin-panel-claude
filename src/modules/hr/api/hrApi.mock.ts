import type { HrApi } from "./hrApi.contract";
import type {
  DepartmentHierarchy,
  DepartmentNode,
  Employee,
  EmployeeListFilters,
  EmployeeListResponse,
  EmployeeStat,
  KpiSnapshot,
  Pagination,
  Wing,
} from "./types";

const MOCK_LATENCY_MS = 350;

const stats: EmployeeStat[] = [
  { key: "total", title: "Total Employees", count: 372 },
  { key: "interval", title: "Interval Employees", count: 304 },
  { key: "magic_lamp", title: "Magic Lamp Employees", count: 15 },
  { key: "skillx", title: "SkillX Employees", count: 27 },

  { key: "male", title: "Male Employees", count: 81 },
  { key: "female", title: "Female Employees", count: 267 },
  { key: "permanent", title: "Permanent Employees", count: 249 },
  { key: "post_working", title: "Post Working Employees", count: 0 },

  { key: "notice_period", title: "Notice Period Employees", count: 9 },
  { key: "probation", title: "Probation Employees", count: 82 },
  { key: "long_leave", title: "Long Leave Employees", count: 2 },
  { key: "resigned", title: "Resigned Employees", count: 1054 },

  { key: "today_present", title: "Today Present", count: 259 },
  { key: "today_leave", title: "Today Leave", count: 26 },
  { key: "today_work_from_home", title: "Today Work From Home", count: 0 },
  { key: "lunch_count", title: "Lunch Count", count: 170 },

  { key: "evening_food_count", title: "Evening Food Count", count: 0 },
];

const ogdWings: Wing[] = [
  { headId: "h_ogd_1", wingName: "Ventas Squad", wingHead: "VINEETH AP", count: 14 },
  { headId: "h_ogd_2", wingName: "Deal Maestro", wingHead: "ANJU R", count: 21 },
  { headId: "h_ogd_3", wingName: "Goal Setters", wingHead: "RAHUL P", count: 18 },
  { headId: "h_ogd_4", wingName: "ECPC", wingHead: "PRIYA M", count: 12 },
  { headId: "h_ogd_5", wingName: "Chaser Crew", wingHead: "AKHIL T", count: 14 },
];

const technicalWings: Wing[] = [
  { headId: "h_tech_1", wingName: "Frontend Wing", wingHead: "AYESHA P", count: 5 },
  { headId: "h_tech_2", wingName: "Backend Wing", wingHead: "RIYAS K", count: 4 },
  { headId: "h_tech_3", wingName: "QA & DevOps", wingHead: "SAJAD M", count: 3 },
];

const projectClassroomWings: Wing[] = [
  { headId: "h_pc_1", wingName: "Onboarding", wingHead: "FATIMA P", count: 18 },
  { headId: "h_pc_2", wingName: "Live Sessions", wingHead: "NIHAL K", count: 25 },
];

const departments: DepartmentNode[] = [
  {
    id: "top-management",
    department: "Top Management",
    manager: "SANAFIR K",
    managerId: "u_mgr_top",
    count: 8,
    wings: [],
    wingsUseHeadIdLookup: false,
  },
  {
    id: "hr",
    department: "Human Resource (HR)",
    manager: "RASHID AP",
    managerId: "u_mgr_hr",
    count: 13,
    wings: [],
    wingsUseHeadIdLookup: false,
  },
  {
    id: "project-foundation",
    department: "Project-Foundation",
    manager: "JASEEM P",
    managerId: "u_mgr_pf",
    count: 34,
    wings: [],
    wingsUseHeadIdLookup: false,
  },
  {
    id: "marketing",
    department: "Marketing",
    manager: "SUSHANTH KUMAR N",
    managerId: "u_mgr_mkt",
    count: 1,
    wings: [],
    wingsUseHeadIdLookup: false,
  },
  {
    id: "technical",
    department: "Technical Department",
    manager: "SHAHIDA P A",
    managerId: "u_mgr_tech",
    count: 12,
    wings: technicalWings,
    wingsUseHeadIdLookup: false,
  },
  {
    id: "finance",
    department: "Finance",
    manager: "ADEEB NASIR P K",
    managerId: "u_mgr_fin",
    count: 4,
    wings: [],
    wingsUseHeadIdLookup: false,
  },
  {
    id: "creative",
    department: "Creative Department",
    manager: "SHADIN MUBASHIR P",
    managerId: "u_mgr_cre",
    count: 12,
    wings: [],
    wingsUseHeadIdLookup: false,
  },
  {
    id: "ogd",
    department: "Operations Growth Department (OGD)",
    manager: "FAYIS K",
    managerId: "u_mgr_ogd",
    count: 79,
    wings: ogdWings,
    wingsUseHeadIdLookup: true,
  },
  {
    id: "client-service",
    department: "Client Service Department",
    manager: "SARANYA M",
    managerId: "u_mgr_cs",
    count: 23,
    wings: [],
    wingsUseHeadIdLookup: false,
  },
  {
    id: "digital-marketing",
    department: "Digital Marketing Department",
    manager: "VIVEK THANDANKAL",
    managerId: "u_mgr_dm",
    count: 18,
    wings: [],
    wingsUseHeadIdLookup: false,
  },
  {
    id: "gcc",
    department: "GCC",
    manager: "NAVAS KALLADA",
    managerId: "u_mgr_gcc",
    count: 2,
    wings: [],
    wingsUseHeadIdLookup: false,
  },
  {
    id: "project-classroom",
    department: "Project-Classroom",
    manager: "SARATH LAL OP",
    managerId: "u_mgr_pcl",
    count: 43,
    wings: projectClassroomWings,
    wingsUseHeadIdLookup: false,
  },
];

/* -------------------- Mock employee universe -------------------- */

const FIRST_NAMES = [
  "AYESHA",
  "RAHUL",
  "PRIYA",
  "AKHIL",
  "FATIMA",
  "NIHAL",
  "SAJAD",
  "ANJU",
  "VINEETH",
  "RIYAS",
  "MOHAMMED",
  "SREELAKSHMI",
  "ARJUN",
  "DEEPA",
  "HARIS",
  "NEHA",
  "SANDEEP",
  "MEERA",
];
const LAST_NAMES = [
  "P",
  "K",
  "M",
  "AP",
  "MA",
  "PV",
  "TK",
  "C",
  "NK",
  "MS",
  "PT",
  "VP",
];
const GENDERS: ("Male" | "Female")[] = ["Male", "Female"];
const EMPLOYMENT_TYPES = ["Permanent", "Probation", "Notice Period"];
const STATUSES = ["Active", "Long Leave", "Resigned"];

function generateEmployees(): Employee[] {
  const out: Employee[] = [];
  for (let i = 0; i < 380; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 7) % LAST_NAMES.length];
    const dept = departments[i % departments.length];
    const wing = dept.wings[i % Math.max(dept.wings.length, 1)];
    out.push({
      id: `u_emp_${i}`,
      name: `${first} ${last}`,
      photo: null,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@interval.com`,
      department: dept.department,
      designation: wing?.wingName ?? "Staff",
      employmentType: EMPLOYMENT_TYPES[i % EMPLOYMENT_TYPES.length],
      status: STATUSES[i % STATUSES.length],
    });
  }
  return out;
}

const allEmployees = generateEmployees();

function applyFilters(list: Employee[], f: EmployeeListFilters): Employee[] {
  return list.filter((e) => {
    if (f.search) {
      const q = f.search.toLowerCase();
      if (
        !e.name.toLowerCase().includes(q) &&
        !(e.email ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (f.departmentFilter?.length && !f.departmentFilter.includes(e.department ?? "")) {
      return false;
    }
    if (f.excludeDeptNames?.length && f.excludeDeptNames.includes(e.department ?? "")) {
      return false;
    }
    if (f.wingFilter?.length && !f.wingFilter.includes(e.designation ?? "")) {
      return false;
    }
    if (f.employmentTypeFilter?.length && !f.employmentTypeFilter.includes(e.employmentType ?? "")) {
      return false;
    }
    if (f.employeeStatusFilter?.length && !f.employeeStatusFilter.includes(e.status ?? "")) {
      return false;
    }
    return true;
  });
}

/* -------------------- Helpers -------------------- */

function delay<T>(value: T): Promise<T> {
  return new Promise((r) => setTimeout(() => r(value), MOCK_LATENCY_MS));
}

/* -------------------- API surface -------------------- */

export const hrApiMock: HrApi = {
  async getKpiCounts(date: string): Promise<KpiSnapshot> {
    return delay({ date, stats, generatedAt: new Date().toISOString() });
  },

  async getDepartmentHierarchy(): Promise<DepartmentHierarchy> {
    return delay({ departments, generatedAt: new Date().toISOString() });
  },

  async listEmployees(
    filters: EmployeeListFilters,
    pagination: Pagination
  ): Promise<EmployeeListResponse> {
    const filtered = applyFilters(allEmployees, filters);
    const totalCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pagination.limit));
    const page = Math.min(Math.max(1, pagination.page), totalPages);
    const start = (page - 1) * pagination.limit;
    const employees = filtered.slice(start, start + pagination.limit);
    return delay({
      employees,
      meta: {
        page,
        limit: pagination.limit,
        totalCount,
        totalPages,
        hasPrevPage: page > 1,
        hasNextPage: page < totalPages,
      },
    });
  },

  async listEmployeesUnderHead(headId: string): Promise<{ employees: Employee[] }> {
    const wing = departments
      .flatMap((d) => d.wings)
      .find((w) => w.headId === headId);
    if (!wing) return delay({ employees: [] });
    const subset = allEmployees.slice(0, wing.count);
    return delay({ employees: subset });
  },
};
