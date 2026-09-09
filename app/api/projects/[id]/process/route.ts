import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { QwenAIProvider } from "@/lib/ai/qwen";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (!project.videoUrl) {
      return NextResponse.json(
        { error: "No video uploaded to this project" },
        { status: 400 }
      );
    }

    // Update status to processing
    await prisma.project.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    // Create a processing job
    const job = await prisma.job.create({
      data: {
        projectId: id,
        type: "AI_ANALYSIS",
        status: "ACTIVE",
        message: "Starting AI analysis...",
      },
    });

    // Start processing in background
    processVideo(id, project.videoUrl, job.id).catch(console.error);

    return NextResponse.json({ message: "Processing started", jobId: job.id });
  } catch (error) {
    console.error("Process error:", error);
    return NextResponse.json({ error: "Failed to start processing" }, { status: 500 });
  }
}

async function processVideo(projectId: string, videoUrl: string, jobId: string) {
  try {
    const ai = new QwenAIProvider();
    const project = await prisma.project.findUnique({ where: { id: projectId } });

    // Step 1: Analyze video directly
    await prisma.job.update({
      where: { id: jobId },
      data: { message: "Analyzing video with AI..." },
    });

    const analysis = await ai.analyzeVideo({
      videoUrl,
      metadata: {
        duration: project?.duration || 0,
        resolution: project?.resolution || undefined,
        title: project?.name || undefined,
      },
    });

    // Save a summary transcript entry for reference
    await prisma.transcript.create({
      data: {
        projectId,
        language: "n/a",
        fullText: analysis.summary,
        segments: {
          create: analysis.keyMoments.map((m) => ({
            text: m.description,
            start: m.time,
            end: m.time + 5,
            confidence: m.importance / 10,
          })),
        },
      },
    });

    await prisma.job.update({
      where: { id: jobId },
      data: { message: "Finding best clips...", progress: 33 },
    });

    // Step 2: Find clips
    const clipCandidates = await ai.findClips({
      videoUrl,
      analysis,
      numClips: 10,
      minDuration: 20,
      maxDuration: 60,
      style: "TikTok",
    });

    await prisma.job.update({
      where: { id: jobId },
      data: { message: "Scoring clips...", progress: 66 },
    });

    // Step 3: Save and score clips
    for (const candidate of clipCandidates) {
      const clip = await prisma.clip.create({
        data: {
          projectId,
          startTime: candidate.startTime,
          endTime: candidate.endTime,
          duration: candidate.endTime - candidate.startTime,
          title: candidate.title,
          hook: candidate.hook,
          description: candidate.description,
          reasoning: candidate.reasoning,
          status: "CANDIDATE",
        },
      });

      try {
        const score = await ai.scoreClips({
          candidate,
          analysis,
        });

        await prisma.clipScore.create({
          data: {
            clipId: clip.id,
            hook: score.hook / 10,
            value: score.value / 10,
            emotion: score.emotion / 10,
            surprise: score.surprise / 10,
            story: score.story / 10,
            standalone: score.standalone / 10,
            clarity: score.clarity / 10,
            visual: score.visual / 10,
            virality: score.virality / 10,
            overall: score.overall / 10,
          },
        });
      } catch (scoreError) {
        console.error("Failed to score clip:", scoreError);
      }
    }

    // Complete
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "COMPLETED" },
    });

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "COMPLETED",
        progress: 100,
        message: `Found ${clipCandidates.length} clips`,
        completedAt: new Date(),
      },
    });
  } catch (error) {
    console.error("Processing failed:", error);
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "FAILED" },
    });
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}
