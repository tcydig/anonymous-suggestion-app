"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import PostItem from "@/components/post-item"
import { Filter, SlidersHorizontal } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Post } from "@/lib/types"
import { fetchPosts, updatePost, deletePost, likePost } from "@/lib/api/posts"

export default function ListPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<string>("newest")
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [offset, setOffset] = useState(0)

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts(20, 0)
        setPosts(data.suggestions)
        setFilteredPosts(data.suggestions)
        setHasMore(data.hasMore)
        setOffset(20)
      } catch (error) {
        console.error("Failed to fetch posts:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadPosts()
  }, [])

  const loadMorePosts = async () => {
    try {
      const data = await fetchPosts(20, offset)
      setPosts(prevPosts => [...prevPosts, ...data.suggestions])
      setHasMore(data.hasMore)
      setOffset(prevOffset => prevOffset + 20)
    } catch (error) {
      console.error("Failed to fetch more posts:", error)
    }
  }

  // Apply filters and sorting
  useEffect(() => {
    let result = [...posts]

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter((post) => post.category === categoryFilter)
    }

    // Apply sorting
    if (sortOrder === "newest") {
      result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } else if (sortOrder === "oldest") {
      result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    } else if (sortOrder === "most-liked") {
      result.sort((a, b) => b.likes - a.likes)
    }

    setFilteredPosts(result)
  }, [categoryFilter, sortOrder, posts])

  const handleLike = async (id: string) => {
    try {
      const updatedPost = await likePost(id)
      const updatedPosts = posts.map((post) => (post.id === id ? updatedPost : post))
      setPosts(updatedPosts)
    } catch (error) {
      console.error("Failed to like post:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id)
      const updatedPosts = posts.filter((post) => post.id !== id)
      setPosts(updatedPosts)
    } catch (error) {
      console.error("Failed to delete post:", error)
    }
  }

  const handleEdit = async (id: string, newContent: string) => {
    try {
      const updatedPost = await updatePost(id, newContent)
      const updatedPosts = posts.map((post) => (post.id === id ? updatedPost : post))
      setPosts(updatedPosts)
    } catch (error) {
      console.error("Failed to update post:", error)
    }
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

          {isLoading ? (
            <Card className="border-dashed border-2 border-purple-200 bg-white/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400" />
                <p className="text-center text-gray-500 mt-4">
                  投稿を読み込んでいます...
                </p>
              </CardContent>
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card className="border-dashed border-2 border-purple-200 bg-white/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Filter className="h-12 w-12 text-purple-300 mb-4" />
                <p className="text-center text-gray-500">
                  該当する投稿がありません。フィルターを変更してみてください。
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
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
              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMorePosts}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:opacity-90 transition-opacity"
                  >
                    もっと見る
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

