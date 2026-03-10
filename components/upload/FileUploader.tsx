"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, X, AlertCircle, CheckCircle2 } from "lucide-react";
import { parseFacebookCSV, ParseResult } from "@/lib/csv-parser";
import Button from "@/components/shared/Button";
import { formatNumber } from "@/lib/utils";

interface FileUploaderProps {
  onConfirm: (month: string, result: ParseResult, filename: string) => Promise<void>;
}

export default function FileUploader({ onConfirm }: FileUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState("");
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const processFile = useCallback((f: File) => {
    setFile(f);
    setSaved(false);
    setSaveError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseFacebookCSV(text);
      setParseResult(result);
    };
    reader.readAsText(f, "utf-8");
  }, []);

  const [saveError, setSaveError] = useState<string | null>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f?.name.endsWith(".csv")) processFile(f);
    },
    [processFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const handleConfirm = async () => {
    if (!parseResult || !month.trim() || !file) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onConfirm(month.trim(), parseResult, file.name);
      setSaved(true);
      setFile(null);
      setParseResult(null);
      setMonth("");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Något gick fel");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setFile(null);
    setParseResult(null);
    setMonth("");
    setSaved(false);
    setSaveError(null);
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
        <p className="text-lg font-semibold text-[#303942]">Uppladdning klar!</p>
        <Button variant="ghost" onClick={reset}>Ladda upp en till</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      {!file && (
        <label
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 cursor-pointer transition-colors ${
            dragging
              ? "border-[#ED5821] bg-orange-50"
              : "border-gray-300 hover:border-[#ED5821] hover:bg-orange-50/30"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <Upload className="w-10 h-10 text-gray-400 mb-3" />
          <p className="text-base font-medium text-[#303942]">Dra och släpp CSV-fil här</p>
          <p className="text-sm text-gray-500 mt-1">eller klicka för att välja fil</p>
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileInput}
          />
        </label>
      )}

      {/* Fil vald – förhandsgranskning */}
      {file && parseResult && (
        <div className="space-y-4">
          {/* Filinfo */}
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
            <FileText className="w-5 h-5 text-[#ED5821] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#303942] truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{parseResult.posts.length} inlägg hittade</p>
            </div>
            <button onClick={reset} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Fel */}
          {parseResult.errors.length > 0 && (
            <div className="flex gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>{parseResult.errors.map((e, i) => <p key={i}>{e}</p>)}</div>
            </div>
          )}

          {/* Omappade kolumner */}
          {parseResult.unmappedColumns.length > 0 && (
            <div className="flex gap-2 p-3 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Okända kolumner (ignoreras):</p>
                <p className="text-xs mt-0.5">{parseResult.unmappedColumns.join(", ")}</p>
              </div>
            </div>
          )}

          {/* Förhandsgranskning tabell */}
          {parseResult.posts.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-[#303942]">Förhandsgranskning (5 första inlägg)</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#F5F5F0]">
                    <tr>
                      <th className="text-left px-4 py-2 text-gray-500 font-medium">Titel</th>
                      <th className="text-right px-4 py-2 text-gray-500 font-medium">Räckvidd</th>
                      <th className="text-right px-4 py-2 text-gray-500 font-medium">Engagemang</th>
                      <th className="text-center px-4 py-2 text-gray-500 font-medium">Typ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {parseResult.posts.slice(0, 5).map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-[#303942] max-w-xs truncate">{p.title}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{formatNumber(p.reach)}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{formatNumber(p.engagement)}</td>
                        <td className="px-4 py-2 text-center text-gray-600">{p.post_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Månad + spara */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#303942] mb-1">
                Vilken månad gäller filen?
              </label>
              <input
                type="text"
                placeholder="t.ex. Januari 2025"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ED5821]"
              />
            </div>
            <Button
              onClick={handleConfirm}
              disabled={!month.trim() || parseResult.posts.length === 0 || saving}
            >
              {saving ? "Sparar..." : "Spara data"}
            </Button>
          </div>

          {saveError && (
            <p className="text-sm text-red-600">{saveError}</p>
          )}
        </div>
      )}
    </div>
  );
}
