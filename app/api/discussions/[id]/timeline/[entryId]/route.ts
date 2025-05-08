import { NextResponse } from "next/server";
import db from "@/lib/db";

// タイムラインエントリーの更新
export async function PUT(
  request: Request,
  { params }: { params: { id: string; entryId: string } }
) {
  try {
    const { id, entryId } = await params;
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const result = db
      .prepare(
        `UPDATE timeline_entries
       SET content = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND discussion_id = ?`
      )
      .run(content, entryId, id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Timeline entry not found" },
        { status: 404 }
      );
    }

    const updatedEntry = db
      .prepare("SELECT * FROM timeline_entries WHERE id = ?")
      .get(entryId);

    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error("Failed to update timeline entry:", error);
    return NextResponse.json(
      { error: "Failed to update timeline entry" },
      { status: 500 }
    );
  }
}

// タイムラインエントリーの削除
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; entryId: string } }
) {
  try {
    const { id, entryId } = await params;
    const result = db
      .prepare(
        "DELETE FROM timeline_entries WHERE id = ? AND discussion_id = ?"
      )
      .run(entryId, id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Timeline entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Timeline entry deleted successfully",
    });
  } catch (error) {
    console.error("Failed to delete timeline entry:", error);
    return NextResponse.json(
      { error: "Failed to delete timeline entry" },
      { status: 500 }
    );
  }
}
