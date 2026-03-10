import Card from "@/components/shared/Card";
import { FrequencyRow } from "@/lib/insights";
import { formatNumber } from "@/lib/utils";
import { CalendarDays } from "lucide-react";

interface Props {
  rows: FrequencyRow[];
}

export default function FrequencyInsights({ rows }: Props) {
  if (rows.length === 0) return null;

  const maxReach = Math.max(...rows.map((r) => r.avgReach));

  // Hitta optimal frekvens (månaden med högst snittreach)
  const best = [...rows].sort((a, b) => b.avgReach - a.avgReach)[0];

  return (
    <Card>
      <div className="flex items-center gap-2 mb-1">
        <CalendarDays className="w-4 h-4 text-[#ED5821]" />
        <h2 className="text-base font-semibold text-[#303942]">Publiceringsfrekvens vs. räckvidd</h2>
      </div>
      <p className="text-xs text-gray-500 mb-1">
        Hur påverkar antal inlägg per månad räckvidden?
      </p>
      {best && (
        <div className="bg-[#F5F5F0] rounded-md px-3 py-2 mb-4 text-xs text-[#303942]">
          🏆 Bäst snittreach med <strong>{best.postCount} inlägg</strong> ({best.month}) →{" "}
          <strong>{formatNumber(best.avgReach)}</strong> per inlägg
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-2 font-medium">Månad</th>
              <th className="pb-2 font-medium text-right">Inlägg</th>
              <th className="pb-2 font-medium text-right">Snitt räckvidd</th>
              <th className="pb-2 font-medium text-right">Eng. rate</th>
              <th className="pb-2 font-medium px-2">Räckvidd/inlägg</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const barWidth = maxReach > 0 ? (r.avgReach / maxReach) * 100 : 0;
              const isBest = r.month === best?.month;
              return (
                <tr key={r.month} className={`border-b border-gray-50 ${isBest ? "bg-[#CDAC50]/10" : ""}`}>
                  <td className="py-2 font-medium text-[#303942]">
                    {r.month} {isBest && <span className="text-[#CDAC50]">★</span>}
                  </td>
                  <td className="py-2 text-right text-gray-600">{r.postCount}</td>
                  <td className="py-2 text-right text-gray-600">{formatNumber(r.avgReach)}</td>
                  <td className="py-2 text-right text-gray-600">{r.avgEngRate.toFixed(2)}%</td>
                  <td className="py-2 px-2">
                    <div className="bg-gray-100 rounded-full h-1.5 w-full">
                      <div
                        className="h-1.5 rounded-full bg-[#ED5821]/60"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
