"use client";

import { useState, useEffect } from "react";
import { Settings2, X } from "lucide-react";
import { saveFollowerCount } from "@/app/actions";

interface Props {
  initialFollowerCount: number;
}

export default function PageSettingsPanel({ initialFollowerCount }: Props) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(initialFollowerCount > 0 ? String(initialFollowerCount) : "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(initialFollowerCount > 0 ? String(initialFollowerCount) : "");
  }, [initialFollowerCount]);

  async function handleSave() {
    const n = parseInt(value.replace(/\s/g, ""), 10);
    if (isNaN(n) || n < 0) return;
    setSaving(true);
    await saveFollowerCount(n);
    setSaving(false);
    setOpen(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 text-xs transition-colors ${
          open ? "text-[#ED5821]" : "text-gray-400 hover:text-[#303942]"
        }`}
      >
        <Settings2 className="w-3.5 h-3.5" />
        Sidinställningar
      </button>

      {open && (
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
          <span className="text-xs text-gray-500 whitespace-nowrap">Antal följare:</span>
          <input
            type="text"
            inputMode="numeric"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="w-24 text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-[#ED5821]"
            placeholder="t.ex. 12 000"
            autoFocus
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs bg-[#ED5821] text-white px-2.5 py-1 rounded hover:bg-[#d94d1d] transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {saving ? "Sparar…" : "Spara"}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-300 hover:text-gray-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
