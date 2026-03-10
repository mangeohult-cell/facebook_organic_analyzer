import Card from "@/components/shared/Card";
import { formatNumber } from "@/lib/utils";

interface BestMonthBadgeProps {
  month?: string;
  reach?: number;
  engagement?: number;
}

export default function BestMonthBadge({
  month = "Februari 2025",
  reach = 52000,
  engagement = 2890,
}: BestMonthBadgeProps) {
  return (
    <Card className="border-2 border-[#CDAC50]">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🔥</span>
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Bästa månaden</p>
          <p className="text-xl font-bold text-[#303942]">{month}</p>
          <div className="flex gap-4 mt-1">
            <span className="text-sm text-gray-600">Räckvidd: <strong className="text-[#ED5821]">{formatNumber(reach)}</strong></span>
            <span className="text-sm text-gray-600">Engagemang: <strong className="text-[#CDAC50]">{formatNumber(engagement)}</strong></span>
          </div>
        </div>
      </div>
    </Card>
  );
}
