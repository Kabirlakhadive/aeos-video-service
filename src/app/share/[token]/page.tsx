// src/app/share/[token]/page.tsx

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import SharedVideoPlayer from "./share-video-player";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function SharePage({
  params,
}: {
  params: { token: string };
}) {
  const supabase = createClient();
  const { token } = params;

  // Fetch all necessary data at the top level
  const linkPromise = supabase
    .from("share_links")
    .select("*, videos(id, name, status, storage_path)")
    .eq("token", token)
    .single();

  const userPromise = supabase.auth.getUser();

  // Await promises concurrently for better performance
  const [
    { data: link, error: linkError },
    {
      data: { user },
    },
  ] = await Promise.all([linkPromise, userPromise]);

  // --- Handle all error and access logic on the server ---

  if (linkError || !link) {
    notFound();
  }

  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return (
      <div>
        <h1>Link Expired</h1>
        <p>This share link has expired.</p>
      </div>
    );
  }

  if (link.visibility === "PRIVATE") {
    if (!user) {
      return (
        <div>
          <h1>Access Denied</h1>
          <p>You must be logged in to view this private video.</p>
        </div>
      );
    }
    if (!link.whitelisted_emails?.includes(user.email!)) {
      return (
        <div>
          <h1>Access Denied</h1>
          <p>You do not have permission to view this video.</p>
        </div>
      );
    }
  }

  const video = link.videos as {
    id: string;
    name: string;
    status: string;
    storage_path: string;
  };
  if (!video || video.status !== "READY") {
    return (
      <div>
        <h1>Video Not Available</h1>
        <p>This video is not yet ready for viewing.</p>
      </div>
    );
  }

  // --- If all checks pass, prepare the final props ---

  let videoUrl = "";
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: video.storage_path,
    });
    videoUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (err) {
    console.error("Error generating signed URL:", err);
    return (
      <div>
        <h1>Error</h1>
        <p>Could not load video.</p>
      </div>
    );
  }

  // --- Render the simple Client Component with clean props ---

  return (
    <SharedVideoPlayer
      videoName={video.name}
      videoUrl={videoUrl}
      linkId={link.id}
    />
  );
}
