"use client";

import { useState } from "react";
import { BarChart2, Users, TrendingUp, Activity, Share2 } from "lucide-react";
import KpiCard from "./KpiCard";
import PageSettingsPanel from "./PageSettingsPanel";

export interface MonthMetrics {
  reach:    { median: number; avg: number };
  er:       { median: number; avg: number };
  ctr:      { median: number; avg: number };
  virality: { median: number; avg: number };
  shares:   { median: number; avg: number };
  postCount: number;
  linkPostCount: number;
}

interface KpiSectionProps {
  totalReach: number;
  totalEngagement: number;
  allPostCount: number;
  followerCount: number;
  current: MonthMetrics;
  prev: MonthMetrics | null;
}

type Mode = "median" | "avg";

export default function KpiSection({
  totalReach,
  totalEngagement,
  allPostCount,
  followerCount,
  current,
  prev,
}: KpiSectionProps) {
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
  const sublabel = (count: number) => `${modeLabel} av ${count} inlägg`;

  const orrValue =
    followerCount > 0
      ? `${((pick(current.reach) / followerCount) * 100).toFixed(1)}%`
      : "–";
  const orrSublabel =
    followerCount > 0
      ? `${modeLabel} räckvidd / ${followerCount.toLocaleString("sv-SE")} följare`
      : "Ange följarantal i inställningar";

  return (
    <div className="space-y-4">
      {/* Rad 1 – fasta totalvärden */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard
          label="Total räckvidd"
          value={totalReach}
          icon={<BarChart2 className="w-5 h-5" />}
          tooltip="Antal unika personer som sett inlägget. Påverkas av publiceringstid, format och tidigare engagemang. Hög räckvidd = algoritmen gillar innehållet."
        />
        <KpiCard
          label="Totalt engagemang"
          value={totalEngagement}
          icon={<Activity className="w-5 h-5" />}
        />
        <KpiCard
          label="Antal inlägg"
          value={allPostCount}
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Separator-rad: rubrik + toggle + sidinställningar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Per inlägg – senaste månaden
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
        <PageSettingsPanel initialFollowerCount={followerCount} />
      </div>

      {/* Rad 2 – per-inlägg-mått som följer toggle */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        <KpiCard
          label="Räckvidd / inlägg"
          value={Math.round(pick(current.reach))}
          sublabel={sublabel(current.postCount)}
          change={prev ? momChange(current.reach, prev.reach) : undefined}
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <KpiCard
          label="Organisk räckvidd"
          value={orrValue}
          sublabel={orrSublabel}
          icon={<TrendingUp className="w-5 h-5" />}
          tooltip="Räckvidd / Följare × 100. Visar hur stor andel av era följare ett typiskt inlägg når. Branschsnitt: ~1,4%. Över 2% = bra. Över 4% = utmärkt. Källa: Swydo / Keefomatic 2024"
        />
        <KpiCard
          label="Engagement rate"
          value={`${pick(current.er).toFixed(1)}%`}
          sublabel={sublabel(current.postCount)}
          change={prev ? momChange(current.er, prev.er) : undefined}
          icon={<TrendingUp className="w-5 h-5" />}
          tooltip="Engagemang / Räckvidd × 100. Visar kvaliteten på innehållet oavsett storlek på publik. Branschsnitt på Facebook: 0,5–1%. Över 3% är utmärkt. Delningar och kommentarer väger tyngst för algoritmen."
        />
        <KpiCard
          label="CTR"
          value={current.linkPostCount > 0 ? `${pick(current.ctr).toFixed(2)}%` : "–"}
          sublabel={`${modeLabel} av ${current.linkPostCount} länkinlägg`}
          description="Länkklick / Räckvidd (inlägg med länk)"
          change={
            prev && current.linkPostCount > 0 && prev.linkPostCount > 0
              ? momChange(current.ctr, prev.ctr)
              : undefined
          }
          icon={<TrendingUp className="w-5 h-5" />}
          tooltip="Länkklick / Räckvidd × 100. Visar hur effektivt inlägget driver trafik till webben. Benchmark: under 0,5% = låg, 1–3% = bra, över 3% = utmärkt. Beräknas endast på inlägg med länk."
        />
        <KpiCard
          label="Viralitet"
          value={`${pick(current.virality).toFixed(2)}%`}
          sublabel={sublabel(current.postCount)}
          change={prev ? momChange(current.virality, prev.virality) : undefined}
          icon={<TrendingUp className="w-5 h-5" />}
          tooltip="Delningar / Räckvidd × 100. Visar hur organiskt innehållet sprids utanför din direkta publik."
        />
        <KpiCard
          label="Delningar / inlägg"
          value={Math.round(pick(current.shares))}
          sublabel={sublabel(current.postCount)}
          change={prev ? momChange(current.shares, prev.shares) : undefined}
          icon={<Share2 className="w-5 h-5" />}
          tooltip="Antal delningar per inlägg (median). Delningar är den starkaste algoritmsignalen på Facebook — en delning når delarens hela nätverk organiskt."
        />
      </div>
    </div>
  );
}
