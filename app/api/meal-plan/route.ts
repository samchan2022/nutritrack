import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateMealPlan } from "@/services/meal-plan";
import { getWeekStart } from "@/utils/formatters";
import type { DietPreference, Goal } from "@/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mealPlan = await db.mealPlan.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!mealPlan) {
      return NextResponse.json({ mealPlan: null });
    }

    return NextResponse.json({
      mealPlan: {
        ...mealPlan,
        weekStartDate: mealPlan.weekStartDate.toISOString(),
        createdAt: mealPlan.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Meal plan GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check premium subscription
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionStatus: true,
        calorieTarget: true,
        proteinTarget: true,
        carbTarget: true,
        fatTarget: true,
        dietPreference: true,
        goal: true,
        weight: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.subscriptionStatus !== "PREMIUM") {
      return NextResponse.json(
        { error: "Premium subscription required to generate meal plans" },
        { status: 403 }
      );
    }

    if (!user.calorieTarget || !user.weight) {
      return NextResponse.json(
        { error: "Please complete your profile before generating a meal plan" },
        { status: 400 }
      );
    }

    // Generate via OpenAI
    const planData = await generateMealPlan({
      calorieTarget: user.calorieTarget,
      proteinTarget: user.proteinTarget ?? 150,
      carbTarget: user.carbTarget ?? 200,
      fatTarget: user.fatTarget ?? 55,
      dietPreference: (user.dietPreference as DietPreference) ?? "NONE",
      goal: (user.goal as Goal) ?? "MAINTAIN",
      weight: user.weight,
    });

    const weekStart = getWeekStart();

    const mealPlan = await db.mealPlan.create({
      data: {
        userId: session.user.id,
        weekStartDate: weekStart,
        planJSON: planData,
        groceryList: planData.groceryList,
      },
    });

    return NextResponse.json({
      mealPlan: {
        ...mealPlan,
        weekStartDate: mealPlan.weekStartDate.toISOString(),
        createdAt: mealPlan.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Meal plan POST error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate meal plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
