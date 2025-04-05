"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import PostItem from "@/components/post-item"
import { Filter, SlidersHorizontal } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Post type definition (same as in app/page.tsx)
type Post = {
  id: string
  content: string
  timestamp: Date
  likes: number
  category: string
}

export default function ListPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<string>("newest")

  // Load sample data for demonstration
  useEffect(() => {
    const samplePosts: Post[] = [
      {
        id: "1",
        content: "受付の手続きをもっとデジタル化できたらいいなと思います。紙の書類が多すぎて大変です。",
        timestamp: new Date(Date.now() - 3600000 * 2),
        likes: 5,
        category: "改善提案",
      },
      {
        id: "2",
        content: "今日の患者さんがとても優しくて、心が温かくなりました。こういう瞬間があるから頑張れる！",
        timestamp: new Date(Date.now() - 3600000 * 5),
        likes: 8,
        category: "ぼやき",
      },
      {
        id: "3",
        content: "休憩室のコーヒーマシンが壊れています。誰か修理方法知っていますか？",
        timestamp: new Date(Date.now() - 3600000 * 8),
        likes: 2,
        category: "質問",
      },
      {
        id: "4",
        content: "待合室に観葉植物を置いてはどうでしょうか？リラックス効果があると思います。",
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
    ]
    setPosts(samplePosts)
    setFilteredPosts(samplePosts)
  }, [])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...posts]

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((post) => post.category === categoryFilter)
    }

    // Apply sorting
    if (sortOrder === "newest") {
      result.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    } else if (sortOrder === "oldest") {
      result.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    } else if (sortOrder === "most-liked") {
      result.sort((a, b) => b.likes - a.likes)
    }

    setFilteredPosts(result)
  }, [categoryFilter, sortOrder, posts])

  const handleLike = (id: string) => {
    const updatedPosts = posts.map((post) => (post.id === id ? { ...post, likes: post.likes + 1 } : post))
    setPosts(updatedPosts)
  }

  const handleDelete = (id: string) => {
    setPosts(posts.filter((post) => post.id !== id))
  }

  const handleEdit = (id: string, newContent: string) => {
    setPosts(posts.map((post) => (post.id === id ? { ...post, content: newContent } : post)))
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="container mx-auto max-w-7xl py-8 px-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            投稿一覧
          </h1>
          <p className="text-gray-600">みんなの投稿を見てみましょう</p>
        </motion.div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 w-full sm:w-1/2">
                <Filter className="h-4 w-4 text-purple-600" />
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="カテゴリーで絞り込む" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべてのカテゴリー</SelectItem>
                    <SelectItem value="改善提案">改善提案</SelectItem>
                    <SelectItem value="ぼやき">ぼやき</SelectItem>
                    <SelectItem value="質問">質問</SelectItem>
                    <SelectItem value="アイデア">アイデア</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-1/2">
                <SlidersHorizontal className="h-4 w-4 text-purple-600" />
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="並び替え" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">新しい順</SelectItem>
                    <SelectItem value="oldest">古い順</SelectItem>
                    <SelectItem value="most-liked">いいね数順</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-purple-800">投稿一覧</h2>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 border-0">{filteredPosts.length}件</Badge>
          </div>

          {filteredPosts.length === 0 ? (
            <Card className="border-dashed border-2 border-purple-200 bg-white/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Filter className="h-12 w-12 text-purple-300 mb-4" />
                <p className="text-center text-gray-500">
                  該当する投稿がありません。フィルターを変更してみてください。
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <PostItem 
                    post={post} 
                    onLike={handleLike} 
                    onDelete={handleDelete} 
                    onEdit={handleEdit}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

