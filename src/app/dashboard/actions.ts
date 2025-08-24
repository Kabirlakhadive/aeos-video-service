"use server";

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getThumbnailUrls(thumbnailKeys: string[]) {
  try {
    const urls = await Promise.all(
      thumbnailKeys.map((key) => {
        const command = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: key,
        });
        return getSignedUrl(s3Client, command, { expiresIn: 3600 });
      })
    );
    return { success: urls };
  } catch (error) {
    console.error("Error generating signed URLs for thumbnails:", error);
    return { failure: "Could not get thumbnail URLs." };
  }
}

export async function getDownloadUrl(videoKey: string, videoName: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: videoKey,

      ResponseContentDisposition: `attachment; filename="${videoName}"`,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn: 60 });
    return { success: url };
  } catch (error) {
    console.error("Error generating signed URL for download:", error);
    return { failure: "Could not get download URL." };
  }
}
