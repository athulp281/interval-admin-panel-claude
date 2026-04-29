import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { useHrStore } from "@/stores/hrStore";
import EmployeeAvatarCard from "../components/EmployeeAvatarCard";
import type { EmployeeListFilters, EmployeeStatKey } from "../api/types";

interface LocationState {
  filters?: EmployeeListFilters;
  from?: EmployeeStatKey;
}

const PAGE_SIZE = 24;

const FROM_LABEL: Record<EmployeeStatKey, string> = {
  total: "Total Employees",
  interval: "Interval Employees",
  magic_lamp: "Magic Lamp Employees",
  skillx: "SkillX Employees",
  male: "Male Employees",
  female: "Female Employees",
  permanent: "Permanent Employees",
  post_working: "Post Working Employees",
  notice_period: "Notice Period Employees",
  probation: "Probation Employees",
  long_leave: "Long Leave Employees",
  resigned: "Resigned Employees",
  today_present: "Today Present",
  today_leave: "Today Leave",
  today_work_from_home: "Today Work From Home",
  lunch_count: "Lunch Count",
  evening_food_count: "Evening Food Count",
};

export default function EmployeesPage() {
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const filters = state.filters ?? {};
  const heading = state.from ? FROM_LABEL[state.from] : "Employees";

  const fetchEmployees = useHrStore((s) => s.fetchEmployees);
  const employees = useHrStore((s) => s.employees);
  const isLoading = useHrStore((s) => s.employeesLoading);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEmployees({ ...filters, search: search || undefined }, { page, limit: PAGE_SIZE });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, JSON.stringify(filters)]);

  const meta = employees?.meta;
  const list = employees?.employees ?? [];

  const filterChips = Object.entries(filters)
    .flatMap(([k, v]) => {
      if (Array.isArray(v)) return v.map((val) => `${k}: ${val}`);
      if (v === undefined || v === null) return [];
      return [`${k}: ${v}`];
    });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to="/hr/employee-analytics"
            className="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400"
          >
            ← Back to analytics
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {heading}
          </h1>
          {meta && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {meta.totalCount.toLocaleString()} employees match the current filter
            </p>
          )}
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Search by name or email…"
          className="h-10 w-full max-w-xs rounded-lg border border-gray-300 bg-white px-3.5 text-sm shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
        />
      </header>

      {filterChips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterChips.map((c) => (
            <span
              key={c}
              className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
            >
              {c}
            </span>
          ))}
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800/50"
            />
          ))}
        </div>
      )}

      {!isLoading && list.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400">
          No employees match these filters.
        </div>
      )}

      {!isLoading && list.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {list.map((e) => (
              <EmployeeAvatarCard key={e.id} employee={e} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-gray-800">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {meta.page} of {meta.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!meta.hasPrevPage}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={!meta.hasNextPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
