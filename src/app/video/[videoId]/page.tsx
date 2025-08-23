// src/app/video/[videoId]/page.tsx

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { formatBytes } from "@/lib/utils";
import CreateLink from "./create-link";
import ShareLinksList from "./links-list";

export type ShareLink = {
  id: string;
  token: string;
  visibility: "PUBLIC" | "PRIVATE";
  expires_at: string | null;
  created_at: string;
};

interface VideoPageProps {
  params: {
    videoId: string;
  };
}

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function VideoPage({ params }: VideoPageProps) {
  const supabase = createClient();
  const { videoId } = params;

  const { data: video, error: videoError } = await supabase
    .from("videos")
    .select(
      `
      *,
      share_links ( id, token, visibility, expires_at, created_at )
    `
    )
    .eq("id", videoId)
    .single();

  if (videoError || !video) {
    notFound();
  }

  let videoUrl = "";
  if (video.status === "READY" && video.storage_path) {
    try {
      const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: video.storage_path,
      });
      videoUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    } catch (err) {
      console.error("Error generating signed URL for video:", err);
    }
  }

  const shareLinks = (video.share_links as unknown as ShareLink[]) || [];

  return (
    <div className="p-4">
      <div className="mb-8">
        {video.status === "READY" && videoUrl ? (
          <video
            controls
            preload="auto"
            className="w-full max-w-4xl mx-auto bg-black rounded-md"
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <div className="w-full max-w-4xl mx-auto aspect-video bg-gray-200 rounded-md flex items-center justify-center">
            <p>Video is still {video.status.toLowerCase()}...</p>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">{video.name}</h1>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Details</h2>
          <div className="text-sm space-y-1">
            <p>
              <span className="font-semibold">Status:</span> {video.status}
            </p>
            <p>
              <span className="font-semibold">Size:</span>{" "}
              {formatBytes(video.size_in_bytes)}
            </p>
            <p>
              <span className="font-semibold">Uploaded:</span>{" "}
              {new Date(video.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Share Links</h2>
            <CreateLink videoId={videoId} />
          </div>
          <div className="border rounded-md">
            <ShareLinksList links={shareLinks} />
          </div>
        </div>
      </div>
    </div>
  );
}
