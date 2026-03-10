"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import Header from "@/components/layout/Header";
import Card from "@/components/shared/Card";
import FileUploader from "@/components/upload/FileUploader";
import FileList from "@/components/upload/FileList";
import { UploadedFile } from "@/types";
import { ParseResult } from "@/lib/csv-parser";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const { user } = useUser();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = useCallback(async () => {
    const { data } = await supabase
      .from("files")
      .select("*")
      .order("uploaded_at", { ascending: false });
    setFiles(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleConfirm = async (month: string, result: ParseResult, filename: string) => {
    // 1. Spara fil-posten
    const { data: fileRow, error: fileError } = await supabase
      .from("files")
      .insert({
        filename,
        month,
        uploaded_by: user?.id ?? "unknown",
        uploaded_by_name: user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? "Okänd",
        row_count: result.posts.length,
      })
      .select()
      .single();

    if (fileError || !fileRow) throw new Error(fileError?.message ?? "Kunde inte spara fil");

    // 2. Spara inläggen i batchar om 500
    const BATCH = 500;
    for (let i = 0; i < result.posts.length; i += BATCH) {
      const batch = result.posts.slice(i, i + BATCH).map((p) => ({
        ...p,
        file_id: fileRow.id,
      }));
      const { error: postsError } = await supabase.from("posts").insert(batch);
      if (postsError) throw new Error(postsError.message);
    }

    await fetchFiles();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("files").delete().eq("id", id);
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <>
      <Header title="Ladda upp data" />
      <div className="p-6 space-y-6 max-w-3xl">

        <Card>
          <h2 className="text-base font-semibold text-[#303942] mb-4">Ny uppladdning</h2>
          <FileUploader onConfirm={handleConfirm} />
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-[#303942] mb-4">Uppladdade filer</h2>
          {loading ? (
            <p className="text-sm text-gray-400 py-4 text-center">Laddar...</p>
          ) : (
            <FileList files={files} onDelete={handleDelete} />
          )}
        </Card>

      </div>
    </>
  );
}
