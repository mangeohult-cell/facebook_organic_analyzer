import { MonthStats } from "@/types";
import { formatNumber, percentChange } from "@/lib/utils";
import Card from "@/components/shared/Card";
import Badge from "@/components/shared/Badge";

interface CompareTableProps {
  stats: MonthStats[];
}

export default function CompareTable({ stats }: CompareTableProps) {
  if (stats.length < 2) return null;

  const first = stats[0];
  const last = stats[stats.length - 1];
  const reachChange = percentChange(last.totalReach, first.totalReach);
  const engChange = percentChange(last.totalEngagement, first.totalEngagement);

  const rows = [
    {
      label: "Räckvidd",
      values: stats.map((s) => formatNumber(s.totalReach)),
      change: reachChange,
      best: stats.reduce((a, b) => (a.totalReach > b.totalReach ? a : b)).month,
    },
    {
      label: "Engagemang",
      values: stats.map((s) => formatNumber(s.totalEngagement)),
      change: engChange,
      best: stats.reduce((a, b) => (a.totalEngagement > b.totalEngagement ? a : b)).month,
    },
    {
      label: "Inlägg",
      values: stats.map((s) => s.postCount.toString()),
      change: null,
      best: null,
    },
    {
      label: "Bästa typ",
      values: stats.map((s) => s.bestPostType),
      change: null,
      best: null,
    },
  ];

  return (
    <Card className="p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F5F0]">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">KPI</th>
              {stats.map((s) => (
                <th key={s.month} className="text-right px-4 py-3 text-[#303942] font-semibold">
                  {s.month}
                </th>
              ))}
              <th className="text-right px-4 py-3 text-gray-500 font-medium">Förändring</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.label} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-[#303942]">{row.label}</td>
                {stats.map((s, i) => (
                  <td key={s.month} className="px-4 py-3 text-right text-gray-600">
                    <span className={row.best === s.month ? "font-bold text-[#CDAC50]" : ""}>
                      {row.values[i]}
                    </span>
                    {row.best === s.month && (
                      <span className="ml-1 text-xs">🔥</span>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3 text-right">
                  {row.change !== null ? (
                    <span className={`font-medium ${row.change >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {row.change >= 0 ? "+" : ""}{row.change.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-gray-400">–</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
