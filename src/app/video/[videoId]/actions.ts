// src/app/video/[videoId]/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type CreateLinkPayload = {
  videoId: string;
  visibility: "PUBLIC" | "PRIVATE";
  emails: string[];
  expiry: "1h" | "12h" | "1d" | "30d" | "never";
};

function getExpiryTimestamp(expiry: CreateLinkPayload["expiry"]): Date | null {
  const now = new Date();
  switch (expiry) {
    case "1h":
      return new Date(now.setHours(now.getHours() + 1));
    case "12h":
      return new Date(now.setHours(now.getHours() + 12));
    case "1d":
      return new Date(now.setDate(now.getDate() + 1));
    case "30d":
      return new Date(now.setDate(now.getDate() + 30));
    case "never":
      return null;
  }
}

export async function createShareLink(payload: CreateLinkPayload) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { failure: "Not authenticated" };
  }

  const { data: video, error: videoError } = await supabase
    .from("videos")
    .select("id, name")
    .eq("id", payload.videoId)
    .eq("user_id", user.id)
    .single();

  if (videoError || !video) {
    return {
      failure: "Video not found or you do not have permission to share it.",
    };
  }

  const token = crypto.randomBytes(16).toString("hex");
  const expires_at = getExpiryTimestamp(payload.expiry);

  const { data, error } = await supabase
    .from("share_links")
    .insert({
      video_id: payload.videoId,
      token,
      visibility: payload.visibility,
      expires_at,
      whitelisted_emails:
        payload.visibility === "PRIVATE" ? payload.emails : null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating share link:", error);
    return { failure: "Could not create share link." };
  }

  if (payload.visibility === "PRIVATE" && payload.emails.length > 0) {
    const shareUrl = `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    }/share/${token}`;
    try {
      resend.emails.send({
        from: "onboarding@resend.dev",
        to: payload.emails,
        subject: `A video has been shared with you`,
        text: `${user.email} has shared the video "${video.name}" with you. Click the link to watch: ${shareUrl}`,
      });
      console.log("Share notification email sent to:", payload.emails);
    } catch (emailError) {
      console.error("Failed to send share notification email:", emailError);
    }
  }

  revalidatePath(`/video/${payload.videoId}`);
  return { success: data };
}
