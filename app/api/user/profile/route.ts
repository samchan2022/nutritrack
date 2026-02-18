import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateNutritionProfile } from "@/utils/calculations";
import type { Gender, Goal, ActivityLevel } from "@/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        goal: true,
        activityLevel: true,
        dietPreference: true,
        calorieTarget: true,
        proteinTarget: true,
        carbTarget: true,
        fatTarget: true,
        subscriptionStatus: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    console.error("Profile GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const patchSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  weight: z.number().min(30).max(500).optional(),
  goal: z.enum(["LOSE_WEIGHT", "GAIN_MUSCLE", "MAINTAIN"]).optional(),
  activityLevel: z
    .enum(["SEDENTARY", "LIGHTLY_ACTIVE", "MODERATELY_ACTIVE", "VERY_ACTIVE", "EXTRA_ACTIVE"])
    .optional(),
  dietPreference: z
    .enum(["NONE", "VEGETARIAN", "VEGAN", "KETO", "PALEO", "MEDITERRANEAN"])
    .optional(),
});

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as unknown;
    const updates = patchSchema.parse(body);

    // Get current user data for recalculation
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        weight: true,
        height: true,
        age: true,
        gender: true,
        goal: true,
        activityLevel: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Recalculate nutrition if relevant fields change
    let nutritionUpdates = {};
    const shouldRecalculate =
      updates.weight || updates.goal || updates.activityLevel;

    if (
      shouldRecalculate &&
      currentUser.height &&
      currentUser.age &&
      currentUser.gender
    ) {
      const nutrition = calculateNutritionProfile({
        weight: updates.weight ?? currentUser.weight ?? 70,
        height: currentUser.height,
        age: currentUser.age,
        gender: currentUser.gender as Gender,
        activityLevel: (updates.activityLevel ?? currentUser.activityLevel ?? "MODERATELY_ACTIVE") as ActivityLevel,
        goal: (updates.goal ?? currentUser.goal ?? "MAINTAIN") as Goal,
      });
      nutritionUpdates = {
        calorieTarget: nutrition.calorieTarget,
        proteinTarget: nutrition.proteinTarget,
        carbTarget: nutrition.carbTarget,
        fatTarget: nutrition.fatTarget,
      };
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: { ...updates, ...nutritionUpdates },
      select: {
        name: true,
        email: true,
        age: true,
        gender: true,
        height: true,
        weight: true,
        goal: true,
        activityLevel: true,
        dietPreference: true,
        calorieTarget: true,
        proteinTarget: true,
        carbTarget: true,
        fatTarget: true,
        subscriptionStatus: true,
      },
    });

    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Profile PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
