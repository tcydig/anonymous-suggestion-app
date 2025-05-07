"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, SlidersHorizontal, Clock, AlertCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import { Label } from "@/components/ui/label"

// ディスカッションの進捗ステータス
type ProgressStatus = "未対応" | "対応中" | "完了" | "保留" | "取り消し"

// ディスカッションの型定義
type Discussion = {
  id: string
  title: string
  original_content: string
  original_category: string
  status: ProgressStatus
  created_at: string
  updated_at: string
}

// APIレスポンスの型定義
interface DiscussionsResponse {
  discussions: Discussion[]
  total: number
  hasMore: boolean
}

// ステータスに応じた色とアイコンを取得する関数
const getStatusStyles = (status: ProgressStatus) => {
  switch (status) {
    case "完了":
      return {
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        borderColor: "border-green-200",
        badgeColor: "bg-green-500",
        label: "完了"
      }
    case "対応中":
      return {
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
        badgeColor: "bg-blue-500",
        label: "対応中"
      }
    case "未対応":
      return {
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
        badgeColor: "bg-amber-500",
        label: "未対応"
      }
    case "保留":
      return {
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        borderColor: "border-gray-200",
        badgeColor: "bg-gray-500",
        label: "保留"
      }
    case "取り消し":
      return {
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        borderColor: "border-red-200",
        badgeColor: "bg-red-500",
        label: "取り消し"
      }
    default:
      return {
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        borderColor: "border-gray-200",
        badgeColor: "bg-gray-500",
        label: "不明"
      }
  }
}

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [filteredDiscussions, setFilteredDiscussions] = useState<Discussion[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<string>("newest")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  // APIからデータを取得
  const fetchDiscussions = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/discussions?page=${page}&limit=10&status=${statusFilter !== "all" ? statusFilter : ""}&sortBy=created_at&sortOrder=${sortOrder === "newest" ? "desc" : "asc"}`
      )
      const data: DiscussionsResponse = await response.json()

      if (page === 1) {
        setDiscussions(data.discussions)
        setFilteredDiscussions(data.discussions)
      } else {
        setDiscussions(prev => [...prev, ...data.discussions])
        setFilteredDiscussions(prev => [...prev, ...data.discussions])
      }
      setHasMore(data.hasMore)
      setError(null)
    } catch (err) {
      setError("ディスカッションの取得に失敗しました")
      console.error("Failed to fetch discussions:", err)
    } finally {
      setLoading(false)
    }
  }

  // 初回読み込みとフィルター変更時のデータ取得
  useEffect(() => {
    setPage(1)
    fetchDiscussions()
  }, [statusFilter, sortOrder])

  // ページネーション
  const loadMore = () => {
    setPage(prev => prev + 1)
    fetchDiscussions()
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="container mx-auto max-w-3xl py-8 px-4">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
            ディスカッション
          </h1>
          <p className="text-gray-600">投稿から生まれた議論や対応状況を確認できます</p>
        </motion.div>

        {/* フィルターとソート */}
        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="flex items-center gap-2 w-full sm:w-1/2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="status">ステータス</Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => setStatusFilter(value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="ステータスを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="未対応">未対応</SelectItem>
                      <SelectItem value="対応中">対応中</SelectItem>
                      <SelectItem value="完了">完了</SelectItem>
                      <SelectItem value="保留">保留</SelectItem>
                      <SelectItem value="取り消し">取り消し</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-1/2">
                <SlidersHorizontal className="h-4 w-4 text-purple-600" />
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="並び替え" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">作成日時（新しい順）</SelectItem>
                    <SelectItem value="oldest">作成日時（古い順）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* エラーメッセージ */}
        {error && (
          <Card className="mb-6 border-0 shadow-md bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* ディスカッション一覧 */}
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-purple-800">ディスカッション一覧</h2>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 border-0">
              {filteredDiscussions.length}件
            </Badge>
          </div>

          {loading && page === 1 ? (
            // ローディング表示
            <Card className="border-dashed border-2 border-purple-200 bg-white/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4" />
                <p className="text-center text-gray-500">読み込み中...</p>
              </CardContent>
            </Card>
          ) : filteredDiscussions.length === 0 ? (
            // データなし表示
            <Card className="border-dashed border-2 border-purple-200 bg-white/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-purple-300 mb-4" />
                <p className="text-center text-gray-500">
                  該当するディスカッションがありません。フィルターを変更してみてください。
                </p>
              </CardContent>
            </Card>
          ) : (
            // ディスカッション一覧表示
            <>
              {filteredDiscussions.map((discussion, index) => {
                const statusStyles = getStatusStyles(discussion.status || "未対応")

                return (
                  <motion.div
                    key={discussion.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className="flex items-center p-4 border-b border-gray-100">
                        <div className="flex-1">
                          <h3 className="font-medium text-lg text-gray-800">{discussion.title}</h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                            <Badge variant="outline" className="text-xs font-normal">
                              {discussion.original_category}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true, locale: ja })}作成
                            </span>
                          </div>
                        </div>
                        <Badge className={`${statusStyles.badgeColor} border-0 text-white`}>
                          {statusStyles.label}
                        </Badge>
                      </div>
                      <CardContent className="p-4">
                        <p className="text-gray-700 mb-4 line-clamp-2">{discussion.original_content}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            最終更新: {formatDistanceToNow(new Date(discussion.updated_at), { addSuffix: true, locale: ja })}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}

              {/* もっと見るボタン */}
              {hasMore && (
                <div className="text-center mt-6">
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? "読み込み中..." : "もっと見る"}
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
