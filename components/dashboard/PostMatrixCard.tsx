"use client";

import { Share2 } from "lucide-react";
import { Post } from "@/types";
import Card from "@/components/shared/Card";
import { formatNumber } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function percentile90(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(Math.floor(0.9 * sorted.length), sorted.length - 1)];
}

function postER(post: Post): number {
  return post.reach > 0 ? (post.engagement / post.reach) * 100 : 0;
}

function truncate(text: string, max = 55) {
  if (!text) return "(ingen titel)";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface PostMatrixCardProps {
  posts: Post[];
}

export default function PostMatrixCard({ posts }: PostMatrixCardProps) {
  if (posts.length === 0) return null;

  // ── Thresholds ──
  const allERs      = posts.map(postER);
  const linkPosts   = posts.filter((p) => p.link_clicks > 0);
  const medianReach = median(posts.map((p) => p.reach));
  const medianER    = median(allERs);
  const medianCTR   = median(linkPosts.map((p) => p.ctr));
  const p90ER       = percentile90(allERs);

  // Top-25% shares threshold
  const sharesSorted = [...posts.map((p) => p.shares)].sort((a, b) => a - b);
  const p75Shares = sharesSorted[Math.floor(0.75 * sharesSorted.length)];

  const rows = posts.map((post) => ({ post, er: postER(post) }));

  return (
    <Card>
      {/* Header */}
      <div className="flex items-baseline gap-3 mb-4">
        <h2 className="text-base font-semibold text-[#303942]">Innehållsanalys</h2>
        <span className="text-xs text-gray-400">{posts.length} inlägg</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#F5F5F0]">
              <th className="text-left py-2 px-3 text-xs font-semibold text-[#303942] rounded-l-lg">Titel</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-[#303942]">Räckvidd</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-[#303942]">ER%</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-[#303942]">CTR%</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-[#303942] rounded-r-lg">Delningar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ post, er }) => (
              <tr
                key={post.id}
                className="border-b border-gray-50 last:border-0 hover:bg-[#F5F5F0] transition-colors"
              >
                <td className="py-2.5 px-3">
                  <span className="text-[#303942] font-medium">{truncate(post.title)}</span>
                </td>
                <td className="py-2.5 px-3 text-right text-gray-600 tabular-nums">
                  {formatNumber(post.reach)}
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums">
                  <span className="font-semibold text-[#ED5821]">{er.toFixed(2)}%</span>
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums">
                  {post.link_clicks > 0
                    ? <span className="font-semibold text-[#CDAC50]">{post.ctr.toFixed(2)}%</span>
                    : <span className="text-gray-300">–</span>
                  }
                </td>
                <td className="py-2.5 px-3 text-right tabular-nums">
                  {post.shares > 0 && post.shares >= p75Shares ? (
                    <span className="inline-flex items-center justify-end gap-1 font-semibold text-[#ED5821]">
                      <Share2 className="w-3 h-3 flex-shrink-0" />
                      {post.shares}
                    </span>
                  ) : (
                    <span className="text-gray-600">{post.shares}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Referensvärden denna period */}
      <div className="mt-5 border-t border-gray-100 pt-4">
        <p className="text-xs font-semibold text-[#303942] uppercase tracking-wide mb-2">
          Referensvärden denna period
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="bg-white border border-gray-100 rounded-lg px-3 py-2.5">
            <p className="text-xs font-semibold text-[#303942]">Median räckvidd</p>
            <p className="text-xs text-gray-500 mt-0.5">{formatNumber(Math.round(medianReach))} unika personer</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-lg px-3 py-2.5">
            <p className="text-xs font-semibold text-[#303942]">Median ER</p>
            <p className="text-xs text-gray-500 mt-0.5">{medianER.toFixed(2)}%</p>
          </div>
          {linkPosts.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-lg px-3 py-2.5">
              <p className="text-xs font-semibold text-[#303942]">Median CTR</p>
              <p className="text-xs text-gray-500 mt-0.5">{medianCTR.toFixed(2)}% bland {linkPosts.length} länkinlägg</p>
            </div>
          )}
          <div className="bg-white border border-gray-100 rounded-lg px-3 py-2.5">
            <p className="text-xs font-semibold text-[#303942]">Topp 10% ER</p>
            <p className="text-xs text-gray-500 mt-0.5">Över {p90ER.toFixed(2)}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
