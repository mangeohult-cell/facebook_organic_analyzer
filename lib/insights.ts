import { Post, UploadedFile } from "@/types";

// ── Hjälpfunktioner ────────────────────────────────────────────

export function calcEngRate(post: Post): number {
  if (post.reach === 0) return 0;
  const eng = (post.reactions + post.comments + post.shares) || post.engagement;
  return (eng / post.reach) * 100;
}

export function calcVirality(post: Post): number {
  if (post.reach === 0) return 0;
  return (post.shares / post.reach) * 100;
}

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

// ── 1. Innehållstyp-insikter ───────────────────────────────────

export interface TypeInsight {
  type: string;
  count: number;
  avgReach: number;
  avgEngRate: number;
  avgVirality: number;
  reachMultiplier: number;   // vs. snittet för alla typer
  engMultiplier: number;
}

export function getTypeInsights(posts: Post[]): TypeInsight[] {
  const byType: Record<string, { reach: number[]; engRates: number[]; virality: number[] }> = {};

  for (const p of posts) {
    if (!byType[p.post_type]) byType[p.post_type] = { reach: [], engRates: [], virality: [] };
    byType[p.post_type].reach.push(p.reach);
    byType[p.post_type].engRates.push(calcEngRate(p));
    byType[p.post_type].virality.push(calcVirality(p));
  }

  const types = Object.entries(byType).map(([type, data]) => ({
    type,
    count: data.reach.length,
    avgReach: Math.round(avg(data.reach)),
    avgEngRate: avg(data.engRates),
    avgVirality: avg(data.virality),
  }));

  const overallAvgReach = avg(types.map((t) => t.avgReach));
  const overallAvgEng = avg(types.map((t) => t.avgEngRate));

  return types
    .map((t) => ({
      ...t,
      reachMultiplier: overallAvgReach > 0 ? t.avgReach / overallAvgReach : 1,
      engMultiplier: overallAvgEng > 0 ? t.avgEngRate / overallAvgEng : 1,
    }))
    .sort((a, b) => b.avgEngRate - a.avgEngRate);
}

export function getContentRecommendation(insights: TypeInsight[]): string | null {
  if (insights.length < 2) return null;
  const best = insights[0];
  const worst = insights[insights.length - 1];
  const multiplier = worst.avgEngRate > 0 ? best.avgEngRate / worst.avgEngRate : 0;
  if (multiplier < 1.2) return null;

  const typeLabels: Record<string, string> = {
    video: "Videor", image: "Bilder", link: "Länkdelningar", text: "Textinlägg",
  };
  const bestLabel = typeLabels[best.type] ?? best.type;
  const worstLabel = typeLabels[worst.type] ?? worst.type;

  return `${bestLabel} genererar ${multiplier.toFixed(1)}x högre engagement rate än ${worstLabel} för er sida.`;
}

// ── 2. Trendvarningar ──────────────────────────────────────────

export interface TrendAlert {
  type: "reach" | "engagement";
  drop: number; // % nedgång
  lastValue: number;
  avgValue: number;
}

export function getTrendAlerts(
  files: UploadedFile[],
  postsByFile: Record<string, Post[]>,
  threshold = 20
): TrendAlert[] {
  if (files.length < 2) return [];

  const stats = files.map((f) => {
    const posts = postsByFile[f.id] ?? [];
    const reach = posts.reduce((s, p) => s + p.reach, 0);
    const engRate = reach > 0
      ? (posts.reduce((s, p) => s + ((p.reactions + p.comments + p.shares) || p.engagement), 0) / reach) * 100
      : 0;
    return { reach, engRate };
  });

  const last = stats[0];
  const prev = stats.slice(1);
  const avgReach = avg(prev.map((s) => s.reach));
  const avgEngRate = avg(prev.map((s) => s.engRate));

  const alerts: TrendAlert[] = [];

  if (avgReach > 0) {
    const reachDrop = ((avgReach - last.reach) / avgReach) * 100;
    if (reachDrop >= threshold) {
      alerts.push({ type: "reach", drop: reachDrop, lastValue: last.reach, avgValue: avgReach });
    }
  }

  if (avgEngRate > 0) {
    const engDrop = ((avgEngRate - last.engRate) / avgEngRate) * 100;
    if (engDrop >= threshold) {
      alerts.push({ type: "engagement", drop: engDrop, lastValue: last.engRate, avgValue: avgEngRate });
    }
  }

  return alerts;
}

