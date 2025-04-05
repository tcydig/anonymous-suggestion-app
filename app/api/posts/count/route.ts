import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const totalCount = db
      .prepare("SELECT COUNT(*) as count FROM suggestions")
      .get() as { count: number };

    return NextResponse.json({ count: totalCount.count });
  } catch (error) {
    return NextResponse.json(
      { error: "投稿数の取得に失敗しました" },
      { status: 500 }
    );
  }
}
