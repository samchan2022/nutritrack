export type Gender = "MALE" | "FEMALE" | "OTHER";
export type Goal = "LOSE_WEIGHT" | "GAIN_MUSCLE" | "MAINTAIN";
export type ActivityLevel =
  | "SEDENTARY"
  | "LIGHTLY_ACTIVE"
  | "MODERATELY_ACTIVE"
  | "VERY_ACTIVE"
  | "EXTRA_ACTIVE";
export type DietPreference =
  | "NONE"
  | "VEGETARIAN"
  | "VEGAN"
  | "KETO"
  | "PALEO"
  | "MEDITERRANEAN";
export type SubscriptionStatus = "FREE" | "PREMIUM" | "CANCELED";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  age: number | null;
  gender: Gender | null;
  height: number | null;
  weight: number | null;
  goal: Goal | null;
  activityLevel: ActivityLevel | null;
  dietPreference: DietPreference | null;
  calorieTarget: number | null;
  proteinTarget: number | null;
  carbTarget: number | null;
  fatTarget: number | null;
  onboardingComplete: boolean;
  subscriptionStatus: SubscriptionStatus;
}

export interface FoodLog {
  id: string;
  userId: string;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

export interface WeightLog {
  id: string;
  userId: string;
  weight: number;
  date: string;
}

export interface MacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Meal Plan Types
export interface MealFood {
  item: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  name: string;
  foods: MealFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface DayPlan {
  day: string;
  meals: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snack: Meal;
  };
  dailyTotals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export interface GroceryList {
  proteins: string[];
  carbohydrates: string[];
  fats: string[];
  vegetables: string[];
  fruits: string[];
  other: string[];
}

export interface WeeklyMealPlan {
  weekPlan: DayPlan[];
  groceryList: GroceryList;
}

export interface MealPlanRecord {
  id: string;
  userId: string;
  weekStartDate: string;
  planJSON: WeeklyMealPlan;
  groceryList: GroceryList;
  createdAt: string;
}

// Onboarding
export interface OnboardingData {
  name: string;
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  dietPreference: DietPreference;
}

// Progress
export interface WeeklyProgressAnalysis {
  currentWeight: number;
  previousWeight: number | null;
  weightChange: number | null;
  percentageChange: number | null;
  recommendation: "increase_calories" | "decrease_calories" | "maintain" | "insufficient_data";
  adjustmentAmount: number;
  message: string;
}

// Food Database
export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}
