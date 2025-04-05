import { Post } from "../types";
import db from "../db";

interface Suggestion {
  id: number;
  content: string;
  category: string;
  likes: number;
  created_at: string;
}

// Mock data
const mockPosts: Post[] = [
  {
    id: "1",
    content:
      "受付の手続きをもっとデジタル化できたらいいなと思います。紙の書類が多すぎて大変です。",
    timestamp: new Date(Date.now() - 3600000 * 2),
    likes: 5,
    category: "改善提案",
  },
  {
    id: "2",
    content:
      "今日の患者さんがとても優しくて、心が温かくなりました。こういう瞬間があるから頑張れる！",
    timestamp: new Date(Date.now() - 3600000 * 5),
    likes: 8,
    category: "ぼやき",
  },
  {
    id: "3",
    content:
      "休憩室のコーヒーマシンが壊れています。誰か修理方法知っていますか？",
    timestamp: new Date(Date.now() - 3600000 * 8),
    likes: 2,
    category: "質問",
  },
  {
    id: "4",
    content:
      "待合室に観葉植物を置いてはどうでしょうか？リラックス効果があると思います。",
    timestamp: new Date(Date.now() - 3600000 * 12),
    likes: 10,
    category: "アイデア",
  },
  {
    id: "5",
    content: "今日の会議、もう少し効率的に進行できたらいいなと思いました。",
    timestamp: new Date(Date.now() - 3600000 * 24),
    likes: 3,
    category: "ぼやき",
  },
  {
    id: "6",
    content: "新しい予約システムの使い方がわかりません。誰か教えてください。",
    timestamp: new Date(Date.now() - 3600000 * 36),
    likes: 1,
    category: "質問",
  },
];

// Fetch all posts
export async function fetchPosts(): Promise<Post[]> {
  const response = await fetch("/api/posts");
  if (!response.ok) {
    throw new Error("投稿の取得に失敗しました");
  }
  return response.json();
}

// Create a new post
export async function createPost({
  content,
  category = "提案",
}: {
  content: string;
  category?: string;
}): Promise<Post> {
  const response = await fetch("/api/posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, category }),
  });

  if (!response.ok) {
    throw new Error("投稿の作成に失敗しました");
  }
  return response.json();
}

// Update a post
export async function updatePost(id: string, content: string): Promise<Post> {
  // In a real application, this would be an API call
  await new Promise((resolve) => setTimeout(resolve, 300));
  const post = mockPosts.find((p) => p.id === id);
  if (!post) {
    throw new Error("Post not found");
  }
  return { ...post, content };
}

// Delete a post
export async function deletePost(id: string): Promise<void> {
  // In a real application, this would be an API call
  await new Promise((resolve) => setTimeout(resolve, 300));
  // Here we would actually delete the post
}

// Like a post
export async function likePost(id: string): Promise<Post> {
  const response = await fetch(`/api/posts/${id}/like`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("いいねの処理に失敗しました");
  }
  return response.json();
}
