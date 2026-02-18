import type { Gender, Goal, ActivityLevel } from "@/types";

/**
 * Mifflin-St Jeor BMR formula
 * @param weight - kg
 * @param height - cm
 * @param age - years
 * @param gender - MALE | FEMALE | OTHER
 */
export function calculateBMR(
  weight: number,
  height: number,
  age: number,
  gender: Gender
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  if (gender === "MALE") return base + 5;
  if (gender === "FEMALE") return base - 161;
  return base - 78; // Average for OTHER
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
};

/**
 * Total Daily Energy Expenditure
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Adjust calories based on goal
 */
export function calculateCalorieTarget(tdee: number, goal: Goal): number {
  switch (goal) {
    case "LOSE_WEIGHT":
      return Math.round(tdee - 500); // ~0.5kg/week deficit
    case "GAIN_MUSCLE":
      return Math.round(tdee + 300); // lean bulk surplus
    case "MAINTAIN":
    default:
      return Math.round(tdee);
  }
}

/**
 * Calculate macro targets
 * Protein: 1.6g/kg muscle gain, 1.2g/kg weight loss, 1.0g/kg maintain
 * Fats: 25% of total calories
 * Carbs: remaining calories
 */
export function calculateMacros(
  calorieTarget: number,
  weight: number,
  goal: Goal
): { protein: number; fats: number; carbs: number } {
  let proteinPerKg: number;
  switch (goal) {
    case "GAIN_MUSCLE":
      proteinPerKg = 1.6;
      break;
    case "LOSE_WEIGHT":
      proteinPerKg = 1.2;
      break;
    default:
      proteinPerKg = 1.0;
  }

  const protein = Math.round(weight * proteinPerKg);
  const fatCalories = calorieTarget * 0.25;
  const fats = Math.round(fatCalories / 9);
  const proteinCalories = protein * 4;
  const remainingCalories = calorieTarget - proteinCalories - fatCalories;
  const carbs = Math.max(0, Math.round(remainingCalories / 4));

  return { protein, fats, carbs };
}

/**
 * Full nutrition profile calculation
 */
export function calculateNutritionProfile(params: {
  weight: number;
  height: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goal: Goal;
}) {
  const { weight, height, age, gender, activityLevel, goal } = params;
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const calorieTarget = calculateCalorieTarget(tdee, goal);
  const { protein, fats, carbs } = calculateMacros(calorieTarget, weight, goal);

  return {
    bmr: Math.round(bmr),
    tdee,
    calorieTarget,
    proteinTarget: protein,
    fatTarget: fats,
    carbTarget: carbs,
  };
}

/**
 * Calculate percentage of daily goal consumed
 */
export function calculatePercentage(consumed: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((consumed / target) * 100));
}

/**
 * Weekly progress analysis for smart calorie adjustment
 */
export function analyzeWeeklyProgress(
  currentWeight: number,
  previousWeight: number | null,
  twoWeeksAgoWeight: number | null,
  currentCalorieTarget: number,
  goal: string
): {
  recommendation: "increase_calories" | "decrease_calories" | "maintain" | "insufficient_data";
  adjustmentAmount: number;
  message: string;
} {
  if (!previousWeight) {
    return {
      recommendation: "insufficient_data",
      adjustmentAmount: 0,
      message: "Not enough data yet. Keep logging your weight weekly.",
    };
  }

  const weightChange = currentWeight - previousWeight;
  const percentageChange = (weightChange / previousWeight) * 100;
  const weeklyLossThreshold = -1.0; // >1% loss

  if (goal === "LOSE_WEIGHT") {
    if (percentageChange < weeklyLossThreshold) {
      // Losing too fast - increase calories
      const adjustment = Math.round(currentCalorieTarget * 0.05);
      return {
        recommendation: "increase_calories",
        adjustmentAmount: adjustment,
        message: `You're losing weight faster than recommended. Increasing calories by ${adjustment} to preserve muscle.`,
      };
    }

    if (
      twoWeeksAgoWeight &&
      Math.abs(currentWeight - twoWeeksAgoWeight) < 0.2
    ) {
      // Plateau for 2 weeks - reduce calories
      const adjustment = Math.round(currentCalorieTarget * 0.05);
      return {
        recommendation: "decrease_calories",
        adjustmentAmount: adjustment,
        message: `Weight plateau detected. Reducing calories by ${adjustment} to restart progress.`,
      };
    }
  }

  if (goal === "GAIN_MUSCLE" && weightChange < 0) {
    const adjustment = Math.round(currentCalorieTarget * 0.05);
    return {
      recommendation: "increase_calories",
      adjustmentAmount: adjustment,
      message: `You're losing weight while trying to gain muscle. Increasing calories by ${adjustment}.`,
    };
  }

  return {
    recommendation: "maintain",
    adjustmentAmount: 0,
    message: "Progress is on track. Keep up the great work!",
  };
}
