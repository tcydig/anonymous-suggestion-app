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
    const id = await Promise.resolve(params.id);
    const result = db
      .prepare(
        "UPDATE suggestions SET likes = likes + 1 WHERE id = ? RETURNING *"
      )
      .get(parseInt(id)) as Suggestion;

    if (!result) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: result.id.toString(),
      content: result.content,
      category: result.category,
      likes: result.likes,
      timestamp: new Date(result.created_at).toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "いいねの処理に失敗しました" },
      { status: 500 }
    );
  }
}
