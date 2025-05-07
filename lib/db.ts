import Database from "better-sqlite3";

// データベースファイルのパス
const dbPath =
  process.env.NODE_ENV === "development" ? "./dev.db" : "./prod.db";

// データベース接続の作成
const db = new Database(dbPath);

// テーブルの作成
db.exec(`
  CREATE TABLE IF NOT EXISTS suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    category TEXT DEFAULT '改善提案',
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS discussions (
    id TEXT PRIMARY KEY,
    original_post_id INTEGER NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('open', 'in_progress', 'resolved', 'closed' )),
    title TEXT NOT NULL,
    free_space_content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (original_post_id) REFERENCES suggestions(id)
  );

  CREATE TABLE IF NOT EXISTS timeline_entries (
    id TEXT PRIMARY KEY,
    discussion_id TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (discussion_id) REFERENCES discussions(id)
  );
`);

export default db;
