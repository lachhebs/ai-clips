-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SceneType" AS ENUM ('DIALOGUE', 'ACTION', 'TRANSITION', 'INTRO', 'OUTRO');

-- CreateEnum
CREATE TYPE "ClipStatus" AS ENUM ('CANDIDATE', 'APPROVED', 'REJECTED', 'RENDERING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('UPLOAD', 'PROBE', 'TRANSCRIBE', 'SCENE_DETECT', 'AI_ANALYSIS', 'CLIP_DISCOVERY', 'CLIP_SCORING', 'REFRAME', 'CAPTIONS', 'RENDER', 'THUMBNAIL');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'FAILED', 'RETRYING');

-- CreateEnum
CREATE TYPE "AIProviderType" AS ENUM ('QWEN', 'GEMINI', 'GLM', 'LOCAL', 'OPENAI');

-- CreateEnum
CREATE TYPE "AspectRatio" AS ENUM ('LANDSCAPE', 'PORTRAIT', 'SQUARE');

-- CreateEnum
CREATE TYPE "VideoStyle" AS ENUM ('TIKTOK', 'INSTAGRAM', 'YOUTUBE_SHORTS');

-- CreateEnum
CREATE TYPE "CaptionPosition" AS ENUM ('TOP', 'CENTER', 'BOTTOM');

-- CreateEnum
CREATE TYPE "CaptionBackground" AS ENUM ('NONE', 'TRANSPARENT', 'SOLID');

-- CreateEnum
CREATE TYPE "CaptionAnimation" AS ENUM ('NONE', 'FADE', 'SLIDE', 'KARAOKE');

-- CreateEnum
CREATE TYPE "Capitalization" AS ENUM ('NONE', 'UPPER', 'LOWER', 'TITLE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'UPLOADING',
    "videoPath" TEXT,
    "videoUrl" TEXT,
    "duration" DOUBLE PRECISION,
    "resolution" TEXT,
    "fps" DOUBLE PRECISION,
    "fileSize" BIGINT,
    "thumbnailUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transcript" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "language" TEXT,
    "fullText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transcript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranscriptSegment" (
    "id" TEXT NOT NULL,
    "transcriptId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "start" DOUBLE PRECISION NOT NULL,
    "end" DOUBLE PRECISION NOT NULL,
    "speaker" TEXT,
    "confidence" DOUBLE PRECISION,

    CONSTRAINT "TranscriptSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "startTime" DOUBLE PRECISION NOT NULL,
    "endTime" DOUBLE PRECISION NOT NULL,
    "thumbnailUrl" TEXT,
    "description" TEXT,
    "type" "SceneType" NOT NULL DEFAULT 'DIALOGUE',

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clip" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "startTime" DOUBLE PRECISION NOT NULL,
    "endTime" DOUBLE PRECISION NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "title" TEXT NOT NULL,
    "hook" TEXT,
    "description" TEXT,
    "transcript" TEXT,
    "reasoning" TEXT,
    "status" "ClipStatus" NOT NULL DEFAULT 'CANDIDATE',
    "outputPath" TEXT,
    "thumbnailUrl" TEXT,
    "aspectRatio" "AspectRatio" NOT NULL DEFAULT 'PORTRAIT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClipScore" (
    "id" TEXT NOT NULL,
    "clipId" TEXT NOT NULL,
    "hook" DOUBLE PRECISION NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "emotion" DOUBLE PRECISION NOT NULL,
    "surprise" DOUBLE PRECISION NOT NULL,
    "story" DOUBLE PRECISION NOT NULL,
    "standalone" DOUBLE PRECISION NOT NULL,
    "clarity" DOUBLE PRECISION NOT NULL,
    "visual" DOUBLE PRECISION NOT NULL,
    "virality" DOUBLE PRECISION NOT NULL,
    "overall" DOUBLE PRECISION NOT NULL,
    "weights" JSONB,
    "providerId" TEXT,

    CONSTRAINT "ClipScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RenderJob" (
    "id" TEXT NOT NULL,
    "clipId" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "outputPath" TEXT,
    "settings" JSONB,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RenderJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIProvider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AIProviderType" NOT NULL,
    "model" TEXT,
    "apiKey" TEXT,
    "baseUrl" TEXT,
    "config" JSONB,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSettings" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "aiProviderId" TEXT,
    "numClips" INTEGER NOT NULL DEFAULT 10,
    "minDuration" INTEGER NOT NULL DEFAULT 20,
    "maxDuration" INTEGER NOT NULL DEFAULT 60,
    "aspectRatio" "AspectRatio" NOT NULL DEFAULT 'PORTRAIT',
    "style" "VideoStyle" NOT NULL DEFAULT 'TIKTOK',
    "targetHooks" BOOLEAN NOT NULL DEFAULT true,
    "targetFunny" BOOLEAN NOT NULL DEFAULT true,
    "targetSurprising" BOOLEAN NOT NULL DEFAULT true,
    "targetEducational" BOOLEAN NOT NULL DEFAULT true,
    "targetEmotional" BOOLEAN NOT NULL DEFAULT true,
    "contextBefore" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "contextAfter" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "scoringWeights" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaptionPreset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "font" TEXT NOT NULL DEFAULT 'Arial',
    "fontSize" INTEGER NOT NULL DEFAULT 24,
    "position" "CaptionPosition" NOT NULL DEFAULT 'BOTTOM',
    "background" "CaptionBackground" NOT NULL DEFAULT 'TRANSPARENT',
    "animation" "CaptionAnimation" NOT NULL DEFAULT 'NONE',
    "capitalization" "Capitalization" NOT NULL DEFAULT 'NONE',
    "maxCharsPerLine" INTEGER NOT NULL DEFAULT 40,
    "highlightColor" TEXT,
    "userId" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaptionPreset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_createdAt_idx" ON "Project"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Transcript_projectId_key" ON "Transcript"("projectId");

-- CreateIndex
CREATE INDEX "Transcript_projectId_idx" ON "Transcript"("projectId");

-- CreateIndex
CREATE INDEX "TranscriptSegment_transcriptId_idx" ON "TranscriptSegment"("transcriptId");

-- CreateIndex
CREATE INDEX "TranscriptSegment_start_idx" ON "TranscriptSegment"("start");

-- CreateIndex
CREATE INDEX "Scene_projectId_idx" ON "Scene"("projectId");

-- CreateIndex
CREATE INDEX "Scene_startTime_idx" ON "Scene"("startTime");

-- CreateIndex
CREATE INDEX "Clip_projectId_idx" ON "Clip"("projectId");

-- CreateIndex
CREATE INDEX "Clip_status_idx" ON "Clip"("status");

-- CreateIndex
CREATE INDEX "Clip_createdAt_idx" ON "Clip"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClipScore_clipId_key" ON "ClipScore"("clipId");

-- CreateIndex
CREATE INDEX "ClipScore_clipId_idx" ON "ClipScore"("clipId");

-- CreateIndex
CREATE INDEX "ClipScore_overall_idx" ON "ClipScore"("overall");

-- CreateIndex
CREATE INDEX "Job_projectId_idx" ON "Job"("projectId");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_type_idx" ON "Job"("type");

-- CreateIndex
CREATE INDEX "Job_createdAt_idx" ON "Job"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RenderJob_clipId_key" ON "RenderJob"("clipId");

-- CreateIndex
CREATE INDEX "RenderJob_clipId_idx" ON "RenderJob"("clipId");

-- CreateIndex
CREATE INDEX "RenderJob_status_idx" ON "RenderJob"("status");

-- CreateIndex
CREATE INDEX "AIProvider_userId_idx" ON "AIProvider"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSettings_projectId_key" ON "ProjectSettings"("projectId");

-- CreateIndex
CREATE INDEX "ProjectSettings_projectId_idx" ON "ProjectSettings"("projectId");

-- CreateIndex
CREATE INDEX "CaptionPreset_userId_idx" ON "CaptionPreset"("userId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcript" ADD CONSTRAINT "Transcript_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptSegment" ADD CONSTRAINT "TranscriptSegment_transcriptId_fkey" FOREIGN KEY ("transcriptId") REFERENCES "Transcript"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Clip" ADD CONSTRAINT "Clip_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClipScore" ADD CONSTRAINT "ClipScore_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RenderJob" ADD CONSTRAINT "RenderJob_clipId_fkey" FOREIGN KEY ("clipId") REFERENCES "Clip"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIProvider" ADD CONSTRAINT "AIProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSettings" ADD CONSTRAINT "ProjectSettings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSettings" ADD CONSTRAINT "ProjectSettings_aiProviderId_fkey" FOREIGN KEY ("aiProviderId") REFERENCES "AIProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaptionPreset" ADD CONSTRAINT "CaptionPreset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
