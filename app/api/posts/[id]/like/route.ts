import { NextResponse } from "next/server";
import db from "@/lib/db";

interface Suggestion {
  id: number;
  content: string;
  category: string;
  likes: number;
  created_at: string;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    // まず投稿の現在のcreated_atを取得
    const post = db
      .prepare("SELECT created_at FROM suggestions WHERE id = ?")
      .get(parseInt(id)) as Suggestion;

    if (!post) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      );
    }

    // いいねのカウントを更新
    const result = db
      .prepare(
        "UPDATE suggestions SET likes = likes + 1 WHERE id = ? RETURNING id, content, category, likes"
      )
      .get(parseInt(id)) as Suggestion;

    const response = {
      id: result.id.toString(),
      content: result.content,
      category: result.category,
      likes: result.likes,
      timestamp: post.created_at, // UTCのまま返す
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "いいねの処理に失敗しました" },
      { status: 500 }
    );
  }
}
