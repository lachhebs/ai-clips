import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadToSupabase } from "@/lib/storage/supabase-storage";

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

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 500MB" },
        { status: 400 }
      );
    }

    // Generate unique file path
    const ext = file.name.split(".").pop() || "mp4";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `videos/${uniqueName}`;

    // Upload to Supabase Storage
    const { url } = await uploadToSupabase(filePath, file, file.type);

    // If projectId provided, update the project
    if (projectId) {
      await prisma.project.update({
        where: { id: projectId },
        data: {
          videoUrl: url,
          fileSize: BigInt(file.size),
          status: "PROCESSING",
        },
      });
    }

    return NextResponse.json({
      url,
      path: filePath,
      size: file.size,
      name: file.name,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
