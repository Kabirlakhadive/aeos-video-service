// worker/queue-setup.ts

import { Queue } from "bullmq";
import Redis from "ioredis";

// This connection MUST use ioredis for BullMQ to work correctly on the worker.
const connectionString = `rediss://default:${
  process.env.UPSTASH_REDIS_REST_TOKEN
}@${new URL(process.env.UPSTASH_REDIS_REST_URL!).host}`;

export const redisConnection = new Redis(connectionString, {
  maxRetriesPerRequest: null,
});

export const VIDEO_PROCESSING_QUEUE_NAME = "video-processing";

export const videoProcessingQueue = new Queue(VIDEO_PROCESSING_QUEUE_NAME, {
  connection: redisConnection,
});
