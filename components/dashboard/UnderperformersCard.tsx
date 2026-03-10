import Card from "@/components/shared/Card";
import Badge from "@/components/shared/Badge";
import { formatNumber } from "@/lib/utils";
import { TrendingDown, AlertTriangle } from "lucide-react";
import { Post } from "@/types";

function truncate(text: string, max = 60) {
  if (!text) return "(ingen titel)";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function calcEngRate(post: Post) {
  if (post.reach === 0) return 0;
  const eng = (post.reactions + post.comments + post.shares) || post.engagement;
  return (eng / post.reach) * 100;
}

interface Props {
  posts?: Post[];
  mode: "low_reach" | "low_eng_rate";
}

export default function UnderperformersCard({ posts = [], mode }: Props) {
  const isReach = mode === "low_reach";

  const sorted = [...posts]
    .filter((p) => p.reach > 0)
    .sort((a, b) =>
      isReach ? a.reach - b.reach : calcEngRate(a) - calcEngRate(b)
    )
    .slice(0, 5);

  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        {isReach
          ? <TrendingDown className="w-4 h-4 text-orange-500" />
          : <AlertTriangle className="w-4 h-4 text-orange-500" />
        }
        <h2 className="text-base font-semibold text-[#303942]">
          {isReach ? "Lägst räckvidd" : "Lägst engagement rate"}
        </h2>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        {isReach
          ? "Inlägg som nådde minst folk"
          : "Inlägg med sämst engagemang relativt räckvidd"}
      </p>
      <div className="space-y-2">
        {sorted.map((post, i) => {
          const rate = calcEngRate(post);
          return (
            <div key={post.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
              <span className="w-6 h-6 flex-shrink-0 rounded-full bg-[#F5F5F0] text-[#303942] flex items-center justify-center text-xs font-bold mt-0.5">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#303942] font-medium">{truncate(post.title)}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs text-gray-500">
                    Räckvidd: <strong>{formatNumber(post.reach)}</strong>
                  </span>
                  <span className="text-xs text-orange-500 font-medium">
                    Eng: <strong>{rate.toFixed(2)}%</strong>
                  </span>
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
