import { NextResponse } from "next/server";
import db from "@/lib/db";

// タイムラインの取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const entries = db
      .prepare(
        `SELECT *
       FROM timeline_entries
       WHERE discussion_id = ?
       ORDER BY created_at DESC`
      )
      .all(params.id);

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Failed to fetch timeline entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch timeline entries" },
      { status: 500 }
    );
  }
}

// タイムラインエントリーの追加
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // ディスカッションの存在確認
    const discussion = db
      .prepare("SELECT id FROM discussions WHERE id = ?")
      .get(params.id);

    if (!discussion) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }

    const result = db
      .prepare(
        `INSERT INTO timeline_entries (id, discussion_id, content, created_at, updated_at)
       VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
      .run(crypto.randomUUID(), params.id, content);

    const newEntry = db
      .prepare("SELECT * FROM timeline_entries WHERE id = ?")
      .get(result.lastInsertRowid);

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error("Failed to create timeline entry:", error);
    return NextResponse.json(
      { error: "Failed to create timeline entry" },
      { status: 500 }
    );
  }
}
