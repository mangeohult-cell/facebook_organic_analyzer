import { TrendAlert as TrendAlertType } from "@/lib/insights";
import { formatNumber } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface Props {
  alerts: TrendAlertType[];
  lastMonth: string;
}

export default function TrendAlert({ alerts, lastMonth }: Props) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.type}
          className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3"
        >
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              Trendvarning – {alert.type === "reach" ? "Räckvidd" : "Engagement rate"} sjönk {alert.drop.toFixed(0)}%
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {lastMonth}:{" "}
              <strong>
                {alert.type === "reach"
                  ? formatNumber(alert.lastValue)
                  : `${alert.lastValue.toFixed(2)}%`}
              </strong>{" "}
              vs. historiskt snitt:{" "}
              <strong>
                {alert.type === "reach"
                  ? formatNumber(alert.avgValue)
                  : `${alert.avgValue.toFixed(2)}%`}
              </strong>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
