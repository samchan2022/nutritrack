"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FoodLog } from "@/types";
import { toast } from "@/components/ui/use-toast";

interface FoodLogListProps {
  logs: FoodLog[];
  onDeleted: () => void;
}

export function FoodLogList({ logs, onDeleted }: FoodLogListProps) {
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/food-log/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: "Entry removed", variant: "success" });
      onDeleted();
    } catch {
      toast({ title: "Failed to delete entry", variant: "destructive" });
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        No food logged today. Add your first entry above!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{log.foodName}</p>
            <div className="flex gap-3 mt-0.5 text-xs text-gray-500">
              <span className="font-semibold text-gray-700">{Math.round(log.calories)} kcal</span>
              <span>P: {Math.round(log.protein)}g</span>
              <span>C: {Math.round(log.carbs)}g</span>
              <span>F: {Math.round(log.fat)}g</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50 h-8 w-8"
            onClick={() => handleDelete(log.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
    </div>
  );
}
