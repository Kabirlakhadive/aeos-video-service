"use client";

import { useEffect, useState } from "react";
import { type Video } from "./page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Image as ImageIcon, Loader2 } from "lucide-react";
import { getThumbnailUrls, getDownloadUrl } from "./actions"; // <-- IMPORT NEW ACTION

interface VideoCardProps {
  video: Video;
}

export default function VideoCard({ video }: VideoCardProps) {
  const [thumbnailUrls, setThumbnailUrls] = useState<string[]>([]);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // <-- NEW STATE

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
    <div className="p-4 border rounded-md flex gap-4 items-center">
      <div className="w-32 h-20 bg-secondary rounded-md flex items-center justify-center">
        {video.status === "READY" && isLoadingThumbs && (
          <Loader2 className="h-6 w-6 animate-spin" />
        )}
        {video.status === "READY" &&
          !isLoadingThumbs &&
          thumbnailUrls.length > 0 && (
            <img
              src={thumbnailUrls[0]}
              alt={`Thumbnail for ${video.name}`}
              className="w-full h-full object-cover rounded-md"
            />
          )}
        {video.status !== "READY" && (
          <ImageIcon className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      <div className="flex-grow">
        <p className="font-bold truncate">{video.name}</p>
        <p className="text-sm text-muted-foreground">
          {new Date(video.created_at).toLocaleString()}
        </p>
        <Badge variant={getStatusVariant()}>{video.status}</Badge>
      </div>

      <div className="flex items-center gap-2">
        {video.status === "READY" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            {isDownloading ? "Preparing..." : "Download"}
          </Button>
        )}
      </div>
    </div>
  );
}
