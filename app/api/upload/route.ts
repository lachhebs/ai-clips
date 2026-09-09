import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, url, path, size, name } = body;

    if (!projectId || !url || !path) {
      return NextResponse.json(
        { error: "Missing required fields: projectId, url, path" },
        { status: 400 }
      );
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        videoUrl: url,
        fileSize: BigInt(size || 0),
        status: "PROCESSING",
      },
    });

    return NextResponse.json({ url, path, size, name });
  } catch (error) {
    console.error("Upload update failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
