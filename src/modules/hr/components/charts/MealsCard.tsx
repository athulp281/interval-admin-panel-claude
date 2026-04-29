import type { EmployeeStat } from "../../api/types";
import { formatPct, getCount, pct } from "../../lib/selectStats";
import DashboardCard from "../DashboardCard";

interface Props {
  stats: EmployeeStat[];
}

function MealRow({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const share = pct(count, total);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-800 dark:text-white/90">
            {count.toLocaleString()}
          </span>{" "}
          · {formatPct(share)}
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800" aria-hidden="true">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.min(share, 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function MealsCard({ stats }: Props) {
  const total = getCount(stats, "total");
  const lunch = getCount(stats, "lunch_count");
  const evening = getCount(stats, "evening_food_count");

  return (
    <DashboardCard title="Hospitality Today" subtitle="Meals served / opted in">
      <div className="space-y-5 py-2">
        <MealRow label="Lunch" count={lunch} total={total} color="#fb6514" />
        <MealRow label="Evening Food" count={evening} total={total} color="#9c5fbc" />
        <div className="rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-500 dark:bg-gray-800/50 dark:text-gray-400">
          Capacity reference: <span className="font-semibold">{total.toLocaleString()}</span>{" "}
          total employees.
        </div>
      </div>
    </DashboardCard>
  );
}
