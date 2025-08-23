"use client";

import { type Video } from "./page";
import VideoCard from "./video-card";

interface VideoDashboardPage {
  initialVideos: Video[];
}

export default function VideoDashboard({ initialVideos }: VideoDashboardPage) {
  if (initialVideos.length === 0) {
    return <p>No videos found</p>;
  }

  return (
    <div>
      {initialVideos.map((video) => (
        <div key={video.id} className="rounded-md p-2">
          <VideoCard key={video.id} video={video} />
        </div>
      ))}
    </div>
  );
}
