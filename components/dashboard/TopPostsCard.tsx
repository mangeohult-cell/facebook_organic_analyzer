import Card from "@/components/shared/Card";
import Badge from "@/components/shared/Badge";
import { formatNumber } from "@/lib/utils";
import { Trophy, ExternalLink } from "lucide-react";
import { Post } from "@/types";
import { calcEngRate, calcVirality } from "@/lib/insights";

function truncate(text: string, max = 60) {
  if (!text) return "(ingen titel)";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

type Metric = "reach" | "engagement_rate" | "virality" | "ctr";

interface TopPostsCardProps {
  posts?: Post[];
  metric?: Metric;
}

export default function TopPostsCard({ posts = [], metric = "reach" }: TopPostsCardProps) {
  const source = metric === "ctr" ? posts.filter((p) => p.link_clicks > 0) : posts;

  const sorted = [...source]
    .sort((a, b) => {
      let diff = 0;
      if (metric === "engagement_rate") diff = calcEngRate(b) - calcEngRate(a);
      else if (metric === "virality") diff = calcVirality(b) - calcVirality(a);
      else if (metric === "ctr") diff = b.ctr - a.ctr;
      else diff = b.reach - a.reach;
      // Stable tiebreaker – same order on server and client
      return diff !== 0 ? diff : a.id < b.id ? -1 : 1;
    })
    .slice(0, 5);

  const label =
    metric === "reach" ? "Räckvidd" :
    metric === "virality" ? "Viralitet" :
    metric === "ctr" ? "CTR" :
    "Eng. rate";

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-4 h-4 text-[#CDAC50]" />
        <h2 className="text-base font-semibold text-[#303942]">
          Top 5 – Högst {label}
        </h2>
      </div>
      <div className="space-y-2">
        {sorted.map((post, i) => {
          const rate = calcEngRate(post);
          const hasLinkClicks = post.link_clicks > 0;
          return (
            <div key={post.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
              <span
                className={`w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${
                  i === 0 ? "bg-[#CDAC50] text-white" : "bg-[#F5F5F0] text-[#303942]"
                }`}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm text-[#303942] font-medium">{truncate(post.title)}</p>
                  {hasLinkClicks && (
                    <ExternalLink className="w-3 h-3 flex-shrink-0 text-[#CDAC50]" />
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-gray-500">
                    Räckvidd: <strong>{formatNumber(post.reach)}</strong>
                  </span>
                  <span className="text-xs text-gray-500">
                    Eng: <strong className="text-[#ED5821]">{rate.toFixed(2)}%</strong>
                  </span>
                  {metric === "virality" && (
                    <span className="text-xs text-gray-500">
                      Viral: <strong className="text-[#CDAC50]">{calcVirality(post).toFixed(2)}%</strong>
                    </span>
                  )}
                  {hasLinkClicks && (
                    <>
                      <span className="text-xs text-gray-500">
                        Klick: <strong>{formatNumber(post.link_clicks)}</strong>
                      </span>
                      <span className="text-xs text-gray-500">
                        CTR: <strong className="text-[#CDAC50]">{post.ctr.toFixed(2)}%</strong>
                      </span>
                    </>
                  )}
                  <Badge variant="gray">{post.post_type}</Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
