import type { ReactNode } from "react";

interface StatGroupProps {
  title: string;
  children: ReactNode;
}

export default function StatGroup({ title, children }: StatGroupProps) {
  return (
    <section>
      <h2 className="mb-3 text-base font-semibold text-gray-800 dark:text-white/90">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}
