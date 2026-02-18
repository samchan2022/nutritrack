"use client";

import { useState } from "react";
import { ShoppingCart, ChevronDown, ChevronUp, Utensils } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { WeeklyMealPlan, DayPlan, Meal } from "@/types";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
} as const;

const MEAL_COLORS = {
  breakfast: "text-amber-600 bg-amber-50",
  lunch: "text-blue-600 bg-blue-50",
  dinner: "text-purple-600 bg-purple-50",
  snack: "text-emerald-600 bg-emerald-50",
} as const;

function MealCard({ type, meal }: { type: keyof typeof MEAL_LABELS; meal: Meal }) {
  const [open, setOpen] = useState(false);
  const colorClass = MEAL_COLORS[type];

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
            {MEAL_LABELS[type]}
          </div>
          <span className="text-sm font-medium text-gray-900 text-left">{meal.name}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-semibold text-gray-700">
            {Math.round(meal.totalCalories)} kcal
          </span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 bg-gray-50 space-y-3">
          <div className="flex gap-4 text-xs text-gray-600 pt-2">
            <span>P: <strong>{Math.round(meal.totalProtein)}g</strong></span>
            <span>C: <strong>{Math.round(meal.totalCarbs)}g</strong></span>
            <span>F: <strong>{Math.round(meal.totalFat)}g</strong></span>
          </div>
          <div className="space-y-1.5">
            {meal.foods.map((food, i) => (
              <div key={i} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2">
                <div>
                  <span className="text-gray-900">{food.item}</span>
                  <span className="text-gray-400 ml-2 text-xs">{food.amount}</span>
                </div>
                <div className="text-xs text-gray-500 flex gap-2">
                  <span className="font-medium text-gray-700">{food.calories} kcal</span>
                  <span>P:{food.protein}g</span>
                  <span>C:{food.carbs}g</span>
                  <span>F:{food.fat}g</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DayView({ day }: { day: DayPlan }) {
  return (
    <div className="space-y-3">
      {/* Daily summary */}
      <div className="grid grid-cols-4 gap-2 bg-gray-50 rounded-xl p-3">
        {[
          { label: "Calories", value: `${Math.round(day.dailyTotals.calories)} kcal`, color: "text-gray-900" },
          { label: "Protein", value: `${Math.round(day.dailyTotals.protein)}g`, color: "text-blue-700" },
          { label: "Carbs", value: `${Math.round(day.dailyTotals.carbs)}g`, color: "text-amber-700" },
          { label: "Fat", value: `${Math.round(day.dailyTotals.fat)}g`, color: "text-rose-700" },
        ].map(({ label, value, color }) => (
          <div key={label} className="text-center">
            <p className={`text-sm font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Meals */}
      {(["breakfast", "lunch", "dinner", "snack"] as const).map((type) => (
        <MealCard key={type} type={type} meal={day.meals[type]} />
      ))}
    </div>
  );
}

function GroceryListView({ plan }: { plan: WeeklyMealPlan }) {
  const { groceryList } = plan;
  const categories = [
    { key: "proteins", label: "Proteins", color: "bg-blue-100 text-blue-800" },
    { key: "carbohydrates", label: "Carbohydrates", color: "bg-amber-100 text-amber-800" },
    { key: "fats", label: "Healthy Fats", color: "bg-yellow-100 text-yellow-800" },
    { key: "vegetables", label: "Vegetables", color: "bg-emerald-100 text-emerald-800" },
    { key: "fruits", label: "Fruits", color: "bg-rose-100 text-rose-800" },
    { key: "other", label: "Other", color: "bg-gray-100 text-gray-800" },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-700 mb-2">
        <ShoppingCart className="h-5 w-5 text-emerald-600" />
        <h3 className="font-semibold">Weekly Grocery List</h3>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {categories.map(({ key, label, color }) => {
          const items = groceryList[key] ?? [];
          if (items.length === 0) return null;
          return (
            <div key={key} className="border border-gray-100 rounded-xl p-4">
              <Badge className={`mb-3 ${color}`}>{label}</Badge>
              <ul className="space-y-1.5">
                {items.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface MealPlanDisplayProps {
  plan: WeeklyMealPlan;
}

export function MealPlanDisplay({ plan }: MealPlanDisplayProps) {
  const dayMap = new Map(plan.weekPlan.map((d) => [d.day, d]));

  return (
    <div className="space-y-6">
      <Tabs defaultValue="Monday">
        <TabsList className="flex-wrap h-auto gap-1 bg-gray-100 p-1">
          {DAYS.map((day) => (
            <TabsTrigger key={day} value={day} className="text-xs px-3 py-1.5">
              {day.slice(0, 3)}
            </TabsTrigger>
          ))}
          <TabsTrigger value="grocery" className="text-xs px-3 py-1.5">
            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
            Grocery
          </TabsTrigger>
        </TabsList>

        {DAYS.map((day) => {
          const dayPlan = dayMap.get(day);
          return (
            <TabsContent key={day} value={day} className="mt-4">
              {dayPlan ? (
                <DayView day={dayPlan} />
              ) : (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No data for {day}
                </div>
              )}
            </TabsContent>
          );
        })}

        <TabsContent value="grocery" className="mt-4">
          <GroceryListView plan={plan} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
