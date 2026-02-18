"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { Progress } from "@/components/ui/progress";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface MacroChartProps {
  protein: { consumed: number; target: number };
  carbs: { consumed: number; target: number };
  fat: { consumed: number; target: number };
}

function MacroRow({
  label,
  consumed,
  target,
  color,
  unit = "g",
}: {
  label: string;
  consumed: number;
  target: number;
  color: string;
  unit?: string;
}) {
  const pct = target > 0 ? Math.min(100, (consumed / target) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">
          <span className="font-semibold text-gray-900">
            {Math.round(consumed)}{unit}
          </span>{" "}
          / {Math.round(target)}{unit}
        </span>
      </div>
      <Progress
        value={pct}
        className="h-2.5"
        indicatorClassName={color}
      />
      <p className="text-xs text-gray-400 text-right">{Math.round(pct)}%</p>
    </div>
  );
}

export function MacroChart({ protein, carbs, fat }: MacroChartProps) {
  return (
    <div className="space-y-4">
      <MacroRow
        label="Protein"
        consumed={protein.consumed}
        target={protein.target}
        color="bg-blue-500"
      />
      <MacroRow
        label="Carbohydrates"
        consumed={carbs.consumed}
        target={carbs.target}
        color="bg-amber-500"
      />
      <MacroRow
        label="Fat"
        consumed={fat.consumed}
        target={fat.target}
        color="bg-rose-500"
      />
    </div>
  );
}
