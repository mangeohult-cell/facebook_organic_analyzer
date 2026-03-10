import Card from "@/components/shared/Card";
import { TypeInsight } from "@/lib/insights";
import { formatNumber } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  video: "Video", image: "Bild", link: "Länk", text: "Text",
};

interface Props {
  insights: TypeInsight[];
  recommendation: string | null;
}

export default function ContentRecommendationCard({ insights, recommendation }: Props) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-4 h-4 text-[#CDAC50]" />
        <h2 className="text-base font-semibold text-[#303942]">Innehållstyp-analys</h2>
      </div>

      {recommendation && (
        <div className="bg-[#CDAC50]/10 border border-[#CDAC50]/30 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm font-medium text-[#303942]">💡 {recommendation}</p>
        </div>
      )}

      <div className="space-y-2">
        {insights.map((t) => {
          const barWidth = Math.min(t.engMultiplier * 50, 100);
          return (
            <div key={t.type} className="flex items-center gap-3">
              <span className="w-16 text-xs font-medium text-[#303942] flex-shrink-0">
                {TYPE_LABELS[t.type] ?? t.type}
              </span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-[#ED5821]"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <div className="flex gap-3 text-xs text-gray-500 flex-shrink-0 w-40">
                <span>Eng: <strong className="text-[#303942]">{t.avgEngRate.toFixed(2)}%</strong></span>
                <span>Räckv: <strong className="text-[#303942]">{formatNumber(t.avgReach)}</strong></span>
              </div>
              <span className="text-xs text-gray-400 w-12 text-right">{t.count} st</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        Baserat på {insights.reduce((s, t) => s + t.count, 0)} inlägg
      </p>
    </Card>
  );
}
