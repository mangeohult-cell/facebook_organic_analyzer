import Papa from "papaparse";
import { Post } from "@/types";

const COLUMN_MAP: Record<string, keyof RawRow> = {
  // Titel
  "titel": "title",
  "inläggstitel": "title",
  "post title": "title",
  "title": "title",
  "beskrivning": "title",
  "description": "title",

  // Publiceringstid
  "publiceringstid": "published_at",
  "published": "published_at",
  "publiceringsdatum": "published_at",
  "date": "published_at",
  // OBS: "datum" mappas INTE – i Facebook-export innehåller den "Livstid", inte ett datum

  // Räckvidd (OBS: "Visningar" = impressions, ska INTE mappas till reach)
  "räckvidd": "reach",
  "reach": "reach",
  "total reach": "reach",
  "total räckvidd": "reach",

  // Engagemang (kombinerat – Facebook exporterar ofta detta som en kolumn)
  "engagemang": "engagement",
  "engagement": "engagement",
  "total engagement": "engagement",
  "totalt engagemang": "engagement",
  "reaktioner, kommentarer och delningar": "engagement",
  "reactions, comments and shares": "engagement",
  "lifetime post total impressions": "engagement",

  // Reaktioner
  "reaktioner": "reactions",
  "reactions": "reactions",
  "likes": "reactions",
  "gilla-markeringar": "reactions",
  "lifetime post total reactions": "reactions",

  // Kommentarer
  "kommentarer": "comments",
  "comments": "comments",
  "lifetime post comments": "comments",

  // Delningar
  "delningar": "shares",
  "shares": "shares",
  "lifetime post shares": "shares",

  // Sparade
  "sparade": "saves",
  "saves": "saves",
  "saved": "saves",

  // Typ
  "typ": "post_type",
  "type": "post_type",
  "inläggstyp": "post_type",
  "post type": "post_type",
};

interface RawRow {
  title?: string;
  published_at?: string;
  reach?: string;
  engagement?: string;
  reactions?: string;
  comments?: string;
  shares?: string;
  saves?: string;
  post_type?: string;
}

function normalizeKey(key: string): string {
  return key.toLowerCase().trim().replace(/\s+/g, " ");
}

function parsePostType(raw?: string): Post["post_type"] {
  const val = (raw ?? "").toLowerCase();
  if (val.includes("video")) return "video";
  if (val.includes("bild") || val.includes("photo") || val.includes("image")) return "image";
  if (val.includes("länk") || val.includes("link")) return "link";
  return "text";
}

function parseDate(val?: string): string {
  if (!val) return new Date().toISOString();

  // Facebook-format: "MM/DD/YYYY HH:MM" → konvertera till ISO
  const fbMatch = val.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/);
  if (fbMatch) {
    const [, mm, dd, yyyy, hh, min] = fbMatch;
    const d = new Date(`${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}T${hh.padStart(2, "0")}:${min}:00`);
    if (!isNaN(d.getTime())) return d.toISOString();
  }

  // Standard ISO eller liknande
  const d = new Date(val);
  if (!isNaN(d.getTime())) return d.toISOString();

  return new Date().toISOString();
}

function toInt(val?: string): number {
  if (!val) return 0;
  return parseInt(val.replace(/\s/g, "").replace(/,/g, ""), 10) || 0;
}

export interface ParseResult {
  posts: Omit<Post, "id" | "file_id">[];
  errors: string[];
  unmappedColumns: string[];
  detectedColumns: string[]; // för felsökning
}

export function parseFacebookCSV(csvText: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const rawHeaders = result.meta.fields ?? [];
  const unmappedColumns: string[] = [];

  const headerMap: Record<string, keyof RawRow> = {};
  for (const h of rawHeaders) {
    const normalized = normalizeKey(h);
    const mapped = COLUMN_MAP[normalized];
    if (mapped) {
      headerMap[h] = mapped;
    } else {
      unmappedColumns.push(h);
    }
  }

  const errors: string[] = [];
  const posts: Omit<Post, "id" | "file_id">[] = [];

  for (let i = 0; i < result.data.length; i++) {
    const row = result.data[i];
    const raw: RawRow = {};

    for (const [col, field] of Object.entries(headerMap)) {
      // Behåll befintligt värde om det redan är satt och icke-tomt
      if (!raw[field]) {
        raw[field] = row[col];
      }
    }

    if (!raw.title && !raw.published_at) {
      continue;
    }

    const reactions = toInt(raw.reactions);
    const comments = toInt(raw.comments);
    const shares = toInt(raw.shares);
    let engagement = toInt(raw.engagement);

    // Fallback: om engagement-kolumn saknas eller är 0, beräkna från delarna
    if (engagement === 0 && (reactions + comments + shares) > 0) {
      engagement = reactions + comments + shares;
    }

    posts.push({
      title: raw.title ?? `Inlägg ${i + 1}`,
      published_at: parseDate(raw.published_at),
      reach: toInt(raw.reach),
      engagement,
      reactions,
      comments,
      shares,
      post_type: parsePostType(raw.post_type),
    });
  }

  if (posts.length === 0) {
    errors.push("Inga inlägg hittades i filen. Kontrollera att kolumnerna stämmer.");
  }

  return { posts, errors, unmappedColumns, detectedColumns: rawHeaders };
}
