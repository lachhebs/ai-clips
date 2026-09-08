import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { transcribeWithOpenAI } from "@/lib/transcription/openai-whisper";
import { QwenAIProvider } from "@/lib/ai/qwen";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: { transcript: true },
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
        type: "TRANSCRIBE",
        status: "ACTIVE",
        message: "Starting transcription...",
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
    // Step 1: Transcribe
    await prisma.job.update({
      where: { id: jobId },
      data: { message: "Transcribing audio with Whisper..." },
    });

    const transcription = await transcribeWithOpenAI(videoUrl);

    // Save transcript
    await prisma.transcript.create({
      data: {
        projectId,
        language: transcription.language,
        fullText: transcription.text,
        segments: {
          create: transcription.segments.map((seg) => ({
            text: seg.text,
            start: seg.start,
            end: seg.end,
            confidence: seg.confidence,
          })),
        },
      },
    });

    await prisma.job.update({
      where: { id: jobId },
      data: { message: "Analyzing content with AI...", progress: 33 },
    });

    // Step 2: AI Analysis
    const ai = new QwenAIProvider();
    const project = await prisma.project.findUnique({ where: { id: projectId } });

    const analysis = await ai.analyzeVideo({
      transcript: transcription.text,
      segments: transcription.segments,
      metadata: {
        duration: project?.duration || 0,
        resolution: project?.resolution || undefined,
      },
    });

    await prisma.job.update({
      where: { id: jobId },
      data: { message: "Finding best clips...", progress: 66 },
    });

    // Step 3: Find clips
    const clipCandidates = await ai.findClips({
      transcript: transcription.text,
      segments: transcription.segments,
      analysis,
      numClips: 10,
      minDuration: 20,
      maxDuration: 60,
      style: "TikTok",
    });

    // Save clips
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

      // Score each clip
      try {
        const score = await ai.scoreClips({
          candidate,
          transcript: transcription.text,
          context: analysis.summary,
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
