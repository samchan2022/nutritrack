import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { format, startOfDay, endOfDay } from "date-fns";
import { CalorieRing } from "@/components/dashboard/calorie-ring";
import { MacroChart } from "@/components/dashboard/macro-chart";
import { WeightChart } from "@/components/dashboard/weight-chart";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getGoalLabel } from "@/utils/formatters";
import { Target, Flame, Trophy, Calendar } from "lucide-react";
import type { WeightLog, FoodLog } from "@/types";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = session.user.id;

  const [user, todayFoodLogs, recentWeightLogs] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        calorieTarget: true,
        proteinTarget: true,
        carbTarget: true,
        fatTarget: true,
        goal: true,
        weight: true,
      },
    }),
    db.foodLog.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay(new Date()),
          lte: endOfDay(new Date()),
        },
      },
      orderBy: { date: "desc" },
    }),
    db.weightLog.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      take: 12,
    }),
  ]);

  if (!user) redirect("/login");

  // Calculate today's totals
  const todayTotals = todayFoodLogs.reduce(
    (acc, log) => ({
      calories: acc.calories + log.calories,
      protein: acc.protein + log.protein,
      carbs: acc.carbs + log.carbs,
      fat: acc.fat + log.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const calorieTarget = user.calorieTarget ?? 2000;
  const proteinTarget = user.proteinTarget ?? 150;
  const carbTarget = user.carbTarget ?? 200;
  const fatTarget = user.fatTarget ?? 55;

  const caloriesRemaining = Math.max(0, calorieTarget - todayTotals.calories);
  const todayDate = format(new Date(), "EEEE, MMMM d");

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Good {getGreeting()}, {user.name?.split(" ")[0] ?? "there"}!
        </h2>
        <p className="text-gray-500 text-sm mt-1">{todayDate}</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Flame}
          label="Calorie Goal"
          value={`${calorieTarget} kcal`}
          color="text-orange-500"
          bg="bg-orange-50"
        />
        <StatCard
          icon={Target}
          label="Remaining Today"
          value={`${Math.round(caloriesRemaining)} kcal`}
          color={caloriesRemaining > 0 ? "text-emerald-600" : "text-red-500"}
          bg={caloriesRemaining > 0 ? "bg-emerald-50" : "bg-red-50"}
        />
        <StatCard
          icon={Trophy}
          label="Current Goal"
          value={getGoalLabel(user.goal ?? "MAINTAIN")}
          color="text-purple-600"
          bg="bg-purple-50"
        />
        <StatCard
          icon={Calendar}
          label="Meals Logged"
          value={`${todayFoodLogs.length} today`}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* Main charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Calorie ring */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Calories</CardTitle>
            <CardDescription>
              {Math.round(todayTotals.calories)} of {calorieTarget} kcal consumed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalorieRing
              consumed={todayTotals.calories}
              target={calorieTarget}
            />
          </CardContent>
        </Card>

        {/* Macros */}
        <Card>
          <CardHeader>
            <CardTitle>Macro Breakdown</CardTitle>
            <CardDescription>Today's protein, carbs & fat</CardDescription>
          </CardHeader>
          <CardContent>
            <MacroChart
              protein={{ consumed: todayTotals.protein, target: proteinTarget }}
              carbs={{ consumed: todayTotals.carbs, target: carbTarget }}
              fat={{ consumed: todayTotals.fat, target: fatTarget }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Weight chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Progress</CardTitle>
          <CardDescription>Last {recentWeightLogs.length} weigh-ins</CardDescription>
        </CardHeader>
        <CardContent>
          <WeightChart
            logs={recentWeightLogs.map((l) => ({
              id: l.id,
              userId: l.userId,
              weight: l.weight,
              date: l.date.toISOString(),
            }))}
          />
        </CardContent>
      </Card>

      {/* Today's log */}
      {todayFoodLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Today's Food Log</CardTitle>
            <CardDescription>{todayFoodLogs.length} items logged</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayFoodLogs.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <span className="text-sm text-gray-700">{log.foodName}</span>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="font-semibold text-gray-900">
                      {Math.round(log.calories)} kcal
                    </span>
                    <span>P:{Math.round(log.protein)}g</span>
                    <span>C:{Math.round(log.carbs)}g</span>
                    <span>F:{Math.round(log.fat)}g</span>
                  </div>
                </div>
              ))}
              {todayFoodLogs.length > 5 && (
                <p className="text-xs text-gray-400 pt-1 text-center">
                  +{todayFoodLogs.length - 5} more entries
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-xl p-4`}>
      <div className={`${color} mb-2`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
