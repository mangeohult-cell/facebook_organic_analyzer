import Card from "@/components/shared/Card";
import Badge from "@/components/shared/Badge";
import { formatNumber } from "@/lib/utils";
import { Trophy } from "lucide-react";
import { Post } from "@/types";
import { calcEngRate, calcVirality } from "@/lib/insights";

function truncate(text: string, max = 60) {
  if (!text) return "(ingen titel)";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

type Metric = "reach" | "engagement_rate" | "virality";

interface TopPostsCardProps {
  posts?: Post[];
  metric?: Metric;
}

export default function TopPostsCard({ posts = [], metric = "reach" }: TopPostsCardProps) {
  const sorted = [...posts]
    .sort((a, b) => {
      if (metric === "engagement_rate") return calcEngRate(b) - calcEngRate(a);
      if (metric === "virality") return calcVirality(b) - calcVirality(a);
      return b.reach - a.reach;
    })
    .slice(0, 5);

  const label = metric === "reach" ? "Räckvidd" : metric === "virality" ? "Viralitet" : "Eng. rate";

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
                <p className="text-sm text-[#303942] font-medium">{truncate(post.title)}</p>
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
