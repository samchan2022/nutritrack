"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { TrendingDown, TrendingUp, Minus, Info } from "lucide-react";
import { WeightLogForm } from "@/components/progress/weight-log-form";
import { WeightChart } from "@/components/dashboard/weight-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaywallModal } from "@/components/subscription/paywall-modal";
import { formatDate } from "@/utils/formatters";
import type { WeightLog } from "@/types";

interface ProgressAnalysis {
  recommendation: "increase_calories" | "decrease_calories" | "maintain" | "insufficient_data";
  adjustmentAmount: number;
  message: string;
}

interface UserProfile {
  weight: number | null;
  calorieTarget: number | null;
  goal: string | null;
}

export default function ProgressPage() {
  const { data: session } = useSession();
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [analysis, setAnalysis] = useState<ProgressAnalysis | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);

  const isPremium = session?.user?.subscriptionStatus === "PREMIUM";

  const fetchData = useCallback(async () => {
    try {
      const [logsRes, profileRes] = await Promise.all([
        fetch("/api/weight-log"),
        fetch("/api/user/profile"),
      ]);
      const logsData = await logsRes.json() as { logs: WeightLog[] };
      const profileData = await profileRes.json() as UserProfile;
      setWeightLogs(logsData.logs ?? []);
      setProfile(profileData);

      // Fetch analysis for premium users
      if (session?.user?.subscriptionStatus === "PREMIUM") {
        const analysisRes = await fetch("/api/weight-log/analysis");
        if (analysisRes.ok) {
          const analysisData = await analysisRes.json() as ProgressAnalysis;
          setAnalysis(analysisData);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [session?.user?.subscriptionStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const latestWeight = weightLogs[weightLogs.length - 1]?.weight ?? profile?.weight;
  const firstWeight = weightLogs[0]?.weight;
  const totalChange = latestWeight && firstWeight ? latestWeight - firstWeight : null;

  const RecommendationIcon = analysis?.recommendation === "decrease_calories"
    ? TrendingDown
    : analysis?.recommendation === "increase_calories"
    ? TrendingUp
    : Minus;

  const recColor = {
    increase_calories: "bg-blue-50 text-blue-700 border-blue-200",
    decrease_calories: "bg-amber-50 text-amber-700 border-amber-200",
    maintain: "bg-emerald-50 text-emerald-700 border-emerald-200",
    insufficient_data: "bg-gray-50 text-gray-600 border-gray-200",
  }[analysis?.recommendation ?? "insufficient_data"] ?? "";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Progress Tracking</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Track your weight and monitor progress toward your goal
        </p>
      </div>

      {/* Log weight */}
      <WeightLogForm
        currentWeight={latestWeight ?? null}
        onLogged={fetchData}
      />

      {/* Stats */}
      {weightLogs.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Current Weight</p>
            <p className="text-2xl font-bold text-gray-900">
              {latestWeight?.toFixed(1)}<span className="text-sm font-normal text-gray-500"> kg</span>
            </p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Starting Weight</p>
            <p className="text-2xl font-bold text-gray-900">
              {firstWeight?.toFixed(1)}<span className="text-sm font-normal text-gray-500"> kg</span>
            </p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Total Change</p>
            <p className={`text-2xl font-bold ${
              totalChange === null ? "text-gray-400" :
              totalChange < 0 ? "text-emerald-600" : "text-rose-600"
            }`}>
              {totalChange !== null
                ? `${totalChange > 0 ? "+" : ""}${totalChange.toFixed(1)} kg`
                : "—"}
            </p>
          </div>
        </div>
      )}

      {/* Weight chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Over Time</CardTitle>
          <CardDescription>
            {weightLogs.length} weigh-ins recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WeightChart logs={weightLogs} />
        </CardContent>
      </Card>

      {/* Smart adjustment (Premium) */}
      {isPremium ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Smart Calorie Adjustment
              <Badge variant="emerald" className="text-xs">AI</Badge>
            </CardTitle>
            <CardDescription>
              Weekly analysis of your progress with personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-400 text-sm">Analyzing your progress...</p>
            ) : analysis ? (
              <div className={`border rounded-xl p-4 ${recColor}`}>
                <div className="flex items-start gap-3">
                  <RecommendationIcon className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm capitalize">
                      {analysis.recommendation.replace(/_/g, " ")}
                      {analysis.adjustmentAmount > 0 &&
                        ` (+${analysis.adjustmentAmount} kcal)`}
                    </p>
                    <p className="text-sm mt-1 opacity-90">{analysis.message}</p>
                    {analysis.recommendation !== "maintain" &&
                      analysis.recommendation !== "insufficient_data" &&
                      profile?.calorieTarget && (
                        <p className="text-xs mt-2 opacity-75">
                          Suggested target:{" "}
                          <strong>
                            {analysis.recommendation === "increase_calories"
                              ? profile.calorieTarget + analysis.adjustmentAmount
                              : profile.calorieTarget - analysis.adjustmentAmount}{" "}
                            kcal/day
                          </strong>
                        </p>
                      )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Log your weight to get recommendations.</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card
          className="border-dashed cursor-pointer hover:border-emerald-300 transition-colors"
          onClick={() => setShowPaywall(true)}
        >
          <CardContent className="py-8 text-center">
            <Info className="h-8 w-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">
              Smart Calorie Adjustments
            </p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Upgrade to Premium for weekly progress analysis and automatic calorie recommendations.
            </p>
            <Badge variant="amber" className="mt-3">
              Premium Feature
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Log history table */}
      {weightLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weight History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...weightLogs].reverse().map((log, i) => {
                const prev = [...weightLogs].reverse()[i + 1];
                const change = prev ? log.weight - prev.weight : null;
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <span className="text-sm text-gray-600">{formatDate(log.date)}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-900">
                        {log.weight.toFixed(1)} kg
                      </span>
                      {change !== null && (
                        <span
                          className={`text-xs font-medium ${
                            change < 0 ? "text-emerald-600" : change > 0 ? "text-rose-600" : "text-gray-400"
                          }`}
                        >
                          {change > 0 ? "+" : ""}
                          {change.toFixed(1)} kg
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
}
