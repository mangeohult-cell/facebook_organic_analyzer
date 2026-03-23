import { TrendingUp, TrendingDown } from "lucide-react";
import Card from "@/components/shared/Card";
import MetricTooltip from "@/components/shared/MetricTooltip";
import { formatNumber } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number | string;
  change?: number;
  icon?: React.ReactNode;
  subValue?: string; // t.ex. engagemang i %
  description?: string; // liten förklaringstext under label
  sublabel?: string; // liten förklaringstext under värdet
  tooltip?: string;
}

export default function KpiCard({ label, value, change, icon, subValue, description, sublabel, tooltip }: KpiCardProps) {
  const displayValue = typeof value === "number" ? formatNumber(value) : value;

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <p className="text-sm text-gray-500">{label}</p>
            {tooltip && <MetricTooltip text={tooltip} />}
          </div>
          {description && (
            <p className="text-xs text-gray-400 mb-1">{description}</p>
          )}
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-[#303942]">{displayValue}</p>
            {subValue && (
              <span className="text-sm font-semibold text-[#CDAC50]">{subValue}</span>
            )}
          </div>
          {sublabel && (
            <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
          )}
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
