import type { EmployeeStat, EmployeeStatKey } from "../api/types";

export function getStat(stats: EmployeeStat[], key: EmployeeStatKey): EmployeeStat | undefined {
  return stats.find((s) => s.key === key);
}

export function getCount(stats: EmployeeStat[], key: EmployeeStatKey, fallback = 0): number {
  return getStat(stats, key)?.count ?? fallback;
}

export function pct(numerator: number, denominator: number): number {
  if (!denominator) return 0;
  return (numerator / denominator) * 100;
}

export function formatPct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}
