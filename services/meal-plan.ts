import openai from "@/lib/openai";
import type { WeeklyMealPlan, DietPreference, Goal } from "@/types";

interface MealPlanInput {
  calorieTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  dietPreference: DietPreference;
  goal: Goal;
  weight: number;
}

function buildPrompt(input: MealPlanInput): string {
  const dietText =
    input.dietPreference === "NONE"
      ? "no specific dietary restrictions"
      : input.dietPreference.charAt(0) +
        input.dietPreference.slice(1).toLowerCase();

  const goalText = input.goal.replace(/_/g, " ").toLowerCase();

  return `You are a professional certified nutritionist. Generate a complete 7-day meal plan.

User Profile:
- Daily Calorie Target: ${input.calorieTarget} kcal (stay within ±5%)
- Protein Target: ${input.proteinTarget}g per day
- Carbohydrate Target: ${input.carbTarget}g per day
- Fat Target: ${input.fatTarget}g per day
- Dietary Preference: ${dietText}
- Goal: ${goalText}
- Current Weight: ${input.weight}kg

Requirements:
1. Each day must include breakfast, lunch, dinner, and 1 snack
2. Every meal must list specific foods with exact quantities (grams or ml)
3. Provide estimated calories and macros (protein, carbs, fat in grams) per food item and meal total
4. Daily totals must be within ±5% of calorie target
5. Meals should be practical, delicious, and varied across the week
6. Respect the dietary preference strictly
7. Include a comprehensive grocery list organized by category

Return ONLY valid JSON matching this exact schema:
{
  "weekPlan": [
    {
      "day": "Monday",
      "meals": {
        "breakfast": {
          "name": "Meal name",
          "foods": [
            {"item": "food name", "amount": "100g", "calories": 150, "protein": 10, "carbs": 15, "fat": 5}
          ],
          "totalCalories": 400,
          "totalProtein": 30,
          "totalCarbs": 40,
          "totalFat": 12
        },
        "lunch": { "name": "...", "foods": [...], "totalCalories": 0, "totalProtein": 0, "totalCarbs": 0, "totalFat": 0 },
        "dinner": { "name": "...", "foods": [...], "totalCalories": 0, "totalProtein": 0, "totalCarbs": 0, "totalFat": 0 },
        "snack": { "name": "...", "foods": [...], "totalCalories": 0, "totalProtein": 0, "totalCarbs": 0, "totalFat": 0 }
      },
      "dailyTotals": { "calories": 0, "protein": 0, "carbs": 0, "fat": 0 }
    }
  ],
  "groceryList": {
    "proteins": ["..."],
    "carbohydrates": ["..."],
    "fats": ["..."],
    "vegetables": ["..."],
    "fruits": ["..."],
    "other": ["..."]
  }
}`;
}

export async function generateMealPlan(
  input: MealPlanInput
): Promise<WeeklyMealPlan> {
  const prompt = buildPrompt(input);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a professional nutritionist. Always respond with valid JSON only, no markdown or extra text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 8000,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error("No response received from AI");
  }

  try {
    const parsed = JSON.parse(content) as WeeklyMealPlan;

    // Basic validation
    if (!parsed.weekPlan || !Array.isArray(parsed.weekPlan)) {
      throw new Error("Invalid meal plan structure");
    }
    if (parsed.weekPlan.length !== 7) {
      throw new Error("Meal plan must contain exactly 7 days");
    }

    return parsed;
  } catch (err) {
    throw new Error(
      `Failed to parse AI response: ${err instanceof Error ? err.message : "Unknown error"}`
    );
  }
}
