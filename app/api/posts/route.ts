import { NextResponse } from "next/server";
import db from "@/lib/db";

interface Suggestion {
  id: number;
  content: string;
  category: string;
  likes: number;
  created_at: string;
}

export async function GET() {
  try {
    const suggestions = db
      .prepare("SELECT * FROM suggestions ORDER BY created_at DESC")
      .all() as Suggestion[];

    return NextResponse.json(
      suggestions.map((suggestion) => ({
        id: suggestion.id.toString(),
        content: suggestion.content,
        category: suggestion.category,
        likes: suggestion.likes,
        timestamp: new Date(suggestion.created_at).toISOString(),
      }))
    );
  } catch (error) {
    return NextResponse.json(
      { error: "データの取得に失敗しました" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { content, category } = await request.json();

    if (!content) {
      return NextResponse.json(
        { error: "投稿内容は必須です" },
        { status: 400 }
      );
    }

    const result = db
      .prepare("INSERT INTO suggestions (content, category) VALUES (?, ?)")
      .run(content, category || "提案");

    return NextResponse.json({
      id: result.lastInsertRowid.toString(),
      content,
      category: category || "提案",
      likes: 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "投稿の作成に失敗しました" },
      { status: 500 }
    );
  }
}
