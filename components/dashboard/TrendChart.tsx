"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import Card from "@/components/shared/Card";

const dummyData = [
  { month: "Sep", reach: 38000, engagement: 1800 },
  { month: "Okt", reach: 42000, engagement: 2100 },
  { month: "Nov", reach: 39000, engagement: 1950 },
  { month: "Dec", reach: 45000, engagement: 2400 },
  { month: "Jan", reach: 48000, engagement: 2600 },
  { month: "Feb", reach: 52000, engagement: 2890 },
];

export default function TrendChart({ data = dummyData }: { data?: typeof dummyData }) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-[#303942] mb-4">Räckvidd & Engagemang över tid</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="reach"
            name="Räckvidd"
            stroke="#ED5821"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="engagement"
            name="Engagemang"
            stroke="#CDAC50"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
