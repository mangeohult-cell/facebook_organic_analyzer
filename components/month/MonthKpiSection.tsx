"use client";

import { useState } from "react";
import { BarChart2, Activity, Users, TrendingUp } from "lucide-react";
import KpiCard from "@/components/dashboard/KpiCard";

interface PerPostMetrics {
  reachPerPost: { median: number; avg: number };
  erPerPost: { median: number; avg: number };
  postCount: number;
}

interface MonthKpiSectionProps {
  totalReach: number;
  totalEngagement: number;
  reachChange?: number;
  engChange?: number;
  current: PerPostMetrics;
  prev: PerPostMetrics | null;
}

type Mode = "median" | "avg";

export default function MonthKpiSection({
  totalReach,
  totalEngagement,
  reachChange,
  engChange,
  current,
  prev,
}: MonthKpiSectionProps) {
  const [mode, setMode] = useState<Mode>("median");

  const pick = (m: { median: number; avg: number }) =>
    mode === "median" ? m.median : m.avg;

  const momChange = (
    curr: { median: number; avg: number },
    p: { median: number; avg: number },
  ) => {
    const c = pick(curr);
    const pv = pick(p);
    return pv > 0 ? ((c - pv) / pv) * 100 : undefined;
  };

  const modeLabel = mode === "median" ? "Median" : "Snitt";

  return (
    <div className="space-y-4">
      {/* Rad 1 – fasta totalvärden + antal inlägg */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <KpiCard
          label="Total räckvidd"
          value={totalReach}
          change={reachChange}
          icon={<BarChart2 className="w-5 h-5" />}
        />
        <KpiCard
          label="Totalt engagemang"
          value={totalEngagement}
          change={engChange}
          icon={<Activity className="w-5 h-5" />}
        />
        <KpiCard
          label="Antal inlägg"
          value={current.postCount}
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Separator-rad: rubrik + toggle */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          Per inlägg – denna månad
        </span>
        <div className="inline-flex items-center rounded-full border border-gray-200 bg-[#F5F5F0] p-0.5 text-xs font-medium">
          {(["median", "avg"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 rounded-full transition-colors ${
                mode === m
                  ? "bg-[#ED5821] text-white"
                  : "text-gray-500 hover:text-[#303942]"
              }`}
            >
              {m === "median" ? "Median" : "Snitt"}
            </button>
          ))}
        </div>
      </div>

      {/* Rad 2 – per-inlägg-mått med toggle */}
      <div className="grid grid-cols-2 gap-4">
        <KpiCard
          label="Räckvidd / inlägg"
          value={Math.round(pick(current.reachPerPost))}
          sublabel={`${modeLabel} av ${current.postCount} inlägg`}
          change={prev ? momChange(current.reachPerPost, prev.reachPerPost) : undefined}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <KpiCard
          label="Engagement rate"
          value={`${pick(current.erPerPost).toFixed(1)}%`}
          sublabel={`${modeLabel} av ${current.postCount} inlägg`}
          change={prev ? momChange(current.erPerPost, prev.erPerPost) : undefined}
          icon={<TrendingUp className="w-5 h-5" />}
          tooltip="Engagemang / Räckvidd × 100. Visar kvaliteten på innehållet oavsett storlek på publik. Branschsnitt på Facebook: 0,5–1%. Över 3% är utmärkt."
        />
      </div>
    </div>
  );
}
