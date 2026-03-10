"use client";

interface CompareMonthSelectorProps {
  months: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export default function CompareMonthSelector({ months, selected, onChange }: CompareMonthSelectorProps) {
  const toggle = (m: string) => {
    if (selected.includes(m)) {
      if (selected.length > 2) onChange(selected.filter((x) => x !== m));
    } else if (selected.length < 6) {
      onChange([...selected, m]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {months.map((m) => {
        const active = selected.includes(m);
        return (
          <button
            key={m}
            onClick={() => toggle(m)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              active
                ? "bg-[#ED5821] text-white"
                : "bg-white text-[#303942] border border-gray-200 hover:border-[#ED5821]"
            }`}
          >
            {m}
          </button>
        );
      })}
      <span className="text-xs text-gray-400 self-center ml-1">Välj 2–6 månader</span>
    </div>
  );
}
