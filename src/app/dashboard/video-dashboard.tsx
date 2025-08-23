"use client";

import { type Video } from "./page";

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
          <p>{video.name}</p>
          <p>Status: {video.status}</p>
          <p>{new Date(video.created_at).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
