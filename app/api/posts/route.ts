import { NextResponse } from "next/server";
import db from "@/lib/db";

interface Suggestion {
  id: number;
  content: string;
  category: string;
  likes: number;
  created_at: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // 全件数を取得
    const totalCount = db
      .prepare("SELECT COUNT(*) as count FROM suggestions")
      .get() as { count: number };

    const suggestions = db
      .prepare("SELECT * FROM suggestions ORDER BY created_at DESC LIMIT ?")
      .all(limit) as Suggestion[];

    return NextResponse.json({
      suggestions: suggestions.map((suggestion) => ({
        id: suggestion.id.toString(),
        content: suggestion.content,
        category: suggestion.category,
        likes: suggestion.likes,
        timestamp: suggestion.created_at,
      })),
      hasMore: totalCount.count > limit,
    });
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
      .run(content, category || "改善提案");

    const newPost = db
      .prepare("SELECT * FROM suggestions WHERE id = ?")
      .get(result.lastInsertRowid) as Suggestion;

    return NextResponse.json({
      id: newPost.id.toString(),
      content: newPost.content,
      category: newPost.category,
      likes: newPost.likes,
      timestamp: newPost.created_at,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "投稿の作成に失敗しました" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, content, category } = await request.json();

    if (!id || !content) {
      return NextResponse.json(
        { error: "IDと投稿内容は必須です" },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        "UPDATE suggestions SET content = ?, category = ? WHERE id = ? RETURNING *"
      )
      .get(content, category || "改善提案", id) as Suggestion;

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
      timestamp: result.created_at,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "投稿の更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "IDは必須です" }, { status: 400 });
    }

    const result = db.prepare("DELETE FROM suggestions WHERE id = ?").run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "投稿が見つかりません" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "投稿の削除に失敗しました" },
      { status: 500 }
    );
  }
}
