// src/lib/queue.ts
import { Queue } from "bullmq";
import Redis from "ioredis"; // ioredis is the underlying client for BullMQ

// Parse the Upstash URL components
const upstashUrl = new URL(process.env.UPSTASH_REDIS_REST_URL!);
const host = upstashUrl.hostname;
const port = Number(upstashUrl.port || 6379); // Default Redis port is 6379
const password = process.env.UPSTASH_REDIS_REST_TOKEN!;

// Create a connection object for BullMQ/ioredis
const connection = new Redis({
  host: host,
  port: port,
  password: password,
  tls: {
    // Required for secure connection to Upstash
    rejectUnauthorized: false,
  },
  maxRetriesPerRequest: null, // Disable retries to prevent connection flooding errors
});

export const VIDEO_PROCESSING_QUEUE_NAME = "video-processing";

// Create a new queue instance
export const videoProcessingQueue = new Queue(VIDEO_PROCESSING_QUEUE_NAME, {
  connection: connection,
});
