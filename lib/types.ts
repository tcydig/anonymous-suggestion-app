// Post type definition
export type Post = {
  id: string;
  content: string;
  timestamp: Date;
  likes: number;
  category: string;
};

// Category type definition
export type Category = {
  name: string;
  color: string;
};

// Categories for posts
export const categories: Category[] = [
  { name: "改善提案", color: "bg-gradient-to-r from-blue-500 to-cyan-400" },
  { name: "ぼやき", color: "bg-gradient-to-r from-orange-400 to-pink-500" },
  { name: "質問", color: "bg-gradient-to-r from-purple-500 to-indigo-400" },
  { name: "アイデア", color: "bg-gradient-to-r from-green-400 to-emerald-500" },
];
