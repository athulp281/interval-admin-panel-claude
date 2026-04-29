import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import type { EmployeeStat } from "../../api/types";
import { getCount } from "../../lib/selectStats";
import DashboardCard from "../DashboardCard";

interface Props {
  stats: EmployeeStat[];
}

export default function BrandDistributionChart({ stats }: Props) {
  const interval = getCount(stats, "interval");
  const magicLamp = getCount(stats, "magic_lamp");
  const skillx = getCount(stats, "skillx");
  const series = [interval, magicLamp, skillx];
  const total = interval + magicLamp + skillx;

  const options: ApexOptions = {
    colors: ["#6f3f97", "#1e92d0", "#3da4d6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 280,
    },
    labels: ["Interval", "Magic Lamp", "SkillX"],
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
              formatter: (val) => `${val}`,
            },
            total: {
              show: true,
              label: "Total",
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
      y: { formatter: (val) => `${val} employees` },
    },
  };

  return (
    <DashboardCard
      title="Workforce by Brand"
      subtitle="Active headcount distribution"
    >
      <ReactApexChart options={options} series={series} type="donut" height={280} />
    </DashboardCard>
  );
}
