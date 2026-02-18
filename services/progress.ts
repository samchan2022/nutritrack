import { db } from "@/lib/db";
import { analyzeWeeklyProgress } from "@/utils/calculations";
import { subWeeks } from "date-fns";

export async function getWeightLogs(userId: string, limit = 12) {
  return db.weightLog.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    take: limit,
  });
}

export async function addWeightLog(userId: string, weight: number) {
  return db.weightLog.create({
    data: { userId, weight, date: new Date() },
  });
}

export async function analyzeProgress(userId: string, goal: string) {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const twoWeeksAgo = subWeeks(now, 2);

  const recentLogs = await db.weightLog.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 3,
  });

  if (recentLogs.length === 0) {
    return {
      recommendation: "insufficient_data" as const,
      adjustmentAmount: 0,
      message: "Log your weight weekly to get smart calorie adjustments.",
    };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { calorieTarget: true },
  });

  const currentWeight = recentLogs[0].weight;
  const previousWeight = recentLogs[1]?.weight ?? null;
  const twoWeeksAgoWeight = recentLogs[2]?.weight ?? null;
  const calorieTarget = user?.calorieTarget ?? 2000;

  return analyzeWeeklyProgress(
    currentWeight,
    previousWeight,
    twoWeeksAgoWeight,
    calorieTarget,
    goal
  );
}
