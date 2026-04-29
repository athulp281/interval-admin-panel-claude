import { useEffect } from "react";
import {
  useHierarchy,
  useHierarchyLoading,
  useHrStore,
  useKpi,
  useKpiError,
  useKpiLoading,
} from "@/stores/hrStore";
import DepartmentTable from "../components/DepartmentTable";
import HeroKpis from "../components/HeroKpis";
import StatCard from "../components/StatCard";
import StatGroup from "../components/StatGroup";
import AttendanceTodayChart from "../components/charts/AttendanceTodayChart";
import BrandDistributionChart from "../components/charts/BrandDistributionChart";
import DepartmentBarChart from "../components/charts/DepartmentBarChart";
import GenderSplitChart from "../components/charts/GenderSplitChart";
import LifecycleChart from "../components/charts/LifecycleChart";
import MealsCard from "../components/charts/MealsCard";
import type { EmployeeStat, EmployeeStatKey } from "../api/types";

const GROUPS: { title: string; keys: EmployeeStatKey[] }[] = [
  {
    title: "Workforce by Brand",
    keys: ["total", "interval", "magic_lamp", "skillx"],
  },
  {
    title: "Demographics & Employment Type",
    keys: ["male", "female", "permanent", "post_working"],
  },
  {
    title: "Lifecycle",
    keys: ["notice_period", "probation", "long_leave", "resigned"],
  },
  {
    title: "Today's Attendance",
    keys: ["today_present", "today_leave", "today_work_from_home", "lunch_count"],
  },
  {
    title: "Hospitality",
    keys: ["evening_food_count"],
  },
];

function pickStats(stats: EmployeeStat[], keys: EmployeeStatKey[]): EmployeeStat[] {
  const map = new Map(stats.map((s) => [s.key, s]));
  return keys.map((k) => map.get(k)).filter((s): s is EmployeeStat => Boolean(s));
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function EmployeeAnalyticsPage() {
  const fetchKpi = useHrStore((s) => s.fetchKpi);
  const fetchHierarchy = useHrStore((s) => s.fetchHierarchy);
  const kpi = useKpi();
  const hierarchy = useHierarchy();
  const isKpiLoading = useKpiLoading();
  const isHierarchyLoading = useHierarchyLoading();
  const error = useKpiError();

  useEffect(() => {
    fetchKpi(todayIso());
    fetchHierarchy();
  }, [fetchKpi, fetchHierarchy]);

  const isFirstLoad = !kpi && !hierarchy && (isKpiLoading || isHierarchyLoading);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
            Employee Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Live snapshot for {kpi?.date ?? todayIso()} · click any KPI for the full list.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {kpi && (
            <span className="text-gray-500 dark:text-gray-400">
              Updated {new Date(kpi.generatedAt).toLocaleTimeString()}
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              fetchKpi(todayIso(), { force: true });
              fetchHierarchy({ force: true });
            }}
            disabled={isKpiLoading || isHierarchyLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.04]"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isKpiLoading || isHierarchyLoading
                  ? "bg-warning-500 animate-pulse"
                  : "bg-success-500"
              }`}
              aria-hidden="true"
            />
            {isKpiLoading || isHierarchyLoading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-error-200 bg-error-50 px-4 py-3 text-sm text-error-700 dark:border-error-500/40 dark:bg-error-500/10 dark:text-error-400"
        >
          {error.message}
        </div>
      )}

      {isFirstLoad && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-800/50"
              />
            ))}
          </div>
        </div>
      )}

      {kpi && (
        <>
          <HeroKpis stats={kpi.stats} />

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 lg:col-span-5">
              <AttendanceTodayChart stats={kpi.stats} />
            </div>
            <div className="col-span-12 sm:col-span-6 lg:col-span-4">
              <BrandDistributionChart stats={kpi.stats} />
            </div>
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <GenderSplitChart stats={kpi.stats} />
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 md:gap-6">
            <div className="col-span-12 lg:col-span-8">
              <LifecycleChart stats={kpi.stats} />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <MealsCard stats={kpi.stats} />
            </div>
          </div>

          {/* All KPIs as clickable cards (drill-down to filtered employee list) */}
          <div className="space-y-8">
            {GROUPS.map((group) => {
              const items = pickStats(kpi.stats, group.keys);
              if (items.length === 0) return null;
              return (
                <StatGroup key={group.title} title={group.title}>
                  {items.map((stat) => (
                    <StatCard
                      key={stat.key}
                      statKey={stat.key}
                      title={stat.title}
                      count={stat.count}
                    />
                  ))}
                </StatGroup>
              );
            })}
          </div>
        </>
      )}

      {hierarchy && (
        <>
          <DepartmentBarChart departments={hierarchy.departments} />
          <DepartmentTable departments={hierarchy.departments} />
        </>
      )}
    </div>
  );
}
