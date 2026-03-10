export const dynamic = "force-dynamic";

import Header from "@/components/layout/Header";
import KpiCard from "@/components/dashboard/KpiCard";
import TopPostsCard from "@/components/dashboard/TopPostsCard";
import UnderperformersCard from "@/components/dashboard/UnderperformersCard";
import ContentTypeChart from "@/components/dashboard/ContentTypeChart";
import EmptyState from "@/components/shared/EmptyState";
import Card from "@/components/shared/Card";
import { getFiles, getPostsByMonth, computeMonthStats, getContentTypeBreakdown } from "@/lib/data";
import { engagementRate, percentChange } from "@/lib/utils";
import { BarChart2, Activity, Users, TrendingUp, FileDown } from "lucide-react";
import Link from "next/link";
import MonthSelector from "@/components/month/MonthSelector";
import AllPostsTable from "@/components/month/AllPostsTable";

interface Props {
  searchParams: Promise<{ month?: string }>;
}

export default async function MonthPage({ searchParams }: Props) {
  const { month: selectedMonth } = await searchParams;
  const files = await getFiles();

  if (files.length === 0) {
    return (
      <>
        <Header title="Månadsvy" />
        <div className="p-6">
          <EmptyState title="Ingen data" description="Ladda upp CSV-filer för att se månadsstatistik." />
        </div>
      </>
    );
  }

  const months = files.map((f) => f.month);
  const activeMonth = selectedMonth ?? months[0];
  const activeIndex = months.indexOf(activeMonth);

  const [posts, prevPosts] = await Promise.all([
    getPostsByMonth(activeMonth),
    activeIndex < months.length - 1 ? getPostsByMonth(months[activeIndex + 1]) : Promise.resolve([]),
  ]);

  const stats = computeMonthStats(activeMonth, posts);
  const prevStats = prevPosts.length ? computeMonthStats(months[activeIndex + 1], prevPosts) : null;

  const reachChange = prevStats ? percentChange(stats.totalReach, prevStats.totalReach) : undefined;
  const engChange = prevStats ? percentChange(stats.totalEngagement, prevStats.totalEngagement) : undefined;
  const engRate = engagementRate(stats.totalEngagement, stats.totalReach);

  const contentTypes = getContentTypeBreakdown(posts);

  return (
    <>
      <Header title="Månadsvy" />
      <div className="p-6 space-y-6">

        <div className="flex items-center justify-between">
          <MonthSelector months={months} selected={activeMonth} />
          <Link
            href={`/export?type=month&month=${encodeURIComponent(activeMonth)}`}
            target="_blank"
            className="flex items-center gap-2 border border-gray-200 text-[#303942] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#F5F5F0] transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Exportera PDF
          </Link>
        </div>

        {posts.length === 0 ? (
          <EmptyState title="Inga inlägg" description={`Inga inlägg hittades för ${activeMonth}.`} />
        ) : (
          <>
            <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
              <KpiCard label="Total räckvidd" value={stats.totalReach} change={reachChange} icon={<BarChart2 className="w-5 h-5" />} />
              <KpiCard label="Totalt engagemang" value={stats.totalEngagement} change={engChange} icon={<Activity className="w-5 h-5" />} />
              <KpiCard label="Engagement rate" value={`${engRate.toFixed(1)}%`} icon={<TrendingUp className="w-5 h-5" />} />
              <KpiCard label="Antal inlägg" value={stats.postCount} icon={<Users className="w-5 h-5" />} />
              <KpiCard label="Snitt räckvidd/inlägg" value={stats.avgReach} icon={<TrendingUp className="w-5 h-5" />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <TopPostsCard posts={posts} metric="reach" />
              <TopPostsCard posts={posts} metric="engagement_rate" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <UnderperformersCard posts={posts} mode="low_reach" />
              <UnderperformersCard posts={posts} mode="low_eng_rate" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              <div className="xl:col-span-2">
                <AllPostsTable posts={posts} avgReach={stats.avgReach} avgEngRate={engRate} />
              </div>
              <ContentTypeChart data={contentTypes} />
            </div>
          </>
        )}
      </div>
    </>
  );
}
