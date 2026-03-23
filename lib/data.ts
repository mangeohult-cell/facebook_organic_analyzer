import { supabase } from "./supabase";
import { getAdminSupabase } from "./supabase-admin";
import { Post, UploadedFile, MonthStats } from "@/types";
import { engagementRate } from "./utils";

function withCtr(post: Omit<Post, "ctr">): Post {
  const clicks = post.link_clicks ?? 0;
  const ctr = post.reach > 0 && clicks > 0
    ? Math.round((clicks / post.reach) * 100 * 100) / 100
    : 0;
  return { ...post, link_clicks: clicks, ctr };
}

export async function getFiles(): Promise<UploadedFile[]> {
  const { data } = await supabase
    .from("files")
    .select("*")
    .order("uploaded_at", { ascending: false });
  return data ?? [];
}

export async function getPostsByFile(fileId: string): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("file_id", fileId)
    .order("reach", { ascending: false });
  return (data ?? []).map(withCtr);
}

export async function getAllPosts(): Promise<Post[]> {
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("reach", { ascending: false });
  return (data ?? []).map(withCtr);
}

export async function getPostsByMonth(month: string): Promise<Post[]> {
  const { data: files } = await supabase
    .from("files")
    .select("id")
    .eq("month", month);

  if (!files?.length) return [];

  const fileIds = files.map((f) => f.id);
  const { data } = await supabase
    .from("posts")
    .select("*")
    .in("file_id", fileIds)
    .order("reach", { ascending: false });
  return (data ?? []).map(withCtr);
}

export function computeMonthStats(month: string, posts: Post[]): MonthStats {
  const totalReach = posts.reduce((s, p) => s + p.reach, 0);
  const totalEngagement = posts.reduce((s, p) => s + p.engagement, 0);

  // Räkna ut vilken content-typ som har bäst genomsnittlig eng-rate
  const byType: Record<string, { reach: number; engagement: number }> = {};
  for (const p of posts) {
    if (!byType[p.post_type]) byType[p.post_type] = { reach: 0, engagement: 0 };
    byType[p.post_type].reach += p.reach;
    byType[p.post_type].engagement += p.engagement;
  }
  const bestPostType = Object.entries(byType).sort(
    (a, b) => engagementRate(b[1].engagement, b[1].reach) - engagementRate(a[1].engagement, a[1].reach)
  )[0]?.[0] ?? "-";

  return {
    month,
    totalReach,
    totalEngagement,
    postCount: posts.length,
    avgReach: posts.length ? Math.round(totalReach / posts.length) : 0,
    avgEngagement: posts.length ? Math.round(totalEngagement / posts.length) : 0,
    bestPostType,
  };
}

export function getContentTypeBreakdown(posts: Post[]) {
  const counts: Record<string, number> = {};
  for (const p of posts) {
    counts[p.post_type] = (counts[p.post_type] ?? 0) + 1;
  }
  const total = posts.length || 1;
  return Object.entries(counts).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.round((count / total) * 100),
  }));
}

export function getUnderperformers(posts: Post[], minReach = 3000, limit = 5) {
  return posts
    .filter((p) => p.reach >= minReach)
    .sort((a, b) => engagementRate(a.engagement, a.reach) - engagementRate(b.engagement, b.reach))
    .slice(0, limit);
}

export async function getFollowerCount(): Promise<number> {
  const { data } = await getAdminSupabase()
    .from("page_settings")
    .select("value")
    .eq("key", "follower_count")
    .single();
  const n = data ? parseInt(data.value, 10) : 0;
  return isNaN(n) ? 0 : n;
}

export function getTrendData(files: UploadedFile[], allPosts: Post[]) {
  const postsByFile: Record<string, Post[]> = {};
  for (const p of allPosts) {
    if (!postsByFile[p.file_id]) postsByFile[p.file_id] = [];
    postsByFile[p.file_id].push(p);
  }

  return files
    .slice()
    .reverse()
    .map((f) => {
      const posts = postsByFile[f.id] ?? [];
      return {
        month: f.month.split(" ")[0], // "Januari 2025" → "Januari"
        reach: posts.reduce((s, p) => s + p.reach, 0),
        engagement: posts.reduce((s, p) => s + p.engagement, 0),
      };
    });
}
