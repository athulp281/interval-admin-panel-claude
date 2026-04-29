import type { EmployeeListFilters, EmployeeStatKey } from "../api/types";

export interface KpiClickTarget {
  /** Route path; the destination page reads `state.filters` from `useLocation`. */
  path: string;
  state: { filters: EmployeeListFilters; from: EmployeeStatKey };
}

/**
 * Maps a stat key to the destination route + filter set when the user clicks
 * the corresponding KPI card. Ported verbatim from the old project's
 * `clickFunction` switch.
 */
export function kpiClickTarget(key: EmployeeStatKey): KpiClickTarget | null {
  const employees = "/hr/employees";
  switch (key) {
    case "total":
      return { path: employees, state: { filters: {}, from: key } };
    case "interval":
      return {
        path: employees,
        state: {
          filters: { excludeDeptNames: ["SkillX", "MAGIC LAMP(D2C)", "Skillx"] },
          from: key,
        },
      };
    case "magic_lamp":
      return {
        path: employees,
        state: { filters: { departmentFilter: ["MAGIC LAMP(D2C)"] }, from: key },
      };
    case "skillx":
      return {
        path: employees,
        state: { filters: { departmentFilter: ["SkillX"] }, from: key },
      };
    case "male":
      return {
        path: employees,
        state: { filters: { genderFilter: ["Male"] }, from: key },
      };
    case "female":
      return {
        path: employees,
        state: { filters: { genderFilter: ["Female"] }, from: key },
      };
    case "permanent":
      return {
        path: employees,
        state: { filters: { employmentTypeFilter: ["Permanent"] }, from: key },
      };
    case "notice_period":
      return {
        path: employees,
        state: { filters: { employmentTypeFilter: ["Notice Period"] }, from: key },
      };
    case "probation":
      return {
        path: employees,
        state: { filters: { employmentTypeFilter: ["Probation"] }, from: key },
      };
    case "long_leave":
      return {
        path: employees,
        state: { filters: { employeeStatusFilter: ["Long Leave"] }, from: key },
      };
    case "resigned":
      return {
        path: employees,
        state: { filters: { employeeStatusFilter: ["Resigned"] }, from: key },
      };
    case "today_present":
      return {
        path: employees,
        state: { filters: { attendanceFilter: ["Present Marked"] }, from: key },
      };
    case "today_leave":
      return {
        path: employees,
        state: {
          filters: {
            leaveFilter: [
              "Compensatory Off",
              "Leave-Casual Leave",
              "Leave-Sick Leave",
              "Leave-Paid Leave",
              "Leave-Maternity Leave",
              "Leave Without Pay",
              "Leave-Dot Leave",
              "Leave-Earned Leave",
            ],
            genderFilter: ["Male", "Female"],
          },
          from: key,
        },
      };
    case "today_work_from_home":
      return {
        path: employees,
        state: { filters: { leaveFilter: ["Work From Home (WFH)"] }, from: key },
      };
    case "lunch_count":
      return {
        path: employees,
        state: { filters: { foodCategoryFilter: 1 }, from: key },
      };
    case "evening_food_count":
      return {
        path: employees,
        state: { filters: { foodCategoryFilter: 2 }, from: key },
      };
    case "post_working":
      return {
        path: "/hr/post-working",
        state: { filters: {}, from: key },
      };
    default:
      return null;
  }
}
