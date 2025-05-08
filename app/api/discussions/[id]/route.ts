import { NextResponse } from "next/server";
import db from "@/lib/db";

// 特定のディスカッションの取得
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const discussion = db
      .prepare(
        `SELECT d.*, s.content as original_content, s.category as original_category
       FROM discussions d
       LEFT JOIN suggestions s ON d.original_post_id = s.id
       WHERE d.id = ?`
      )
      .get(id);

    if (!discussion) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(discussion);
  } catch (error) {
    console.error("Failed to fetch discussion:", error);
    return NextResponse.json(
      { error: "Failed to fetch discussion" },
      { status: 500 }
    );
  }
}

// ディスカッションの更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const body = await request.json();
    const { status, title, free_space_content } = body;

    const result = db
      .prepare(
        `UPDATE discussions
       SET status = ?, title = ?, free_space_content = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
      )
      .run(status, title, free_space_content, id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }

    const updatedDiscussion = db
      .prepare(
        `SELECT d.*, s.content as original_content, s.category as original_category
         FROM discussions d
         LEFT JOIN suggestions s ON d.original_post_id = s.id
         WHERE d.id = ?`
      )
      .get(id);

    return NextResponse.json(updatedDiscussion);
  } catch (error) {
    console.error("Failed to update discussion:", error);
    return NextResponse.json(
      { error: "Failed to update discussion" },
      { status: 500 }
    );
  }
}

// ディスカッションの削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // トランザクションの開始
    db.prepare("BEGIN TRANSACTION").run();

    try {
      // タイムラインエントリーの削除
      db.prepare("DELETE FROM timeline_entries WHERE discussion_id = ?").run(
        params.id
      );

      // ディスカッションの削除
      const result = db
        .prepare("DELETE FROM discussions WHERE id = ?")
        .run(params.id);

      if (result.changes === 0) {
        db.prepare("ROLLBACK").run();
        return NextResponse.json(
          { error: "Discussion not found" },
          { status: 404 }
        );
      }

      db.prepare("COMMIT").run();
      return NextResponse.json({ message: "Discussion deleted successfully" });
    } catch (error) {
      db.prepare("ROLLBACK").run();
      throw error;
    }
  } catch (error) {
    console.error("Failed to delete discussion:", error);
    return NextResponse.json(
      { error: "Failed to delete discussion" },
      { status: 500 }
    );
  }
}
