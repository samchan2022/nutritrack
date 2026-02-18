import type { FoodItem } from "@/types";

export const FOOD_DATABASE: FoodItem[] = [
  // Proteins
  { name: "Chicken Breast (cooked)", calories: 165, protein: 31, carbs: 0, fat: 3.6, serving: "100g" },
  { name: "Salmon (cooked)", calories: 208, protein: 20, carbs: 0, fat: 13, serving: "100g" },
  { name: "Tuna (canned, in water)", calories: 86, protein: 19, carbs: 0, fat: 0.5, serving: "100g" },
  { name: "Eggs (large)", calories: 72, protein: 6, carbs: 0.4, fat: 5, serving: "1 egg (50g)" },
  { name: "Greek Yogurt (plain, 0%)", calories: 59, protein: 10, carbs: 3.6, fat: 0.4, serving: "100g" },
  { name: "Cottage Cheese", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, serving: "100g" },
  { name: "Ground Beef (90% lean)", calories: 215, protein: 26, carbs: 0, fat: 12, serving: "100g" },
  { name: "Turkey Breast", calories: 135, protein: 30, carbs: 0, fat: 1, serving: "100g" },
  { name: "Shrimp", calories: 85, protein: 18, carbs: 0.9, fat: 0.9, serving: "100g" },
  { name: "Tofu (firm)", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, serving: "100g" },
  { name: "Whey Protein Powder", calories: 120, protein: 24, carbs: 3, fat: 1.5, serving: "30g scoop" },
  { name: "Lentils (cooked)", calories: 116, protein: 9, carbs: 20, fat: 0.4, serving: "100g" },
  { name: "Chickpeas (cooked)", calories: 164, protein: 8.9, carbs: 27, fat: 2.6, serving: "100g" },
  { name: "Black Beans (cooked)", calories: 132, protein: 8.9, carbs: 24, fat: 0.5, serving: "100g" },

  // Carbohydrates
  { name: "White Rice (cooked)", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, serving: "100g" },
  { name: "Brown Rice (cooked)", calories: 112, protein: 2.6, carbs: 24, fat: 0.9, serving: "100g" },
  { name: "Oats (dry)", calories: 389, protein: 17, carbs: 66, fat: 7, serving: "100g" },
  { name: "Bread (whole wheat)", calories: 247, protein: 13, carbs: 41, fat: 3.4, serving: "100g" },
  { name: "Pasta (cooked)", calories: 131, protein: 5, carbs: 25, fat: 1.1, serving: "100g" },
  { name: "Sweet Potato (cooked)", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, serving: "100g" },
  { name: "Quinoa (cooked)", calories: 120, protein: 4.4, carbs: 21, fat: 1.9, serving: "100g" },
  { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, serving: "1 medium (118g)" },
  { name: "Apple", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, serving: "1 medium (182g)" },
  { name: "Orange", calories: 47, protein: 0.9, carbs: 12, fat: 0.1, serving: "1 medium (131g)" },
  { name: "Blueberries", calories: 57, protein: 0.7, carbs: 14, fat: 0.3, serving: "100g" },
  { name: "Strawberries", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, serving: "100g" },

  // Fats
  { name: "Olive Oil", calories: 884, protein: 0, carbs: 0, fat: 100, serving: "100ml" },
  { name: "Avocado", calories: 160, protein: 2, carbs: 9, fat: 15, serving: "100g" },
  { name: "Almonds", calories: 579, protein: 21, carbs: 22, fat: 50, serving: "100g" },
  { name: "Walnuts", calories: 654, protein: 15, carbs: 14, fat: 65, serving: "100g" },
  { name: "Peanut Butter", calories: 588, protein: 25, carbs: 20, fat: 50, serving: "100g" },
  { name: "Cheddar Cheese", calories: 402, protein: 25, carbs: 1.3, fat: 33, serving: "100g" },
  { name: "Butter", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, serving: "100g" },

  // Vegetables
  { name: "Broccoli", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, serving: "100g" },
  { name: "Spinach", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, serving: "100g" },
  { name: "Mixed Salad Greens", calories: 17, protein: 1.6, carbs: 2.9, fat: 0.2, serving: "100g" },
  { name: "Tomato", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, serving: "100g" },
  { name: "Cucumber", calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, serving: "100g" },
  { name: "Bell Pepper", calories: 31, protein: 1, carbs: 6, fat: 0.3, serving: "100g" },
  { name: "Mushrooms", calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, serving: "100g" },
  { name: "Onion", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, serving: "100g" },
  { name: "Carrots", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, serving: "100g" },
  { name: "Zucchini", calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, serving: "100g" },

  // Dairy & Alternatives
  { name: "Whole Milk", calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3, serving: "100ml" },
  { name: "Skim Milk", calories: 34, protein: 3.4, carbs: 5, fat: 0.1, serving: "100ml" },
  { name: "Almond Milk (unsweetened)", calories: 17, protein: 0.6, carbs: 1.4, fat: 1.4, serving: "100ml" },

  // Snacks
  { name: "Rice Cakes", calories: 387, protein: 8.2, carbs: 82, fat: 2.8, serving: "100g" },
  { name: "Dark Chocolate (70%)", calories: 600, protein: 7.8, carbs: 46, fat: 43, serving: "100g" },
  { name: "Protein Bar (average)", calories: 200, protein: 20, carbs: 22, fat: 5, serving: "1 bar (60g)" },
];

export function searchFoods(query: string, limit = 10): FoodItem[] {
  if (!query.trim()) return FOOD_DATABASE.slice(0, limit);
  const lower = query.toLowerCase();
  return FOOD_DATABASE.filter((f) =>
    f.name.toLowerCase().includes(lower)
  ).slice(0, limit);
}
