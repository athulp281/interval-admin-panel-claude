import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import type { EmployeeStat } from "../../api/types";
import { getCount } from "../../lib/selectStats";
import DashboardCard from "../DashboardCard";

interface Props {
  stats: EmployeeStat[];
}

export default function LifecycleChart({ stats }: Props) {
  const buckets = [
    { label: "Permanent", value: getCount(stats, "permanent"), color: "#6f3f97" },
    { label: "Probation", value: getCount(stats, "probation"), color: "#1e92d0" },
    { label: "Notice Period", value: getCount(stats, "notice_period"), color: "#f59e0b" },
    { label: "Long Leave", value: getCount(stats, "long_leave"), color: "#fb6514" },
    { label: "Post Working", value: getCount(stats, "post_working"), color: "#9ca3af" },
  ];

  const options: ApexOptions = {
    colors: buckets.map((b) => b.color),
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 280,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 6,
        borderRadiusApplication: "end",
        distributed: true,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      offsetY: -22,
      style: { fontSize: "12px", colors: ["#6b7280"], fontWeight: 600 },
    },
    legend: { show: false },
    xaxis: {
      categories: buckets.map((b) => b.label),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#6b7280", fontFamily: "Outfit" } },
    },
    yaxis: {
      labels: { style: { colors: "#6b7280", fontFamily: "Outfit" } },
    },
    grid: {
      borderColor: "#e5e7eb",
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
    },
    tooltip: {
      y: { formatter: (v) => `${v} employees` },
    },
  };

  return (
    <DashboardCard
      title="Employment Lifecycle"
      subtitle="Headcount by current employment phase"
    >
      <ReactApexChart
        options={options}
        series={[{ name: "Employees", data: buckets.map((b) => b.value) }]}
        type="bar"
        height={280}
      />
    </DashboardCard>
  );
}
