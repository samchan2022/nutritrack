import { format, startOfWeek, addDays } from "date-fns";

export function formatDate(date: Date | string): string {
  return format(new Date(date), "MMM d, yyyy");
}

export function formatShortDate(date: Date | string): string {
  return format(new Date(date), "MMM d");
}

export function formatDayName(date: Date | string): string {
  return format(new Date(date), "EEEE");
}

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday
}

export function getWeekDates(startDate: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
}

export function formatCalories(cal: number): string {
  return `${Math.round(cal)} kcal`;
}

export function formatMacro(grams: number): string {
  return `${Math.round(grams)}g`;
}

export function formatWeight(kg: number, unit: "kg" | "lbs" = "kg"): string {
  if (unit === "lbs") {
    return `${(kg * 2.20462).toFixed(1)} lbs`;
  }
  return `${kg.toFixed(1)} kg`;
}

export function formatHeight(cm: number): string {
  const feet = Math.floor(cm / 30.48);
  const inches = Math.round((cm % 30.48) / 2.54);
  return `${cm} cm (${feet}'${inches}")`;
}

export function getGoalLabel(goal: string): string {
  const labels: Record<string, string> = {
    LOSE_WEIGHT: "Weight Loss",
    GAIN_MUSCLE: "Muscle Gain",
    MAINTAIN: "Maintenance",
  };
  return labels[goal] ?? goal;
}

export function getActivityLabel(level: string): string {
  const labels: Record<string, string> = {
    SEDENTARY: "Sedentary (little or no exercise)",
    LIGHTLY_ACTIVE: "Lightly Active (1-3 days/week)",
    MODERATELY_ACTIVE: "Moderately Active (3-5 days/week)",
    VERY_ACTIVE: "Very Active (6-7 days/week)",
    EXTRA_ACTIVE: "Extra Active (twice a day)",
  };
  return labels[level] ?? level;
}

export function getDietLabel(pref: string): string {
  const labels: Record<string, string> = {
    NONE: "No Restriction",
    VEGETARIAN: "Vegetarian",
    VEGAN: "Vegan",
    KETO: "Keto",
    PALEO: "Paleo",
    MEDITERRANEAN: "Mediterranean",
  };
  return labels[pref] ?? pref;
}

export function getTodayDateString(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function isSameDay(date1: Date | string, date2: Date | string): boolean {
  return format(new Date(date1), "yyyy-MM-dd") === format(new Date(date2), "yyyy-MM-dd");
}
