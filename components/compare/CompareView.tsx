"use client";

import { useState, useEffect } from "react";
import { MonthStats } from "@/types";
import { computeMonthStats } from "@/lib/data";
import CompareMonthSelector from "./MonthSelector";
import CompareTable from "./CompareTable";
import CompareChart from "./CompareChart";

interface CompareViewProps {
  months: string[];
}

export default function CompareView({ months }: CompareViewProps) {
  const [selected, setSelected] = useState<string[]>(months.slice(0, Math.min(3, months.length)));
  const [statsMap, setStatsMap] = useState<Record<string, MonthStats>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const missing = selected.filter((m) => !statsMap[m]);
    if (missing.length === 0) return;

    setLoading(true);
    Promise.all(
      missing.map(async (m) => {
        const res = await fetch(`/api/month-stats?month=${encodeURIComponent(m)}`);
        const data = await res.json();
        return { month: m, stats: data };
      })
    ).then((results) => {
      setStatsMap((prev) => {
        const next = { ...prev };
        for (const r of results) next[r.month] = r.stats;
        return next;
      });
      setLoading(false);
    });
  }, [selected, statsMap]);

  const orderedStats: MonthStats[] = selected
    .map((m) => statsMap[m])
    .filter(Boolean) as MonthStats[];

  return (
    <div className="space-y-6">
      <CompareMonthSelector months={months} selected={selected} onChange={setSelected} />

      {loading && (
        <p className="text-sm text-gray-400">Laddar data...</p>
      )}

      {orderedStats.length >= 2 && (
        <>
          <CompareTable stats={orderedStats} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <CompareChart stats={orderedStats} metric="totalReach" />
            <CompareChart stats={orderedStats} metric="totalEngagement" />
          </div>
        </>
      )}
    </div>
  );
}
