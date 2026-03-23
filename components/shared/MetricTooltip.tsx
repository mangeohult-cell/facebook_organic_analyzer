import { Info } from "lucide-react";

interface MetricTooltipProps {
  text: string;
}

export default function MetricTooltip({ text }: MetricTooltipProps) {
  return (
    <span className="relative group inline-flex items-center">
      <Info className="w-4 h-4 text-[#CDAC50] opacity-70 hover:opacity-100 cursor-help transition-opacity" />
      <span
        className="
          absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
          w-[280px] bg-[#303942] text-white text-xs leading-relaxed
          rounded-lg px-3 py-2.5 shadow-lg
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200 pointer-events-none
        "
      >
        {text}
        {/* Arrow */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#303942]" />
      </span>
    </span>
  );
}
