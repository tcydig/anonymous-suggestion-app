import { NextResponse } from "next/server";
import db from "@/lib/db";

// フリースペースの更新
export async function PUT(
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

    const result = db
      .prepare(
        `UPDATE discussions
       SET free_space_content = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
      )
      .run(content, params.id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: "Discussion not found" },
        { status: 404 }
      );
    }

    const updatedDiscussion = db
      .prepare("SELECT * FROM discussions WHERE id = ?")
      .get(params.id);

    return NextResponse.json(updatedDiscussion);
  } catch (error) {
    console.error("Failed to update free space:", error);
    return NextResponse.json(
      { error: "Failed to update free space" },
      { status: 500 }
    );
  }
}
