"use client";

import { useState, useEffect, useCallback } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import { FoodEntryForm } from "@/components/food-log/food-entry-form";
import { FoodLogList } from "@/components/food-log/food-log-list";
import { MacroChart } from "@/components/dashboard/macro-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FoodLog } from "@/types";
import { useSession } from "next-auth/react";

interface UserTargets {
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

export default function FoodLogPage() {
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [targets, setTargets] = useState<UserTargets | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const fetchData = useCallback(async () => {
    try {
      const [logsRes, profileRes] = await Promise.all([
        fetch("/api/food-log"),
        fetch("/api/user/profile"),
      ]);
      const logsData = await logsRes.json() as { logs: FoodLog[] };
      const profileData = await profileRes.json() as UserTargets;
      setLogs(logsData.logs ?? []);
      setTargets(profileData);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totals = logs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbs: acc.carbs + log.carbs,
      fat: acc.fat + log.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const remaining = targets
    ? Math.max(0, targets.calorieTarget - totals.calories)
    : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Date header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Food Log</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        {remaining !== null && (
          <Badge
            variant={remaining > 0 ? "emerald" : "destructive"}
            className="text-sm px-3 py-1"
          >
            {remaining > 0
              ? `${Math.round(remaining)} kcal remaining`
              : `${Math.round(Math.abs(remaining as number))} kcal over`}
          </Badge>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Left: Add food */}
        <div className="lg:col-span-2">
          <FoodEntryForm onAdded={fetchData} />
        </div>

        {/* Right: Macros + log */}
        <div className="lg:col-span-3 space-y-4">
          {targets && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Today's Macros</CardTitle>
                <CardDescription>
                  {Math.round(totals.calories)} / {targets.calorieTarget} kcal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MacroChart
                  protein={{ consumed: totals.protein, target: targets.proteinTarget }}
                  carbs={{ consumed: totals.carbs, target: targets.carbTarget }}
                  fat={{ consumed: totals.fat, target: targets.fatTarget }}
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Today's Entries
                {logs.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({logs.length} items)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center text-gray-400 text-sm">
                  Loading...
                </div>
              ) : (
                <FoodLogList logs={logs} onDeleted={fetchData} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
