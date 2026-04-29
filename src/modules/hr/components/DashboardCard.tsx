import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export default function DashboardCard({
  title,
  subtitle,
  action,
  className = "",
  children,
}: DashboardCardProps) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
