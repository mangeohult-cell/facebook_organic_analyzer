import { TrendingUp, TrendingDown } from "lucide-react";
import Card from "@/components/shared/Card";
import { formatNumber } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number | string;
  change?: number;
  icon?: React.ReactNode;
  subValue?: string; // t.ex. engagemang i %
}

export default function KpiCard({ label, value, change, icon, subValue }: KpiCardProps) {
  const displayValue = typeof value === "number" ? formatNumber(value) : value;

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-[#303942]">{displayValue}</p>
            {subValue && (
              <span className="text-sm font-semibold text-[#CDAC50]">{subValue}</span>
            )}
          </div>
          {change !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${change >= 0 ? "text-green-600" : "text-red-500"}`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(change).toFixed(1)}% vs förra månaden
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-[#F5F5F0] rounded-lg text-[#ED5821]">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
