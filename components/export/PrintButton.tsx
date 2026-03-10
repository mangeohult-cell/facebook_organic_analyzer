"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 bg-[#ED5821] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#d94d1d] transition-colors"
    >
      <Printer className="w-4 h-4" />
      Skriv ut / Spara som PDF
    </button>
  );
}
