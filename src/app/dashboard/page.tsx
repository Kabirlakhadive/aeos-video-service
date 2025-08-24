import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import VideoDashboard from "./video-dashboard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListVideo } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Your Videos</h1>
          <p className="text-muted-foreground">
            Here is a list of all your uploaded videos.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/dashboard/link">
            <ListVideo className="mr-2 h-4 w-4" />
            Manage All Links
          </Link>
        </Button>
      </div>

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
