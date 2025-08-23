"use server";

import { createClient } from "@/lib/supabase/server";
import { fail } from "assert";
import crypto from "crypto";
import { revalidatePath } from "next/cache";

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
    default:
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
    .select("id")
    .eq("id", payload.videoId)
    .eq("user_id", user.id)
    .single();

  if (videoError || !video) {
    return { failure: "Video not found" };
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
    console.error("Error while creating share link:", error);
    return { failure: "Could not create a share link." };
  }

  revalidatePath(`/video/${payload.videoId}`);

  return { success: data };
}
