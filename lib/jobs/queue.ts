import { Queue } from "bullmq";
import IORedis from "ioredis";
import { JobData, VideoJobData, AIJobData, RenderJobData } from "./types";

const connection = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const videoQueue = new Queue<VideoJobData>("video-processing", { connection });
export const aiQueue = new Queue<AIJobData>("ai-processing", { connection });
export const renderQueue = new Queue<RenderJobData>("render-processing", { connection });

export async function addVideoJob(name: string, data: VideoJobData, opts?: { delay?: number; priority?: number }) {
  return videoQueue.add(name, data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    ...opts,
  });
}

export async function addAIJob(name: string, data: AIJobData, opts?: { delay?: number; priority?: number }) {
  return aiQueue.add(name, data, {
    attempts: 2,
    backoff: { type: "exponential", delay: 10000 },
    ...opts,
  });
}

export async function addRenderJob(name: string, data: RenderJobData, opts?: { delay?: number; priority?: number }) {
  return renderQueue.add(name, data, {
    attempts: 2,
    backoff: { type: "exponential", delay: 5000 },
    ...opts,
  });
}

export async function getJobStatus(queueName: string, jobId: string) {
  const queue = queueName === "video" ? videoQueue : queueName === "ai" ? aiQueue : renderQueue;
  const job = await queue.getJob(jobId);
  if (!job) return null;
  return {
    id: job.id,
    data: job.data,
    progress: job.progress,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
    timestamp: job.timestamp,
    processedOn: job.processedOn,
    finishedOn: job.finishedOn,
  };
}
