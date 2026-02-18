"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { formatShortDate } from "@/utils/formatters";
import type { WeightLog } from "@/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

interface WeightChartProps {
  logs: WeightLog[];
}

export function WeightChart({ logs }: WeightChartProps) {
  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
        No weight data yet. Log your first weight below.
      </div>
    );
  }

  const labels = logs.map((l) => formatShortDate(l.date));
  const weights = logs.map((l) => l.weight);
  const minW = Math.min(...weights) - 1;
  const maxW = Math.max(...weights) + 1;

  const data = {
    labels,
    datasets: [
      {
        label: "Weight (kg)",
        data: weights,
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.08)",
        borderWidth: 2.5,
        pointBackgroundColor: "#10b981",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1f2937",
        titleColor: "#f9fafb",
        bodyColor: "#d1fae5",
        callbacks: {
          label: (ctx: any) => ` ${ctx.parsed.y} kg`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af", font: { size: 11 } },
      },
      y: {
        min: minW,
        max: maxW,
        grid: { color: "#f3f4f6" },
        ticks: {
          color: "#9ca3af",
          font: { size: 11 },
          callback: (v: any) => `${v} kg`,
        },
      },
    },
  };

  return (
    <div className="h-48">
      <Line data={data} options={options as any} />
    </div>
  );
}
