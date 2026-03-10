export const dynamic = "force-dynamic";

import Header from "@/components/layout/Header";
import KpiCard from "@/components/dashboard/KpiCard";
import TrendChart from "@/components/dashboard/TrendChart";
import ContentTypeChart from "@/components/dashboard/ContentTypeChart";
import TopPostsCard from "@/components/dashboard/TopPostsCard";
import UnderperformersCard from "@/components/dashboard/UnderperformersCard";
import BestMonthBadge from "@/components/dashboard/BestMonthBadge";
import ContentRecommendationCard from "@/components/dashboard/ContentRecommendationCard";
import TrendAlert from "@/components/dashboard/TrendAlert";
import KeywordInsights from "@/components/dashboard/KeywordInsights";
import FrequencyInsights from "@/components/dashboard/FrequencyInsights";
import EmptyState from "@/components/shared/EmptyState";
import { BarChart2, Users, TrendingUp, Activity, FileDown } from "lucide-react";
import Link from "next/link";
import {
  getAllPosts,
  getFiles,
  getContentTypeBreakdown,
  getTrendData,
  computeMonthStats,
} from "@/lib/data";
import {
  getTypeInsights,
  getContentRecommendation,
  getTrendAlerts,
  getKeywordInsights,
  getFrequencyInsights,
  calcEngRate,
} from "@/lib/insights";
import { formatNumber } from "@/lib/utils";

export default async function DashboardPage() {
  const [files, allPosts] = await Promise.all([getFiles(), getAllPosts()]);

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

  // KPIs
  const totalReach = allPosts.reduce((s, p) => s + p.reach, 0);
  const totalEngagement = allPosts.reduce((s, p) => s + ((p.reactions + p.comments + p.shares) || p.engagement), 0);
  const avgReach = Math.round(totalReach / allPosts.length);
  const engRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;
  const avgEngRate = allPosts.reduce((s, p) => s + calcEngRate(p), 0) / allPosts.length;

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
  const trendAlerts = getTrendAlerts(files, postsByFile);
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

        {/* Trendvarningar */}
        {trendAlerts.length > 0 && (
          <TrendAlert alerts={trendAlerts} lastMonth={months[0] ?? ""} />
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          <KpiCard label="Total räckvidd" value={totalReach} icon={<BarChart2 className="w-5 h-5" />} />
          <KpiCard label="Totalt engagemang" value={totalEngagement} icon={<Activity className="w-5 h-5" />} />
          <KpiCard label="Engagement rate" value={`${engRate.toFixed(1)}%`} icon={<TrendingUp className="w-5 h-5" />} />
          <KpiCard label="Antal inlägg" value={allPosts.length} icon={<Users className="w-5 h-5" />} />
          <KpiCard label="Snitt räckvidd/inlägg" value={avgReach} icon={<TrendingUp className="w-5 h-5" />} />
        </div>

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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <TopPostsCard posts={allPosts} metric="reach" />
          <TopPostsCard posts={allPosts} metric="engagement_rate" />
          <TopPostsCard posts={allPosts} metric="virality" />
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
