import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const totalLikes = db
      .prepare("SELECT SUM(likes) as count FROM suggestions")
      .get() as { count: number };

    return NextResponse.json({ count: totalLikes.count || 0 });
  } catch (error) {
    console.error("いいね数の取得エラー:", error);
    return NextResponse.json(
      { error: "いいね数の取得に失敗しました" },
      { status: 500 }
    );
  }
}
