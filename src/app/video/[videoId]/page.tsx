import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { formatBytes } from "@/lib/utils";
import CreateShareLink from "./create-link";
import ShareLinksList from "./links-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

  const getStatusVariant = () => {
    switch (video.status) {
      case "READY":
        return "default";
      case "PROCESSING":
        return "secondary";
      case "FAILED":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button asChild variant="ghost" className="pl-0">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      {/* Main two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
        {/* Column 1: Video Player and Share Links */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player */}
          <div className="aspect-video w-full">
            {video.status === "READY" && videoUrl ? (
              <video
                controls
                preload="metadata"
                className="w-full h-full bg-black rounded-lg shadow-lg"
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-full bg-secondary rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">
                  Video is still {video.status.toLowerCase()}...
                </p>
              </div>
            )}
          </div>

          {/* Share Links Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Share Links</CardTitle>
              <CreateShareLink videoId={videoId} />
            </CardHeader>
            <CardContent>
              <ShareLinksList links={shareLinks} />
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Details Card */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="truncate text-xl">{video.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">
                  Status
                </span>
                <Badge variant={getStatusVariant()}>{video.status}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">
                  Size
                </span>
                <span>{formatBytes(video.size_in_bytes)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">
                  Uploaded
                </span>
                <span>{new Date(video.created_at).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
