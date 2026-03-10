import { NextRequest, NextResponse } from "next/server";
import { getPostsByMonth, computeMonthStats } from "@/lib/data";

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get("month");
  if (!month) return NextResponse.json({ error: "month krävs" }, { status: 400 });

  const posts = await getPostsByMonth(month);
  const stats = computeMonthStats(month, posts);
  return NextResponse.json(stats);
}
