// src/app/share/[token]/actions.ts

"use server";

import { createClient } from "@/lib/supabase/server";

export async function updateLastViewed(linkId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("share_links")
    .update({ last_viewed_at: new Date().toISOString() })
    .eq("id", linkId);

  if (error) {
    console.error("Failed to update last_viewed_at:", error.message);
  }
}
