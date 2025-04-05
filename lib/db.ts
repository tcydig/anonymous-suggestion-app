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
    category TEXT DEFAULT '提案',
    likes INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
