import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { analyzeProgress } from "@/services/progress";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Premium check
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionStatus: true, goal: true },
    });

    if (user?.subscriptionStatus !== "PREMIUM") {
      return NextResponse.json(
        { error: "Premium subscription required" },
        { status: 403 }
      );
    }

    const analysis = await analyzeProgress(
      session.user.id,
      user.goal ?? "MAINTAIN"
    );

    return NextResponse.json(analysis);
  } catch (err) {
    console.error("Weight analysis error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
