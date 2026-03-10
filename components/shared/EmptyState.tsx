import { BarChart2 } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BarChart2 className="w-12 h-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-[#303942] mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs">{description}</p>
    </div>
  );
}
