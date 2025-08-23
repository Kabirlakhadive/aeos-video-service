// worker/index.ts

import { Worker, Job } from "bullmq";
import { VIDEO_PROCESSING_QUEUE_NAME, redisConnection } from "../src/lib/queue";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { createServerClient } from "@supabase/ssr";
import ffmpeg from "fluent-ffmpeg";
import tmp from "tmp";
import fs from "fs";
import path from "path";
import { Readable } from "stream";

const ffmpegPath = "C:\\ffmpeg\\bin\\ffmpeg.exe";
const ffprobePath = "C:\\ffmpeg\\bin\\ffprobe.exe";
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

console.log("Starting video processing worker...");

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const dummyCookieStore = {
  get: () => undefined,
  set: () => {},
  remove: () => {},
};
const supabaseAdmin = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { cookies: dummyCookieStore }
);
const createTempDir = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    tmp.dir({ unsafeCleanup: true }, (err, dirPath) => {
      if (err) reject(err);
      resolve(dirPath);
    });
  });
};
const processor = async (job: Job) => {
  console.log(`Processing job ${job.id} for videoId: ${job.data.videoId}`);
  const { videoId } = job.data;
  const { data: video, error: videoError } = await supabaseAdmin
    .from("videos")
    .select("storage_path")
    .eq("id", videoId)
    .single();
  if (videoError || !video) {
    throw new Error(
      `Could not find video with ID ${videoId}: ${videoError?.message}`
    );
  }
  const tempDirPath = await createTempDir();
  const localVideoPath = path.join(tempDirPath, "original_video");
  try {
    console.log(`Downloading video from S3: ${video.storage_path}`);
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: video.storage_path,
    });
    const response = await s3Client.send(getObjectCommand);
    if (response.Body instanceof Readable) {
      const writeStream = fs.createWriteStream(localVideoPath);
      response.Body.pipe(writeStream);
      await new Promise((resolve, reject) => {
        writeStream.on("finish", () => resolve(undefined));
        writeStream.on("error", reject);
      });
    } else {
      throw new Error(
        "Failed to download video: response body is not a readable stream."
      );
    }
    console.log("Video downloaded successfully.");
    console.log("Generating thumbnails...");
    await new Promise<void>((resolve, reject) => {
      ffmpeg(localVideoPath)
        .on("end", () => {
          console.log("Thumbnails generated.");
          resolve();
        })
        .on("error", (err) => {
          console.error("FFmpeg error:", err);
          reject(new Error("Failed to generate thumbnails."));
        })
        .screenshots({
          count: 3,
          folder: tempDirPath,
          filename: "thumbnail-%i.png",
          timemarks: ["25%", "50%", "75%"],
        });
    });
    console.log("Uploading thumbnails to S3...");
    const s3ThumbnailPaths: string[] = [];
    const videoPathPrefix = path.dirname(video.storage_path);
    for (let i = 1; i <= 3; i++) {
      const thumbnailFileName = `thumbnail-${i}.png`;
      const localThumbnailPath = path.join(tempDirPath, thumbnailFileName);
      const s3ThumbnailKey = `${videoPathPrefix}/thumbnails/${thumbnailFileName}`;
      const putObjectCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: s3ThumbnailKey,
        Body: fs.createReadStream(localThumbnailPath),
        ContentType: "image/png",
      });
      await s3Client.send(putObjectCommand);
      s3ThumbnailPaths.push(s3ThumbnailKey);
    }
    console.log("Thumbnails uploaded successfully.");
    return { status: "completed", videoId, thumbnails: s3ThumbnailPaths };
  } catch (error) {
    console.error(`Error processing video ${videoId}:`, error);
    throw error;
  } finally {
    fs.rmSync(tempDirPath, { recursive: true, force: true });
    console.log(`Cleaned up temporary directory: ${tempDirPath}`);
  }
};
const worker = new Worker(VIDEO_PROCESSING_QUEUE_NAME, processor, {
  connection: redisConnection,
  concurrency: 2,
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 500 },
});
worker.on("completed", (job, result) => {
  console.log(`Job ${job.id} completed. Result:`, result);
});
worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error:`, err.message);
});
console.log("Worker is listening for jobs...");
