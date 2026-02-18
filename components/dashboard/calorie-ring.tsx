"use client";

import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CalorieRingProps {
  consumed: number;
  target: number;
}

export function CalorieRing({ consumed, target }: CalorieRingProps) {
  const remaining = Math.max(0, target - consumed);
  const over = consumed > target ? consumed - target : 0;
  const percentage = target > 0 ? Math.min(100, Math.round((consumed / target) * 100)) : 0;

  const data = {
    datasets: [
      {
        data: over > 0 ? [target, over] : [consumed, remaining],
        backgroundColor:
          over > 0
            ? ["#ef4444", "#fca5a5"]
            : ["#10b981", "#e5e7eb"],
        borderWidth: 0,
        cutout: "78%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    animation: { animateRotate: true, duration: 800 },
  };

  return (
    <div className="relative flex items-center justify-center w-52 h-52 mx-auto">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-bold text-gray-900">
          {Math.round(consumed)}
        </span>
        <span className="text-xs text-gray-500 font-medium mt-0.5">kcal eaten</span>
        <div className="mt-1 text-xs">
          {over > 0 ? (
            <span className="text-red-500 font-medium">+{Math.round(over)} over</span>
          ) : (
            <span className="text-emerald-600 font-medium">{Math.round(remaining)} left</span>
          )}
        </div>
        <span className="text-xs text-gray-400 mt-0.5">{percentage}% of goal</span>
      </div>
    </div>
  );
}
