export const dynamic = "force-dynamic";

import { getFiles, getAllPosts, getPostsByMonth, computeMonthStats } from "@/lib/data";
import { formatNumber } from "@/lib/utils";
import { redirect } from "next/navigation";
import PrintButton from "@/components/export/PrintButton";
import { Post } from "@/types";

interface Props {
  searchParams: Promise<{ type?: string; month?: string; year?: string }>;
}

function calcEngRate(post: Post) {
  if (post.reach === 0) return 0;
  const eng = (post.reactions + post.comments + post.shares) || post.engagement;
  return (eng / post.reach) * 100;
}

function totalEngRate(posts: Post[]) {
  const reach = posts.reduce((s, p) => s + p.reach, 0);
  const eng = posts.reduce((s, p) => s + ((p.reactions + p.comments + p.shares) || p.engagement), 0);
  return reach > 0 ? (eng / reach) * 100 : 0;
}

function truncate(text: string, max = 70) {
  if (!text) return "(ingen titel)";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default async function ExportPage({ searchParams }: Props) {
  const { type = "month", month, year } = await searchParams;
  const [files, allPosts] = await Promise.all([getFiles(), getAllPosts()]);

  if (files.length === 0) redirect("/upload");

  const months = files.map((f) => f.month);
  const currentYear = year ?? new Date().getFullYear().toString();

  // ── Månadsrapport ──────────────────────────────────────────────
  if (type === "month") {
    const activeMonth = month ?? months[0];
    const posts = await getPostsByMonth(activeMonth);
    const stats = computeMonthStats(activeMonth, posts);
    const engRate = totalEngRate(posts);
    const topByReach = [...posts].sort((a, b) => b.reach - a.reach).slice(0, 10);
    const topByEngRate = [...posts].sort((a, b) => calcEngRate(b) - calcEngRate(a)).slice(0, 10);

    return (
      <ExportLayout title={`Månadsrapport – ${activeMonth}`}>
        <KpiRow stats={[
          { label: "Total räckvidd", value: formatNumber(stats.totalReach) },
          { label: "Totalt engagemang", value: formatNumber(stats.totalEngagement) },
          { label: "Engagement rate", value: `${engRate.toFixed(2)}%` },
          { label: "Antal inlägg", value: stats.postCount.toString() },
          { label: "Snitt räckvidd", value: formatNumber(stats.avgReach) },
        ]} />

        <PostTable title="Top 10 – Högst räckvidd" posts={topByReach} />
        <PostTable title="Top 10 – Högst engagement rate" posts={topByEngRate} sortByEngRate />
      </ExportLayout>
    );
  }

  // ── YTD-rapport ────────────────────────────────────────────────
  const ytdFiles = files.filter((f) => f.month.includes(currentYear));
  const ytdMonths = ytdFiles.map((f) => f.month);

  const ytdPostsArr = await Promise.all(ytdMonths.map((m) => getPostsByMonth(m)));
  const ytdPosts = ytdPostsArr.flat();

  const totalReach = ytdPosts.reduce((s, p) => s + p.reach, 0);
  const totalEng = ytdPosts.reduce((s, p) => s + ((p.reactions + p.comments + p.shares) || p.engagement), 0);
  const engRate = totalReach > 0 ? (totalEng / totalReach) * 100 : 0;
  const avgReach = ytdPosts.length ? Math.round(totalReach / ytdPosts.length) : 0;

  const monthRows = ytdFiles.map((f, i) => {
    const posts = ytdPostsArr[i];
    const stats = computeMonthStats(f.month, posts);
    const rate = totalEngRate(posts);
    return { ...stats, engRate: rate };
  });

  const topByReach = [...ytdPosts].sort((a, b) => b.reach - a.reach).slice(0, 10);
  const topByEngRate = [...ytdPosts].sort((a, b) => calcEngRate(b) - calcEngRate(a)).slice(0, 10);

  return (
    <ExportLayout title={`YTD-rapport – ${currentYear}`}>
      <KpiRow stats={[
        { label: "Total räckvidd", value: formatNumber(totalReach) },
        { label: "Totalt engagemang", value: formatNumber(totalEng) },
        { label: "Engagement rate", value: `${engRate.toFixed(2)}%` },
        { label: "Antal inlägg", value: ytdPosts.length.toString() },
        { label: "Snitt räckvidd", value: formatNumber(avgReach) },
      ]} />

      {/* Månadsöversikt */}
      <section className="mb-8">
        <h2 className="text-base font-bold text-[#303942] mb-3 pb-1 border-b border-gray-200">
          Månadsöversikt
        </h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#F5F5F0]">
              <Th>Månad</Th>
              <Th>Räckvidd</Th>
              <Th>Engagemang</Th>
              <Th>Eng. rate</Th>
              <Th>Inlägg</Th>
              <Th>Snitt räckvidd</Th>
            </tr>
          </thead>
          <tbody>
            {monthRows.map((r) => (
              <tr key={r.month} className="border-b border-gray-100">
                <Td bold>{r.month}</Td>
                <Td>{formatNumber(r.totalReach)}</Td>
                <Td>{formatNumber(r.totalEngagement)}</Td>
                <Td highlight>{r.engRate.toFixed(2)}%</Td>
                <Td>{r.postCount}</Td>
                <Td>{formatNumber(r.avgReach)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <PostTable title="Top 10 – Högst räckvidd (YTD)" posts={topByReach} />
      <PostTable title="Top 10 – Högst engagement rate (YTD)" posts={topByEngRate} sortByEngRate />
    </ExportLayout>
  );
}

// ── Layout ─────────────────────────────────────────────────────
function ExportLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="min-h-screen bg-white">
      {/* Print-knapp – döljs vid utskrift */}
      <div className="print:hidden bg-[#303942] px-8 py-3 flex items-center justify-between">
        <span className="text-white text-sm font-medium">Facebook Organic Analyzer – Export</span>
        <PrintButton />
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Rubrik */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-[#ED5821]">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Facebook Organic Analyzer</p>
            <h1 className="text-2xl font-bold text-[#303942]">{title}</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">Exporterat {today}</p>
        </div>

        {children}
      </div>
    </div>
  );
}

// ── KPI-rad ────────────────────────────────────────────────────
function KpiRow({ stats }: { stats: { label: string; value: string }[] }) {
  return (
    <div className="grid grid-cols-5 gap-3 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="bg-[#F5F5F0] rounded-lg p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">{s.label}</p>
          <p className="text-lg font-bold text-[#303942]">{s.value}</p>
        </div>
      ))}
    </div>
  );
}

// ── Inläggstabell ──────────────────────────────────────────────
function PostTable({ title, posts, sortByEngRate = false }: { title: string; posts: Post[]; sortByEngRate?: boolean }) {
  return (
    <section className="mb-8 break-inside-avoid">
      <h2 className="text-base font-bold text-[#303942] mb-3 pb-1 border-b border-gray-200">{title}</h2>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#F5F5F0]">
            <th className="text-left px-3 py-2 font-semibold text-gray-600 w-8">#</th>
            <th className="text-left px-3 py-2 font-semibold text-gray-600">Inlägg</th>
            <Th>Räckvidd</Th>
            <Th>Reakt.</Th>
            <Th>Komm.</Th>
            <Th>Deln.</Th>
            <Th>Eng. rate</Th>
            <Th>Typ</Th>
          </tr>
        </thead>
        <tbody>
          {posts.map((p, i) => {
            const rate = calcEngRate(p);
            return (
              <tr key={p.id} className="border-b border-gray-100">
                <td className="px-3 py-2 text-gray-400 text-xs">{i + 1}</td>
                <td className="px-3 py-2 text-[#303942] text-xs">{truncate(p.title)}</td>
                <Td>{formatNumber(p.reach)}</Td>
                <Td>{formatNumber(p.reactions)}</Td>
                <Td>{formatNumber(p.comments)}</Td>
                <Td>{formatNumber(p.shares)}</Td>
                <Td highlight>{rate.toFixed(2)}%</Td>
                <Td>{p.post_type}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="text-right px-3 py-2 font-semibold text-gray-600">{children}</th>;
}
function Td({ children, bold, highlight }: { children: React.ReactNode; bold?: boolean; highlight?: boolean }) {
  return (
    <td className={`text-right px-3 py-2 text-xs ${bold ? "font-semibold text-[#303942]" : ""} ${highlight ? "text-[#ED5821] font-semibold" : "text-gray-600"}`}>
      {children}
    </td>
  );
}
