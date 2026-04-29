import { useNavigate } from "react-router";
import type { EmployeeStatKey } from "../api/types";
import { kpiClickTarget } from "../lib/kpiNavigation";

interface StatCardProps {
  statKey: EmployeeStatKey;
  title: string;
  count: number;
}

const accentByKey: Partial<Record<EmployeeStatKey, string>> = {
  total: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300",
  interval: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300",
  magic_lamp:
    "bg-brand-accent-50 text-brand-accent-600 dark:bg-brand-accent-500/10 dark:text-brand-accent-300",
  skillx:
    "bg-brand-accent-50 text-brand-accent-600 dark:bg-brand-accent-500/10 dark:text-brand-accent-300",
  male: "bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/10 dark:text-blue-light-300",
  female: "bg-theme-pink-500/10 text-theme-pink-500",
  permanent: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300",
  post_working: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  notice_period: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300",
  probation: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300",
  long_leave: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
  resigned: "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-300",
  today_present: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-300",
  today_leave: "bg-warning-50 text-warning-700 dark:bg-warning-500/10 dark:text-warning-300",
  today_work_from_home:
    "bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/10 dark:text-blue-light-300",
  lunch_count: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
  evening_food_count: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

export default function StatCard({ statKey, title, count }: StatCardProps) {
  const navigate = useNavigate();
  const accent =
    accentByKey[statKey] ?? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300";
  const target = kpiClickTarget(statKey);

  const handleClick = () => {
    if (!target) return;
    navigate(target.path, { state: target.state });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!target}
      className="group w-full rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-brand-300 hover:shadow-theme-md disabled:cursor-default disabled:hover:border-gray-200 disabled:hover:shadow-none dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-500/50"
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold ${accent}`}
          aria-hidden="true"
        >
          {title.charAt(0)}
        </span>
        <span className="text-2xl font-bold text-gray-800 dark:text-white/90">
          {count.toLocaleString()}
        </span>
      </div>
      <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      {target && (
        <p className="mt-1 text-[11px] text-gray-400 opacity-0 transition group-hover:opacity-100 dark:text-gray-500">
          Click to view list →
        </p>
      )}
    </button>
  );
}
