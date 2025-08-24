// src/app/upload/actions.ts

"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
// REMOVED: import { videoProcessingQueue } from "@/lib/queue";
// ADDED: The new, serverless-safe function
import { addJobToQueue } from "@/lib/queue-client";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MAX_FILE_SIZE = 500 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["video/mp4", "video/webm", "video/ogg"];

type SignedURLResponse = {
  failure?: string;
  success?: { url: string; storagePath: string };
};

export async function generatePresignedUrl(
  fileType: string,
  fileSize: number
): Promise<SignedURLResponse> {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // @ts-ignore
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { failure: "Not authenticated" };
  }
  if (!ALLOWED_FILE_TYPES.includes(fileType)) {
    return { failure: "Invalid file type" };
  }
  if (fileSize > MAX_FILE_SIZE) {
    return { failure: "File is too large" };
  }

  const videoId = crypto.randomUUID();
  const fileExtension = fileType.split("/")[1];
  const storagePath = `${user.id}/${videoId}/original.${fileExtension}`;

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: storagePath,
    ContentType: fileType,
    ContentLength: fileSize,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 60,
    });
    return { success: { url: signedUrl, storagePath } };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return { failure: "Could not generate signed URL" };
  }
}

export async function createVideoRecord(
  name: string,
  sizeInBytes: number,
  storagePath: string
) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // @ts-ignore
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { failure: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("videos")
    .insert([
      {
        name,
        size_in_bytes: sizeInBytes,
        storage_path: storagePath,
        user_id: user.id,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating video record:", error);
    return { failure: "Could not create video record in database." };
  }

  if (data) {
    // THIS IS THE CORRECTED LINE:
    await addJobToQueue("process-video", {
      videoId: data.id,
    });
    console.log(`Added job to queue for videoId: ${data.id}`);
  }

  return { success: data };
}
