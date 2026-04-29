import { useState } from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";
import type { DepartmentNode } from "../api/types";
import EmployeesModal from "./EmployeesModal";
import WingsModal from "./WingsModal";

interface DepartmentTableProps {
  departments: DepartmentNode[];
}

const sparklineOptions = (categories: string[]): ApexOptions => ({
  colors: ["#6f3f97"],
  chart: {
    sparkline: { enabled: true },
    fontFamily: "Outfit, sans-serif",
  },
  plotOptions: { bar: { columnWidth: "60%", borderRadius: 2 } },
  tooltip: {
    x: { show: true },
    y: {
      formatter: (val) => `${val}`,
      title: { formatter: () => "Count" },
    },
    marker: { show: false },
  },
  xaxis: { categories },
});

export default function DepartmentTable({ departments }: DepartmentTableProps) {
  const totalEmployees = departments.reduce((acc, d) => acc + d.count, 0);
  const max = Math.max(...departments.map((d) => d.count), 1);
  const [employeesModal, setEmployeesModal] = useState<DepartmentNode | null>(null);
  const [wingsModal, setWingsModal] = useState<DepartmentNode | null>(null);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
        <div>
          <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
            Department Headcount
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {departments.length} departments · {totalEmployees.toLocaleString()} reporting
            employees
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
              <th className="px-6 py-3 font-medium">Department</th>
              <th className="px-6 py-3 font-medium">Manager</th>
              <th className="px-6 py-3 font-medium text-right">Employees</th>
              <th className="px-6 py-3 font-medium">Wings</th>
              <th className="px-6 py-3 font-medium w-1/4">Share</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => {
              const pct = (d.count / max) * 100;
              const share = totalEmployees ? (d.count / totalEmployees) * 100 : 0;
              const wingCounts = d.wings.map((w) => w.count);
              const wingNames = d.wings.map((w) => w.wingName);
              return (
                <tr
                  key={d.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-3.5 font-medium text-gray-800 dark:text-white/90">
                    {d.department}
                  </td>
                  <td className="px-6 py-3.5 text-gray-600 dark:text-gray-300">
                    {d.manager}
                  </td>
                  <td className="px-6 py-3.5 text-right text-gray-800 dark:text-white/90">
                    {d.count.toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5">
                    {d.wings.length > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="w-16">
                          <ReactApexChart
                            type="bar"
                            options={sparklineOptions(wingNames)}
                            series={[{ data: wingCounts }]}
                            height={32}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {d.wings.length}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-2 flex-1 rounded-full bg-gray-100 dark:bg-gray-800"
                        aria-hidden="true"
                      >
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-xs text-gray-500 dark:text-gray-400">
                        {share.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEmployeesModal(d)}
                        className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.05]"
                      >
                        Employees
                      </button>
                      {d.wings.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setWingsModal(d)}
                          className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-600"
                        >
                          Wings
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {employeesModal && (
        <EmployeesModal
          open={Boolean(employeesModal)}
          onClose={() => setEmployeesModal(null)}
          title={employeesModal.department}
          mode={{ type: "byFilter", departmentName: employeesModal.department }}
        />
      )}
      {wingsModal && (
        <WingsModal
          open={Boolean(wingsModal)}
          onClose={() => setWingsModal(null)}
          department={wingsModal}
        />
      )}
    </div>
  );
}
