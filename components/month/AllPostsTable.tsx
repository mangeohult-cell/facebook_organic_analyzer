"use client";

import { useState } from "react";
import { Post } from "@/types";
import { formatNumber, formatDate } from "@/lib/utils";
import { calcEngRate, calcVirality, getPerformanceScore } from "@/lib/insights";
import Badge from "@/components/shared/Badge";
import Card from "@/components/shared/Card";
import MetricTooltip from "@/components/shared/MetricTooltip";
import { ChevronUp, ChevronDown } from "lucide-react";

type SortKey = "reach" | "reactions" | "comments" | "shares" | "eng_rate" | "virality" | "score" | "published_at";

interface AllPostsTableProps {
  posts: Post[];
  avgReach: number;
  avgEngRate: number;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 67 ? "bg-green-100 text-green-700" :
    score >= 34 ? "bg-yellow-100 text-yellow-700" :
    "bg-red-100 text-red-600";
  return (
    <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-bold ${color}`}>
      {score}
    </span>
  );
}

export default function AllPostsTable({ posts, avgReach, avgEngRate }: AllPostsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const withCalc = posts.map((p) => ({
    ...p,
    _engRate: calcEngRate(p),
    _virality: calcVirality(p),
    _score: getPerformanceScore(p, avgReach, avgEngRate),
  }));

  const sorted = [...withCalc].sort((a, b) => {
    let aVal: number, bVal: number;
    switch (sortKey) {
      case "published_at": aVal = new Date(a.published_at).getTime(); bVal = new Date(b.published_at).getTime(); break;
      case "eng_rate": aVal = a._engRate; bVal = b._engRate; break;
      case "virality": aVal = a._virality; bVal = b._virality; break;
      case "score": aVal = a._score; bVal = b._score; break;
      default: aVal = a[sortKey] as number; bVal = b[sortKey] as number;
    }
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });

  const toggle = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortDir === "desc"
        ? <ChevronDown className="w-3 h-3 inline ml-0.5" />
        : <ChevronUp className="w-3 h-3 inline ml-0.5" />
      : null;

  const Th = ({ label, k, tooltip }: { label: string; k: SortKey; tooltip?: string }) => (
    <th
      className="text-right px-2 py-2 text-gray-500 font-medium cursor-pointer hover:text-[#ED5821] whitespace-nowrap"
      onClick={() => toggle(k)}
    >
      <span className="inline-flex items-center gap-1 justify-end">
        {label}<SortIcon k={k} />
        {tooltip && <span onClick={(e) => e.stopPropagation()}><MetricTooltip text={tooltip} /></span>}
      </span>
    </th>
  );

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-[#303942]">Alla inlägg</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-[#F5F5F0]">
            <tr>
              <th className="text-left px-3 py-2 text-gray-500 font-medium cursor-pointer hover:text-[#ED5821]" onClick={() => toggle("published_at")}>
                Titel <SortIcon k="published_at" />
              </th>
              <Th label="Räckvidd" k="reach" />
              <Th label="Reaktioner" k="reactions" />
              <Th label="Komm." k="comments" />
              <Th label="Deln." k="shares" />
              <Th label="Eng.rate" k="eng_rate" />
              <Th label="Viralitet" k="virality" />
              <Th label="Score" k="score" tooltip="Samlat betyg 0–100 som visar hur ett inlägg presterade jämfört med månadens övriga inlägg. Hälften av poängen kommer från räckvidd, hälften från engagement rate – båda mätta mot periodens snitt. Dubbelt snitt eller mer i båda ger 100. Exakt på snitt ger 50. Under snitt ger under 50. Exempel: snittinlägget denna månad når 10 000 personer och har 1% ER. Ett inlägg med 20 000 räckvidd och 2% ER → Score 100. Ett inlägg med 10 000 och 1% ER → Score 50. Ett inlägg med 5 000 och 0,5% ER → Score 25. Färg: grönt = 67–100, gult = 34–66, rött = 0–33." />
              <th className="text-center px-2 py-2 text-gray-500 font-medium">Typ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-[#303942] max-w-[220px]">
                  <span className="block leading-snug">
                    {p.title ? (p.title.length > 60 ? p.title.slice(0, 60) + "…" : p.title) : "(ingen titel)"}
                  </span>
                  <span className="text-gray-400 text-xs">
                    {formatDate(p.published_at)}
                  </span>
                </td>
                <td className="px-2 py-2 text-right text-gray-600">{formatNumber(p.reach)}</td>
                <td className="px-2 py-2 text-right text-gray-600">{formatNumber(p.reactions)}</td>
                <td className="px-2 py-2 text-right text-gray-600">{formatNumber(p.comments)}</td>
                <td className="px-2 py-2 text-right text-gray-600">{formatNumber(p.shares)}</td>
                <td className="px-2 py-2 text-right text-[#ED5821] font-medium">{p._engRate.toFixed(2)}%</td>
                <td className="px-2 py-2 text-right text-[#CDAC50] font-medium">{p._virality.toFixed(2)}%</td>
                <td className="px-2 py-2 text-right"><ScoreBadge score={p._score} /></td>
                <td className="px-2 py-2 text-center">
                  <Badge variant="gray">{p.post_type}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
