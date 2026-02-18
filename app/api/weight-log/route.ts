import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const weightLogSchema = z.object({
  weight: z.number().min(20).max(500),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await db.weightLog.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ logs });
  } catch (err) {
    console.error("Weight log GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as unknown;
    const { weight } = weightLogSchema.parse(body);

    const log = await db.weightLog.create({
      data: {
        userId: session.user.id,
        weight,
        date: new Date(),
      },
    });

    // Update user's current weight
    await db.user.update({
      where: { id: session.user.id },
      data: { weight },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Weight log POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
