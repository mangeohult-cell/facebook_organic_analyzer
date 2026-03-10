import Card from "@/components/shared/Card";
import { KeywordInsight } from "@/lib/insights";
import { formatNumber } from "@/lib/utils";
import { Hash } from "lucide-react";

interface Props {
  keywords: KeywordInsight[];
}

export default function KeywordInsights({ keywords }: Props) {
  if (keywords.length === 0) return null;

  const maxReach = Math.max(...keywords.map((k) => k.avgReach));

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <Hash className="w-4 h-4 text-[#ED5821]" />
        <h2 className="text-base font-semibold text-[#303942]">Nyckelord & räckvidd</h2>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Ord i inläggstitlarna som korrelerar med hög räckvidd (min. 2 förekomster)
      </p>
      <div className="space-y-2">
        {keywords.map((k) => {
          const barWidth = maxReach > 0 ? (k.avgReach / maxReach) * 100 : 0;
          return (
            <div key={k.word} className="flex items-center gap-3">
              <span className="w-28 text-xs font-medium text-[#303942] truncate flex-shrink-0 capitalize">
                {k.word}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-[#ED5821]/70"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0 w-20 text-right">
                {formatNumber(k.avgReach)} snitt
              </span>
              <span className="text-xs text-gray-400 flex-shrink-0 w-8 text-right">
                {k.count}st
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
