# 匿名提案アプリ

このアプリは、匿名で提案や意見を投稿できる Web アプリケーションです。Next.js、TypeScript、Tailwind CSS を使用して構築されています。
![Home画面](/public/lp.png)

## 技術スタック

- Next.js 15.2.4
- React 19
- TypeScript
- Tailwind CSS
- SQLite (better-sqlite3)
- Docker

## 必要条件

- Node.js (v18 以上)
- Docker (オプション)
- pnpm

## セットアップ手順

### ローカル環境でのセットアップ

1. リポジトリをクローン

```bash
git clone [repository-url]
cd anonymous-suggestion-app
```

2. 依存関係のインストール

```bash
pnpm install
```

3. 開発サーバーの起動

```bash
pnpm dev
```

### Docker を使用したセットアップ

1. Docker イメージのビルド

```bash
docker-compose build
```

2. コンテナの起動

```bash
docker-compose up
```

## 使用方法

1. アプリケーションにアクセス

   - ローカル環境: http://localhost:3000
   - Docker 環境: http://localhost:3000

2. 提案の投稿

   - ホームページから「新規提案」ボタンをクリック
   - 提案内容を入力
   - 匿名で投稿

3. 提案の閲覧
   - ホームページで最新の提案を確認
   - カテゴリー別にフィルタリング可能

## テストの実行

```bash
pnpm test
```

## 開発環境の構築

1. コードのフォーマット

```bash
pnpm lint
```

2. ビルド

```bash
pnpm build
```

## ライセンス

MIT License
