// src/app/share/[token]/share-video-player.tsx

"use client";

import { useEffect } from "react";
import { updateLastViewed } from "./actions"; // Import the Server Action

interface SharedVideoPlayerProps {
  videoName: string;
  videoUrl: string;
  linkId: string;
}

export default function SharedVideoPlayer({
  videoName,
  videoUrl,
  linkId,
}: SharedVideoPlayerProps) {
  // Use useEffect to call the server action once after the component mounts.
  useEffect(() => {
    updateLastViewed(linkId);
  }, [linkId]);

  return (
    <div>
      <h1>{videoName}</h1>
      <video controls preload="auto" className="w-full bg-black">
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
