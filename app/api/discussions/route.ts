import { NextResponse } from "next/server";
import db from "@/lib/db";

// 総件数の型定義
interface CountResult {
  total: number;
}

// 現在時刻をJSTで取得する関数
function getCurrentTimestamp() {
  const now = new Date();
  return now.toISOString();
}

// ディスカッション一覧の取得
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // クエリの構築
    let query = `
      SELECT 
        d.*,
        s.content as original_content,
        s.category as original_category,
        datetime(d.created_at, '+9 hours') as created_at,
        datetime(d.updated_at, '+9 hours') as updated_at
      FROM discussions d
      LEFT JOIN suggestions s ON d.original_post_id = s.id
    `;

    const params: any[] = [];
    if (status) {
      query += " WHERE d.status = ?";
      params.push(status);
    }

    // ソート
    query += ` ORDER BY d.${sortBy} ${sortOrder.toUpperCase()}`;

    // ページネーション
    query += " LIMIT ? OFFSET ?";
    params.push(limit, offset);

    // 総件数の取得
    const countQuery = `
      SELECT COUNT(*) as total
      FROM discussions d
      ${status ? "WHERE d.status = ?" : ""}
    `;

    const [discussions, totalCount] = await Promise.all([
      db.prepare(query).all(...params),
      db.prepare(countQuery).get(...(status ? [status] : [])) as CountResult,
    ]);

    return NextResponse.json({
      discussions,
      total: totalCount.total,
      hasMore: totalCount.total > offset + limit,
    });
  } catch (error) {
    console.error("Failed to fetch discussions:", error);
    return NextResponse.json(
      { error: "Failed to fetch discussions" },
      { status: 500 }
    );
  }
}

// ディスカッションの作成
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { originalPostId, status, title } = body;

    if (!originalPostId || !status || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 元の投稿の存在確認
    const originalPost = db
      .prepare("SELECT id FROM suggestions WHERE id = ?")
      .get(originalPostId);

    if (!originalPost) {
      return NextResponse.json(
        { error: "Original post not found" },
        { status: 404 }
      );
    }

    const timestamp = getCurrentTimestamp();
    const result = db
      .prepare(
        `INSERT INTO discussions (id, original_post_id, status, title, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        crypto.randomUUID(),
        originalPostId,
        status,
        title,
        timestamp,
        timestamp
      );

    const newDiscussion = db
      .prepare(
        `
        SELECT 
          *,
          datetime(created_at, '+9 hours') as created_at,
          datetime(updated_at, '+9 hours') as updated_at
        FROM discussions 
        WHERE id = ?
      `
      )
      .get(result.lastInsertRowid);

    return NextResponse.json(newDiscussion);
  } catch (error) {
    console.error("Failed to create discussion:", error);
    return NextResponse.json(
      { error: "Failed to create discussion" },
      { status: 500 }
    );
  }
}
