"use client";

import { useEffect, useState } from "react";
import { type Video } from "./page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Image as ImageIcon, Loader2 } from "lucide-react";
import { getThumbnailUrls, getDownloadUrl } from "./actions";
import Image from "next/image";
import Link from "next/link";

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (
      video.status === "READY" &&
      video.thumbnail_urls &&
      video.thumbnail_urls.length > 0
    ) {
      setIsLoadingThumbs(true);
      getThumbnailUrls(video.thumbnail_urls)
        .then((response) => {
          if (response.success) {
            setThumbnailUrls(response.success);
          }
        })
        .finally(() => {
          setIsLoadingThumbs(false);
        });
    }
  }, [video.status, video.thumbnail_urls]);

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

  const handleDownload = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setIsDownloading(true);
    const result = await getDownloadUrl(video.storage_path, video.name);
    if (result.success) {
      const link = document.createElement("a");
      link.href = result.success;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Could not get download link. Please try again.");
    }
    setIsDownloading(false);
  };

  return (
    <div className="flex w-full items-center gap-4 rounded-lg border p-3 shadow-sm transition-colors hover:bg-muted/50">
      <div className="flex relative h-16 w-28 flex-shrink-0 rounded-md bg-secondary">
        {video.status === "READY" && isLoadingThumbs && (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {video.status === "READY" &&
          !isLoadingThumbs &&
          thumbnailUrls.length > 0 && (
            <Image
              src={thumbnailUrls[0]}
              alt={`Thumbnail for ${video.name}`}
              className="h-full w-full rounded-md object-cover"
              fill
            />
          )}
        {video.status !== "READY" && (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <Link href={`/video/${video.id}`} className="flex-grow min-w-0">
        <p className="truncate font-semibold">{video.name}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(video.created_at).toLocaleString()}
        </p>
        <div className="mt-1">
          <Badge variant={getStatusVariant()}>{video.status}</Badge>
        </div>
      </Link>
      <div className="flex-shrink-0">
        {video.status === "READY" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span className="ml-2 hidden sm:inline">Download</span>
          </Button>
        )}
      </div>
    </div>
  );
}
