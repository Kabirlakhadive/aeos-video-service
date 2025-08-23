import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import VideoDashboard from "./video-dashboard";

export type Video = {
  id: string;
  name: string;
  status: "PROCESSING" | "READY" | "FAILED";
  created_at: string;
  thumbnail_urls: string[] | null;
  storage_path: string;
};

export default async function DashboardPage() {
  const videos = await getVideos();

  return (
    <div>
      <h1>Your Videos</h1>
      <VideoDashboard initialVideos={videos} />
    </div>
  );
}

async function getVideos() {
  const supabase = createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("videos")
    .select("id,name,status,created_at,thumbnail_urls,storage_path")
    .eq("user_id", session.user.id)
    .order("created_at");

  if (error) {
    console.error("Error getting videos", error);
    return [];
  }

  return data as Video[];
}
