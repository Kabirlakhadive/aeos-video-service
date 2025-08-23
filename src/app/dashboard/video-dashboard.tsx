"use client";

import { useEffect, useState } from "react";
import { type Video } from "./page";
import VideoCard from "./video-card";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface VideoDashboardProps {
  initialVideos: Video[];
}

export default function VideoDashboard({ initialVideos }: VideoDashboardProps) {
  const [videos, setVideos] = useState(initialVideos);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("videos_follow_up")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "videos",
        },
        (payload) => {
          console.log("Realtime update received!", payload);
          const updatedVideo = payload.new as Video;

          setVideos((currentVideos) =>
            currentVideos.map((video) =>
              video.id === updatedVideo.id ? updatedVideo : video
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, videos]);

  if (videos.length === 0) {
    return <p>You have not uploaded any videos yet.</p>;
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <Link key={video.id} href={`/video/${video.id}`} className="block">
          <VideoCard video={video} />
        </Link>
      ))}
    </div>
  );
}
