import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: MP4, WebM, MOV, AVI" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`videos/${file.name}`, file, {
      access: "public",
    });

    // If projectId provided, update the project
    if (projectId) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          videoUrl: blob.url,
          fileSize: BigInt(file.size),
          status: "PROCESSING",
        },
      });
    }

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      size: file.size,
      name: file.name,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
