export const dynamic = "force-dynamic";

import Header from "@/components/layout/Header";
import TopPostsCard from "@/components/dashboard/TopPostsCard";
import UnderperformersCard from "@/components/dashboard/UnderperformersCard";
import ContentTypeChart from "@/components/dashboard/ContentTypeChart";
import EmptyState from "@/components/shared/EmptyState";
import { getFiles, getPostsByMonth, computeMonthStats, getContentTypeBreakdown } from "@/lib/data";
import { medianAndAvg, percentChange, engagementRate } from "@/lib/utils";
import { calcEngRate } from "@/lib/insights";
import { FileDown } from "lucide-react";
import Link from "next/link";
import MonthSelector from "@/components/month/MonthSelector";
import AllPostsTable from "@/components/month/AllPostsTable";
import PostMatrixCard from "@/components/dashboard/PostMatrixCard";
import MonthKpiSection from "@/components/month/MonthKpiSection";

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

  const currentMetrics = {
    reachPerPost: medianAndAvg(posts.map((p) => p.reach)),
    erPerPost: medianAndAvg(posts.map((p) => calcEngRate(p))),
    postCount: posts.length,
  };
  const prevMetrics = prevPosts.length ? {
    reachPerPost: medianAndAvg(prevPosts.map((p) => p.reach)),
    erPerPost: medianAndAvg(prevPosts.map((p) => calcEngRate(p))),
    postCount: prevPosts.length,
  } : null;

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
            <MonthKpiSection
              totalReach={stats.totalReach}
              totalEngagement={stats.totalEngagement}
              reachChange={reachChange}
              engChange={engChange}
              current={currentMetrics}
              prev={prevMetrics}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <TopPostsCard posts={posts} metric="reach" />
              <TopPostsCard posts={posts} metric="engagement_rate" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <UnderperformersCard posts={posts} mode="low_reach" />
              <UnderperformersCard posts={posts} mode="low_eng_rate" />
            </div>

            {posts.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-[#303942] mb-3">Innehållsanalys</h2>
                <PostMatrixCard posts={posts} />
              </div>
            )}

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
