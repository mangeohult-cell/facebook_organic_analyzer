"use client";

import { useRouter, usePathname } from "next/navigation";

interface MonthSelectorProps {
  months: string[];
  selected: string;
}

export default function MonthSelector({ months, selected }: MonthSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-[#303942]">Välj månad:</label>
      <select
        value={selected}
        onChange={(e) => router.push(`${pathname}?month=${encodeURIComponent(e.target.value)}`)}
        className="px-3 py-2 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#ED5821]"
      >
        {months.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}
