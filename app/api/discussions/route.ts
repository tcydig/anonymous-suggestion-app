import { NextResponse } from "next/server";
import db from "@/lib/db";

// 総件数の型定義
interface CountResult {
  total: number;
}

// ステータスの英語エイリアスと日本語表示のマッピング
const STATUS_MAPPING = {
  open: "未対応",
  in_progress: "対応中",
  resolved: "解決済み",
  closed: "取り消し",
} as const;

type StatusAlias = keyof typeof STATUS_MAPPING;

interface Discussion {
  id: string;
  original_post_id: string;
  title: string;
  status: StatusAlias;
  free_space_content: string | null;
  created_at: string;
  updated_at: string;
  original_content: string;
  original_category: string;
}

// 現在時刻をJSTで取得する関数
function getCurrentTimestamp() {
  const now = new Date();
  return now.toISOString();
}

// ステータスを日本語に変換する関数
const getStatusLabel = (status: StatusAlias): string => {
  return STATUS_MAPPING[status] || "不明";
};

// 日本語からステータスの英語エイリアスに変換する関数
const getStatusAlias = (label: string): StatusAlias => {
  const entry = Object.entries(STATUS_MAPPING).find(
    ([_, value]) => value === label
  );
  return entry ? (entry[0] as StatusAlias) : "open";
};

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
    const { originalPostId, title } = body;

    if (!originalPostId || !title) {
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

    const result = db
      .prepare(
        `INSERT INTO discussions (
          id,
          original_post_id,
          title,
          status,
          free_space_content,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        crypto.randomUUID(),
        originalPostId,
        title,
        "open",
        null,
        getCurrentTimestamp(),
        getCurrentTimestamp()
      );

    const newDiscussion = db
      .prepare(
        `SELECT d.*, p.content as original_content, p.category as original_category
         FROM discussions d
         JOIN posts p ON d.original_post_id = p.id
         WHERE d.id = ?`
      )
      .get(result.lastInsertRowid) as Discussion;

    // タイムスタンプをISO文字列に変換し、ステータスを日本語に変換
    const formattedDiscussion = {
      ...newDiscussion,
      created_at: new Date(newDiscussion.created_at).toISOString(),
      updated_at: new Date(newDiscussion.updated_at).toISOString(),
      status: getStatusLabel(newDiscussion.status),
    };

    return NextResponse.json(formattedDiscussion);
  } catch (error) {
    console.error("Failed to create discussion:", error);
    return NextResponse.json(
      { error: "Failed to create discussion" },
      { status: 500 }
    );
  }
}
