"use server";

import { getAdminSupabase } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function saveFollowerCount(count: number): Promise<void> {
  const admin = getAdminSupabase();
  await admin
    .from("page_settings")
    .upsert(
      { key: "follower_count", value: String(count), updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  revalidatePath("/");
}
