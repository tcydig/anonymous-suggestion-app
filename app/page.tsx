"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, MessageCircle, ArrowRight } from "lucide-react"
import PostItem from "@/components/post-item"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import confetti from "canvas-confetti"
import Link from "next/link"
import { Post, categories } from "@/lib/types"
import { fetchPosts, createPost, updatePost, deletePost, likePost } from "@/lib/api/posts"

// Remove the reactions array
// const reactions = ['👍', '❤️', '😂', '😮', '😢', '👏'];

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [input, setInput] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(categories[0].name)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [visiblePosts, setVisiblePosts] = useState(10)
  const [isLoading, setIsLoading] = useState(true)

  // Load posts
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const data = await fetchPosts()
        setPosts(data.suggestions)
        setHasMore(data.hasMore)
      } catch (error) {
        console.error("Failed to fetch posts:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadPosts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      try {
        const newPost = await createPost({
          content: input,
          category: selectedCategory,
        })

        setPosts([newPost, ...posts])
        setInput("")

        // Trigger confetti effect when posting
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      } catch (error) {
        console.error("Failed to create post:", error)
      }
    }
  }

  const handleLike = async (id: string) => {
    try {
      const updatedPost = await likePost(id)
      setPosts(posts.map((post) => (post.id === id ? updatedPost : post)))
    } catch (error) {
      console.error("Failed to like post:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePost(id)
      setPosts(posts.filter((post) => post.id !== id))
    } catch (error) {
      console.error("Failed to delete post:", error)
    }
  }

  const handleEdit = async (id: string, newContent: string) => {
    try {
      const updatedPost = await updatePost(id, newContent)
      setPosts(posts.map((post) => (post.id === id ? updatedPost : post)))
    } catch (error) {
      console.error("Failed to update post:", error)
    }
  }

  // Remove the handleReaction function
  // const handleReaction = (id: string, emoji: string) => {
  //   setPosts(
  //     posts.map((post) => {
  //       if (post.id === id) {
  //         const updatedReactions = { ...post.reactions }
  //         updatedReactions[emoji] = (updatedReactions[emoji] || 0) + 1
  //         return { ...post, reactions: updatedReactions }
  //       }
  //       return post
  //     }),
  //   )
  // }

  const handleLoadMore = () => {
    setVisiblePosts((prev) => prev + 10)
  }

  const displayedPosts = posts.slice(0, visiblePosts)
  const hasMorePosts = posts.length > visiblePosts

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
            みんなのつぶやきボックス
          </h1>
          <p className="text-gray-600">気軽にぼやいて、共感して、繋がろう</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex justify-center gap-4 mb-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="w-1/2 border-0 shadow-md bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-700">{posts.length}</p>
              <p className="text-xs text-gray-600">投稿</p>
            </CardContent>
          </Card>
          <Card className="w-1/2 border-0 shadow-md bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{posts.reduce((sum, post) => sum + post.likes, 0)}</p>
              <p className="text-xs text-gray-600">いいね</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Input form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-12"
        >
          <Card
            className={`border-0 shadow-lg transition-all duration-300 ${
              isInputFocused ? "ring-2 ring-purple-300 shadow-purple-200/50" : "hover:shadow-xl"
            }`}
          >
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {categories.map((category) => (
                    <Badge
                      key={category.name}
                      className={`cursor-pointer ${category.color} border-0 text-white ${
                        selectedCategory === category.name
                          ? "ring-2 ring-offset-2 ring-purple-300"
                          : "opacity-70 hover:opacity-100"
                      }`}
                      onClick={() => setSelectedCategory(category.name)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>

                <div className="relative">
                  <Textarea
                    placeholder={`今日はどんな気持ち？何か共有したいことは？\nこんなのあったらいいな～って思うことはある？`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    className="min-h-32 border-purple-200 focus:border-purple-300 focus:ring-purple-300 bg-white/80 backdrop-blur-sm rounded-xl text-gray-700 placeholder:text-gray-400"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white text-xs">
                      {selectedCategory}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500 flex items-center">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    <span>匿名で投稿されます</span>
                  </div>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    つぶやく
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-purple-800">みんなのつぶやき</h2>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 border-0">新着 {posts.length}件</Badge>
          </div>

          <AnimatePresence>
            {isLoading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="border-dashed border-2 border-purple-200 bg-white/50 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400" />
                    <p className="text-center text-gray-500 mt-4">
                      投稿を読み込んでいます...
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : posts.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card className="border-dashed border-2 border-purple-200 bg-white/50 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <MessageCircle className="h-12 w-12 text-purple-300 mb-4" />
                    <p className="text-center text-gray-500">
                      まだ投稿はありません。最初のつぶやきを投稿してみましょう！
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayedPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -20, opacity: 0 }}
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
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-center mt-8"
                  >
                    <Link href="/list">
                      <Button
                        variant="outline"
                        className="border-purple-200 hover:border-purple-300 text-purple-600 hover:text-purple-700 hover:bg-purple-50 group"
                      >
                        さらに見る
                        <ArrowRight className="ml-2 h-4 w-4 transform transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}