// ── 3. Nyckelords-insikter ─────────────────────────────────────

const STOP_WORDS = new Set([
  "och", "att", "det", "är", "en", "ett", "av", "som", "för", "på", "med",
  "till", "i", "den", "de", "du", "vi", "han", "hon", "sin", "sig", "inte",
  "men", "om", "så", "när", "hur", "vad", "var", "ska", "kan", "har", "hade",
  "vara", "bli", "från", "under", "efter", "än", "nu", "här", "där", "detta",
  "dessa", "din", "ditt", "dina", "vår", "era", "alla", "hela", "många",
  "ingen", "inga", "mer", "vid", "mot", "utan", "även", "också", "bara",
  "redan", "just", "då", "samt", "eller", "dock", "ändå", "aldrig", "alltid",
  "ibland", "ofta", "dels", "både", "ha", "år", "ni", "min", "mitt", "mina",
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "with", "is", "are", "was", "were", "be", "been", "this", "that", "these",
]);

export interface KeywordInsight {
  word: string;
  count: number;
  avgReach: number;
  avgEngRate: number;
}

export function getKeywordInsights(posts: Post[], limit = 12): KeywordInsight[] {
  const wordData: Record<string, { reaches: number[]; engRates: number[] }> = {};

  for (const p of posts) {
    const words = (p.title ?? "")
      .toLowerCase()
      .replace(/[^a-zåäö\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !STOP_WORDS.has(w));

    const unique = [...new Set(words)];
    for (const w of unique) {
      if (!wordData[w]) wordData[w] = { reaches: [], engRates: [] };
      wordData[w].reaches.push(p.reach);
      wordData[w].engRates.push(calcEngRate(p));
    }
  }

  return Object.entries(wordData)
    .filter(([, d]) => d.reaches.length >= 2)
    .map(([word, d]) => ({
      word,
      count: d.reaches.length,
      avgReach: Math.round(avg(d.reaches)),
      avgEngRate: avg(d.engRates),
    }))
    .sort((a, b) => b.avgReach - a.avgReach)
    .slice(0, limit);
}

// ── 4. Publiceringsfrekvens ────────────────────────────────────

export interface FrequencyRow {
  month: string;
  postCount: number;
  avgReach: number;
  avgEngRate: number;
  totalReach: number;
}

export function getFrequencyInsights(
  files: UploadedFile[],
  postsByFile: Record<string, Post[]>
): FrequencyRow[] {
  return [...files].reverse().map((f) => {
    const posts = postsByFile[f.id] ?? [];
    const totalReach = posts.reduce((s, p) => s + p.reach, 0);
    const avgReach = posts.length ? Math.round(totalReach / posts.length) : 0;
    const engRate = totalReach > 0
      ? (posts.reduce((s, p) => s + ((p.reactions + p.comments + p.shares) || p.engagement), 0) / totalReach) * 100
      : 0;
    return { month: f.month, postCount: posts.length, avgReach, avgEngRate: engRate, totalReach };
  });
}

// ── 5. Prestationsscore ────────────────────────────────────────

export function getPerformanceScore(
  post: Post,
  avgReach: number,
  avgEngRate: number
): number {
  if (avgReach === 0) return 0;
  const reachRatio = Math.min(post.reach / avgReach, 2);
  const postEng = calcEngRate(post);
  const engRatio = avgEngRate > 0 ? Math.min(postEng / avgEngRate, 2) : 1;
  return Math.round((reachRatio / 2) * 50 + (engRatio / 2) * 50);
}
