export const dynamic = "force-dynamic";

import Header from "@/components/layout/Header";
import KpiSection, { MonthMetrics } from "@/components/dashboard/KpiSection";
import TrendChart from "@/components/dashboard/TrendChart";
import ContentTypeChart from "@/components/dashboard/ContentTypeChart";
import TopPostsCard from "@/components/dashboard/TopPostsCard";
import UnderperformersCard from "@/components/dashboard/UnderperformersCard";
import BestMonthBadge from "@/components/dashboard/BestMonthBadge";
import ContentRecommendationCard from "@/components/dashboard/ContentRecommendationCard";
import KeywordInsights from "@/components/dashboard/KeywordInsights";
import FrequencyInsights from "@/components/dashboard/FrequencyInsights";
import EmptyState from "@/components/shared/EmptyState";
import { FileDown } from "lucide-react";
import Link from "next/link";
import {
  getAllPosts,
  getFiles,
  getFollowerCount,
  getContentTypeBreakdown,
  getTrendData,
  computeMonthStats,
} from "@/lib/data";
import {
  getTypeInsights,
  getContentRecommendation,
  getKeywordInsights,
  getFrequencyInsights,
  calcEngRate,
} from "@/lib/insights";
import { Post } from "@/types";

function medianAndAvg(values: number[]): { median: number; avg: number } {
  if (values.length === 0) return { median: 0, avg: 0 };
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  return { median, avg };
}

function buildMonthMetrics(posts: Post[]): MonthMetrics {
  const linkPosts = posts.filter((p) => p.link_clicks > 0);
  return {
    reach:    medianAndAvg(posts.map((p) => p.reach)),
    er:       medianAndAvg(posts.map((p) => calcEngRate(p))),
    ctr:      medianAndAvg(linkPosts.map((p) => p.ctr)),
    virality: medianAndAvg(posts.map((p) => p.reach > 0 ? (p.shares / p.reach) * 100 : 0)),
    shares:   medianAndAvg(posts.map((p) => p.shares)),
    postCount: posts.length,
    linkPostCount: linkPosts.length,
  };
}

export default async function DashboardPage() {
  const [files, allPosts, followerCount] = await Promise.all([
    getFiles(),
    getAllPosts(),
    getFollowerCount(),
  ]);

  if (allPosts.length === 0) {
    return (
      <>
        <Header title="Dashboard" />
        <div className="p-6">
          <EmptyState
            title="Ingen data ännu"
            description="Ladda upp Facebook Insights CSV-filer för att se statistik."
          />
        </div>
      </>
    );
  }

  const months = files.map((f) => f.month);

  // Bygg postsByFile en gång – används av flera beräkningar
  const postsByFile: Record<string, typeof allPosts> = {};
  for (const p of allPosts) {
    if (!postsByFile[p.file_id]) postsByFile[p.file_id] = [];
    postsByFile[p.file_id].push(p);
  }

  // KPIs – totaler (alla perioder)
  const totalReach = allPosts.reduce((s, p) => s + p.reach, 0);
  const totalEngagement = allPosts.reduce((s, p) => s + ((p.reactions + p.comments + p.shares) || p.engagement), 0);

  // Per-inlägg median/snitt för senaste resp. föregående månad
  const currentMetrics = buildMonthMetrics(postsByFile[files[0]?.id] ?? []);
  const prevMetrics = files[1] ? buildMonthMetrics(postsByFile[files[1].id] ?? []) : null;

  // Charts
  const contentTypes = getContentTypeBreakdown(allPosts);
  const trendData = getTrendData(files, allPosts);

  // Bästa månaden
  const bestFile = files
    .map((f) => ({ file: f, stats: computeMonthStats(f.month, postsByFile[f.id] ?? []) }))
    .sort((a, b) => b.stats.totalReach - a.stats.totalReach)[0];

  // Insikter
  const typeInsights = getTypeInsights(allPosts);
  const recommendation = getContentRecommendation(typeInsights);
  const keywords = getKeywordInsights(allPosts);
  const frequencyRows = getFrequencyInsights(files, postsByFile);

  return (
    <>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* Export-knappar */}
        <div className="flex gap-3 justify-end">
          <Link
            href={`/export?type=month&month=${encodeURIComponent(months[0] ?? "")}`}
            target="_blank"
            className="flex items-center gap-2 border border-gray-200 text-[#303942] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#F5F5F0] transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Exportera senaste månaden
          </Link>
          <Link
            href={`/export?type=ytd&year=${new Date().getFullYear()}`}
            target="_blank"
            className="flex items-center gap-2 bg-[#ED5821] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#d94d1d] transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Exportera YTD
          </Link>
        </div>

        {/* KPI Cards */}
        <KpiSection
          totalReach={totalReach}
          totalEngagement={totalEngagement}
          allPostCount={allPosts.length}
          followerCount={followerCount}
          current={currentMetrics}
          prev={prevMetrics}
        />

        {/* Best Month */}
        {bestFile && (
          <BestMonthBadge
            month={bestFile.file.month}
            reach={bestFile.stats.totalReach}
            engagement={bestFile.stats.totalEngagement}
          />
        )}

        {/* Charts + Innehållstyp-analys */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            <TrendChart data={trendData} />
          </div>
          <ContentTypeChart data={contentTypes} />
        </div>

        {/* Innehållsrekommendation */}
        <ContentRecommendationCard insights={typeInsights} recommendation={recommendation} />

        {/* Top 5 */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <TopPostsCard posts={allPosts} metric="reach" />
          <TopPostsCard posts={allPosts} metric="engagement_rate" />
          <TopPostsCard posts={allPosts} metric="virality" />
          <TopPostsCard posts={allPosts} metric="ctr" />
        </div>

        {/* Underpresterare */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <UnderperformersCard posts={allPosts} mode="low_reach" />
          <UnderperformersCard posts={allPosts} mode="low_eng_rate" />
        </div>

        {/* Nyckelord + Publiceringsfrekvens */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <KeywordInsights keywords={keywords} />
          <FrequencyInsights rows={frequencyRows} />
        </div>

      </div>
    </>
  );
}
