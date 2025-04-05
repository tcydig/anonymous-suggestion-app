import { NextResponse } from "next/server";
import db from "@/lib/db";

// GETリクエストの処理
export async function GET() {
  try {
    const suggestions = db
      .prepare("SELECT * FROM suggestions ORDER BY created_at DESC")
      .all();
    return NextResponse.json(suggestions);
  } catch (error) {
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

// POSTリクエストの処理
export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "提案内容は必須です" },
        { status: 400 }
      );
    }

    const result = db
      .prepare("INSERT INTO suggestions (content) VALUES (?)")
      .run(content);
    return NextResponse.json({ id: result.lastInsertRowid, content });
  } catch (error) {
    return NextResponse.json(
      { error: "提案の投稿に失敗しました" },
      { status: 500 }
    );
  }
}
