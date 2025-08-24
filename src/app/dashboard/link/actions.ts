//@ts-nocheck
// src/app/dashboard/links/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function deleteShareLink(linkId: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { failure: "Not authenticated" };
  }

  const { data: link, error: linkError } = await supabase
    .from("share_links")
    .select("id, videos(user_id)")
    .eq("id", linkId)
    .single();

  if (linkError || !link || link.videos?.user_id !== user.id) {
    return {
      failure: "Link not found or you do not have permission to delete it.",
    };
  }

  const { error: deleteError } = await supabase
    .from("share_links")
    .delete()
    .eq("id", linkId);

  if (deleteError) {
    console.error("Error deleting share link:", deleteError);
    return { failure: "Could not delete share link." };
  }

  revalidatePath("/dashboard/links");

  return { success: true };
}
