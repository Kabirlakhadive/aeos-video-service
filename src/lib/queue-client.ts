// src/lib/queue-client.ts

import { Redis } from "@upstash/redis";

// This queue name must exactly match the one used by your worker
export const VIDEO_PROCESSING_QUEUE_NAME = "video-processing";

// Initialize a serverless-safe Redis client.
// Make sure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are in your Vercel environment variables.
const redis = Redis.fromEnv();

// This function adds a job to the BullMQ queue using raw Redis commands.
export async function addJobToQueue(jobName: string, data: any) {
  const queuePrefix = `bull:${VIDEO_PROCESSING_QUEUE_NAME}`;

  // BullMQ requires a unique job ID, which we generate here.
  const jobId = (await redis.incr(`${queuePrefix}:id`)).toString();

  const jobData = {
    name: jobName,
    data: JSON.stringify(data),
    opts: JSON.stringify({}), // Default BullMQ options
    timestamp: Date.now(),
    delay: 0,
    attemptsMade: 0,
  };

  // Use a Redis transaction to add the job and push it to the waiting list atomically.
  const pipeline = redis.multi();
  pipeline.hmset(`${queuePrefix}:${jobId}`, jobData);
  pipeline.lpush(`${queuePrefix}:wait`, jobId);
  await pipeline.exec();

  console.log(`Successfully added job ${jobId} to queue.`);
  return jobId;
}
