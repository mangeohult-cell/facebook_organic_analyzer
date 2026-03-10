"use client";

import { Trash2, FileText, User, Calendar } from "lucide-react";
import { UploadedFile } from "@/types";
import Button from "@/components/shared/Button";

interface FileListProps {
  files: UploadedFile[];
  onDelete: (id: string) => void;
}

export default function FileList({ files, onDelete }: FileListProps) {
  if (files.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-6">Inga filer uppladdade ännu.</p>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((f) => (
        <div key={f.id} className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
          <FileText className="w-5 h-5 text-[#ED5821] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#303942]">{f.month}</p>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" /> {f.uploaded_by_name}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(f.uploaded_at).toISOString().slice(0, 10)}
              </span>
              <span>{f.row_count} inlägg</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(f.id)}
            className="text-red-400 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
