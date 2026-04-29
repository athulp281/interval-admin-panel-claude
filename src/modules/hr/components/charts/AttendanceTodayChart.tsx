import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import type { EmployeeStat } from "../../api/types";
import { getCount, pct } from "../../lib/selectStats";
import DashboardCard from "../DashboardCard";

interface Props {
  stats: EmployeeStat[];
}

export default function AttendanceTodayChart({ stats }: Props) {
  const total = getCount(stats, "total");
  const present = getCount(stats, "today_present");
  const wfh = getCount(stats, "today_work_from_home");
  const leave = getCount(stats, "today_leave");

  const presentPct = pct(present, total);
  const wfhPct = pct(wfh, total);
  const leavePct = pct(leave, total);

  const options: ApexOptions = {
    colors: ["#16a34a", "#1e92d0", "#f59e0b"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 320,
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: { size: "30%" },
        track: {
          background: "#e5e7eb",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: { show: false },
        },
      },
    },
    stroke: { lineCap: "round" },
    labels: ["In office", "Work from home", "On leave"],
    legend: {
      show: true,
      floating: true,
      position: "left",
      offsetX: 0,
      offsetY: 15,
      fontFamily: "Outfit, sans-serif",
      fontSize: "13px",
      labels: { colors: "#6b7280" },
      markers: { size: 6 },
      itemMargin: { vertical: 4 },
      formatter: function (seriesName: string, opts: { seriesIndex: number }) {
        const counts = [present, wfh, leave];
        return `${seriesName}: ${counts[opts.seriesIndex]}`;
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: {
          legend: { position: "bottom", floating: false, offsetY: 0 },
        },
      },
    ],
  };

  return (
    <DashboardCard
      title="Today's Attendance"
      subtitle={`${(present + wfh).toLocaleString()} of ${total.toLocaleString()} active today`}
    >
      <ReactApexChart
        options={options}
        series={[
          Number(presentPct.toFixed(1)),
          Number(wfhPct.toFixed(1)),
          Number(leavePct.toFixed(1)),
        ]}
        type="radialBar"
        height={320}
      />
    </DashboardCard>
  );
}
