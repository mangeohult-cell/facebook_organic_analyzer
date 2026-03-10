"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Card from "@/components/shared/Card";

const dummyData = [
  { name: "Video", value: 38 },
  { name: "Bild", value: 32 },
  { name: "Länk", value: 18 },
  { name: "Text", value: 12 },
];

const COLORS = ["#ED5821", "#CDAC50", "#303942", "#9CA3AF"];

export default function ContentTypeChart({ data = dummyData }: { data?: typeof dummyData }) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-[#303942] mb-4">Content-typ fördelning</h2>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
