"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import Card from "@/components/shared/Card";
import { MonthStats } from "@/types";

const COLORS = ["#ED5821", "#CDAC50", "#303942", "#9CA3AF", "#60A5FA", "#34D399"];

interface CompareChartProps {
  stats: MonthStats[];
  metric: "totalReach" | "totalEngagement";
}

export default function CompareChart({ stats, metric }: CompareChartProps) {
  const label = metric === "totalReach" ? "Räckvidd" : "Engagemang";

  const data = stats.map((s) => ({
    month: s.month.split(" ")[0],
    [s.month]: s[metric],
  }));

  return (
    <Card>
      <h2 className="text-base font-semibold text-[#303942] mb-4">{label} per månad</h2>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          {stats.map((s, i) => (
            <Line
              key={s.month}
              type="monotone"
              dataKey={s.month}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
