import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import type { EmployeeStat } from "../../api/types";
import { formatPct, getCount, pct } from "../../lib/selectStats";
import DashboardCard from "../DashboardCard";

interface Props {
  stats: EmployeeStat[];
}

export default function GenderSplitChart({ stats }: Props) {
  const male = getCount(stats, "male");
  const female = getCount(stats, "female");
  const series = [male, female];
  const total = male + female;

  const options: ApexOptions = {
    colors: ["#1e92d0", "#ee46bc"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 280,
    },
    labels: ["Male", "Female"],
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit, sans-serif",
      fontSize: "13px",
      labels: { colors: "#6b7280" },
      markers: { size: 6 },
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: { offsetY: 4, fontSize: "13px", color: "#6b7280" },
            value: {
              fontSize: "26px",
              fontWeight: 700,
              color: "#111827",
              offsetY: -8,
            },
            total: {
              show: true,
              label: "Reporting",
              fontSize: "13px",
              color: "#6b7280",
              formatter: () => total.toLocaleString(),
            },
          },
        },
      },
    },
    stroke: { width: 0 },
    dataLabels: { enabled: false },
    tooltip: {
      y: {
        formatter: (val) =>
          `${val} (${formatPct(pct(val, total))})`,
      },
    },
  };

  return (
    <DashboardCard title="Gender Distribution" subtitle="Among employees with recorded gender">
      <ReactApexChart options={options} series={series} type="donut" height={280} />
    </DashboardCard>
  );
}
