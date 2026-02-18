import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateNutritionProfile } from "@/utils/calculations";
import type { Gender, Goal, ActivityLevel, DietPreference } from "@/types";

const onboardingSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  age: z.number().int().min(14).max(100),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(500),
  goal: z.enum(["LOSE_WEIGHT", "GAIN_MUSCLE", "MAINTAIN"]),
  activityLevel: z.enum([
    "SEDENTARY",
    "LIGHTLY_ACTIVE",
    "MODERATELY_ACTIVE",
    "VERY_ACTIVE",
    "EXTRA_ACTIVE",
  ]),
  dietPreference: z.enum([
    "NONE",
    "VEGETARIAN",
    "VEGAN",
    "KETO",
    "PALEO",
    "MEDITERRANEAN",
  ]),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as unknown;
    const data = onboardingSchema.parse(body);

    // Calculate nutrition targets
    const nutrition = calculateNutritionProfile({
      weight: data.weight,
      height: data.height,
      age: data.age,
      gender: data.gender as Gender,
      activityLevel: data.activityLevel as ActivityLevel,
      goal: data.goal as Goal,
    });

    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        age: data.age,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        goal: data.goal,
        activityLevel: data.activityLevel,
        dietPreference: data.dietPreference,
        calorieTarget: nutrition.calorieTarget,
        proteinTarget: nutrition.proteinTarget,
        carbTarget: nutrition.carbTarget,
        fatTarget: nutrition.fatTarget,
        onboardingComplete: true,
      },
      select: { id: true, name: true, calorieTarget: true },
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
