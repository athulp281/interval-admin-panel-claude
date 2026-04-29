import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import type { DepartmentNode } from "../../api/types";
import DashboardCard from "../DashboardCard";

interface Props {
  departments: DepartmentNode[];
}

export default function DepartmentBarChart({ departments }: Props) {
  const sorted = [...departments].sort((a, b) => b.count - a.count);

  const options: ApexOptions = {
    colors: ["#6f3f97"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 460,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "65%",
        borderRadius: 6,
        borderRadiusApplication: "end",
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      offsetX: 24,
      style: { fontSize: "12px", colors: ["#6b7280"], fontWeight: 600 },
      formatter: (val) => `${val}`,
    },
    legend: { show: false },
    xaxis: {
      categories: sorted.map((d) => d.department),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#6b7280", fontFamily: "Outfit" } },
    },
    yaxis: {
      labels: {
        style: { colors: "#6b7280", fontFamily: "Outfit", fontSize: "12px" },
      },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    tooltip: {
      y: { formatter: (v) => `${v} employees` },
      x: {
        formatter: function (_, opts) {
          const dep = sorted[opts?.dataPointIndex];
          return dep ? `${dep.department} · Manager: ${dep.manager}` : "";
        },
      },
    },
  };

  return (
    <DashboardCard
      title="Department Headcount"
      subtitle={`${departments.length} departments · sorted by size`}
    >
      <ReactApexChart
        options={options}
        series={[{ name: "Employees", data: sorted.map((d) => d.count) }]}
        type="bar"
        height={460}
      />
    </DashboardCard>
  );
}
