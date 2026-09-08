import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const clips = await prisma.clip.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        project: { select: { name: true } },
        score: true,
      },
    });
    return NextResponse.json(clips);
  } catch (error) {
    console.error("Failed to fetch clips:", error);
    return NextResponse.json({ error: "Failed to fetch clips" }, { status: 500 });
  }
}
