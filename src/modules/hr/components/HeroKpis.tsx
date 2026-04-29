import type { EmployeeStat } from "../api/types";
import { formatPct, getCount, pct } from "../lib/selectStats";

interface HeroKpisProps {
  stats: EmployeeStat[];
}

interface Tile {
  label: string;
  value: string;
  subtitle: string;
  delta?: { value: string; positive: boolean };
  ring: string;
  ringTrack: string;
  iconBg: string;
}

function HeroTile({ tile }: { tile: Tile }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {tile.label}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-800 dark:text-white/90">
            {tile.value}
          </p>
        </div>
        <span
          className={`inline-flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold ${tile.iconBg}`}
          aria-hidden="true"
        >
          {tile.label.charAt(0)}
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-gray-500 dark:text-gray-400">{tile.subtitle}</span>
        {tile.delta && (
          <span
            className={`inline-flex items-center gap-1 font-medium ${
              tile.delta.positive ? "text-success-600" : "text-error-600"
            }`}
          >
            {tile.delta.positive ? "▲" : "▼"} {tile.delta.value}
          </span>
        )}
      </div>
    </div>
  );
}

export default function HeroKpis({ stats }: HeroKpisProps) {
  const total = getCount(stats, "total");
  const present = getCount(stats, "today_present");
  const leave = getCount(stats, "today_leave");
  const wfh = getCount(stats, "today_work_from_home");
  const probation = getCount(stats, "probation");
  const resigned = getCount(stats, "resigned");
  const male = getCount(stats, "male");
  const female = getCount(stats, "female");

  const presentRate = pct(present + wfh, total);
  const attritionRate = pct(resigned, resigned + total);
  const genderTotal = male + female;
  const femaleShare = pct(female, genderTotal);

  const tiles: Tile[] = [
    {
      label: "Total Headcount",
      value: total.toLocaleString(),
      subtitle: `${probation} on probation`,
      iconBg:
        "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300",
      ring: "",
      ringTrack: "",
    },
    {
      label: "Attendance Today",
      value: formatPct(presentRate, 1),
      subtitle: `${present.toLocaleString()} present · ${leave} on leave`,
      delta: { value: `${(present + wfh).toLocaleString()} active`, positive: true },
      iconBg:
        "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-300",
      ring: "",
      ringTrack: "",
    },
    {
      label: "Female Representation",
      value: formatPct(femaleShare, 1),
      subtitle: `${female.toLocaleString()} of ${genderTotal.toLocaleString()} reporting`,
      iconBg:
        "bg-theme-pink-500/10 text-theme-pink-500 dark:bg-theme-pink-500/15",
      ring: "",
      ringTrack: "",
    },
    {
      label: "Lifetime Attrition",
      value: formatPct(attritionRate, 1),
      subtitle: `${resigned.toLocaleString()} resigned all-time`,
      delta: { value: `${getCount(stats, "notice_period")} on notice`, positive: false },
      iconBg:
        "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-300",
      ring: "",
      ringTrack: "",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tiles.map((t) => (
        <HeroTile key={t.label} tile={t} />
      ))}
    </div>
  );
}
