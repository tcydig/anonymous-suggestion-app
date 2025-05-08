"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Send, Clock, MessageSquare, AlertCircle, ChevronDown, User } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { ja } from "date-fns/locale"
import Link from "next/link"
import { getStatusStyles, type ProgressStatus } from "../../lib/discussion-data"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// ステータスの英語エイリアスと日本語表示のマッピング
const STATUS_MAPPING = {
  open: "未対応",
  in_progress: "対応中",
  resolved: "解決済み",
  closed: "取り消し",
} as const;

type StatusAlias = keyof typeof STATUS_MAPPING;

// 英語のステータスを日本語に変換する関数
const getStatusLabel = (status: StatusAlias): ProgressStatus => {
  return STATUS_MAPPING[status] as ProgressStatus;
};

// 日本語からステータスの英語エイリアスに変換する関数
const getStatusAlias = (label: ProgressStatus): StatusAlias => {
  const entry = Object.entries(STATUS_MAPPING).find(
    ([_, value]) => value === label
  );
  return entry ? (entry[0] as StatusAlias) : "open";
};

// タイムラインアイテムの型定義
type TimelineItem = {
  id: string
  content: string
  timestamp: Date
  type: "comment" | "status-change" | "note"
}

// ディスカッションの型定義
interface Discussion {
  id: string
  title: string
  status: StatusAlias
  original_content: string
  original_category: string
  created_at: string
  updated_at: string
  free_space_content: string | null
}

// タイムラインアイテムの背景色を取得する関数
const getTimelineItemStyle = (type: string) => {
  switch (type) {
    case "comment":
      return "bg-white"
    case "status-change":
      return "bg-purple-50"
    case "note":
      return "bg-blue-50"
    default:
      return "bg-white"
  }
}

export default function DiscussionDetailPage() {
  const params = useParams()
  const discussionId = params.id as string

  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [comment, setComment] = useState("")
  const [decisionContent, setDecisionContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showStatusConfirm, setShowStatusConfirm] = useState(false)
  const [newStatus, setNewStatus] = useState<ProgressStatus | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // ディスカッションデータの取得
        const discussionResponse = await fetch(`/api/discussions/${discussionId}`)
        if (!discussionResponse.ok) {
          throw new Error('Failed to fetch discussion')
        }
        const discussionData = await discussionResponse.json()
        setDiscussion(discussionData)
        setDecisionContent(discussionData.free_space_content || "")

        // タイムラインデータの取得
        const timelineResponse = await fetch(`/api/discussions/${discussionId}/timeline`)
        if (!timelineResponse.ok) {
          throw new Error('Failed to fetch timeline')
        }
        const timelineData = await timelineResponse.json()
        
        // タイムラインデータを変換
        const formattedTimelineItems = timelineData.map((item: any) => ({
          id: item.id,
          content: item.content,
          timestamp: new Date(item.created_at),
          type: item.type || "comment"
        }))
        
        // 日付の新しい順にソート
        formattedTimelineItems.sort((a: TimelineItem, b: TimelineItem) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        )
        setTimelineItems(formattedTimelineItems)

        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [discussionId])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (comment.trim()) {
      try {
        const response = await fetch(`/api/discussions/${discussionId}/timeline`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: comment }),
        })

        if (!response.ok) {
          throw new Error('Failed to post comment')
        }

        const newEntry = await response.json()
        const newComment: TimelineItem = {
          id: newEntry.id,
          content: newEntry.content,
          timestamp: new Date(newEntry.created_at),
          type: "comment",
        }

        // 新しいコメントを配列の先頭に追加
        setTimelineItems([newComment, ...timelineItems])
        setComment("")
      } catch (error) {
        console.error('Error posting comment:', error)
      }
    }
  }

  const handleStatusChange = (status: ProgressStatus) => {
    if (!discussion || status === getStatusLabel(discussion.status)) return

    setNewStatus(status)
    setShowStatusConfirm(true)
  }

  const confirmStatusChange = async () => {
    if (!discussion || !newStatus) return

    try {
      const response = await fetch(`/api/discussions/${discussionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: getStatusAlias(newStatus),
          title: discussion.title 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      const updatedDiscussion = await response.json()
      setDiscussion(updatedDiscussion)

      // タイムラインエントリーを追加
      const timelineResponse = await fetch(`/api/discussions/${discussionId}/timeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: `このディスカッションを「${newStatus}」に設定しました。`
        }),
      });

      if (!timelineResponse.ok) {
        throw new Error('Failed to add timeline entry');
      }

      const newTimelineEntry = await timelineResponse.json();
      const statusChangeItem: TimelineItem = {
        id: newTimelineEntry.id,
        content: newTimelineEntry.content,
        timestamp: new Date(newTimelineEntry.created_at),
        type: "status-change",
      }

      // 新しいステータス変更を配列の先頭に追加
      setTimelineItems([statusChangeItem, ...timelineItems])
      setShowStatusConfirm(false)
      setNewStatus(null)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const cancelStatusChange = () => {
    setShowStatusConfirm(false)
    setNewStatus(null)
  }

  const handleDecisionSave = async () => {
    if (!discussion) return

    try {
      const response = await fetch(`/api/discussions/${discussionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: discussion.status,
          title: discussion.title,
          free_space_content: decisionContent 
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save decision')
      }

      const updatedDiscussion = await response.json()
      setDiscussion(updatedDiscussion)
    } catch (error) {
      console.error('Error saving decision:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    )
  }

  if (!discussion) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="h-12 w-12 text-purple-300 mb-4" />
        <h2 className="text-xl font-semibold text-purple-800 mb-2">ディスカッションが見つかりません</h2>
        <p className="text-gray-600 mb-6">指定されたディスカッションは存在しないか、削除された可能性があります。</p>
        <Link href="/discussions">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            ディスカッション一覧に戻る
          </Button>
        </Link>
      </div>
    )
  }

  const statusStyles = getStatusStyles(getStatusLabel(discussion.status))

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="container mx-auto max-w-3xl py-8 px-4">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Link href="/discussions">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100"
            >
              <ArrowLeft className="h-4 w-4" />
              ディスカッション一覧に戻る
            </Button>
          </Link>
        </div>

        {/* ディスカッション情報 */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
          <Card className="border-0 shadow-md mb-6 overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl font-bold text-gray-800">{discussion.title}</CardTitle>

                {/* ステータスドロップダウン */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Badge
                      className={`${getStatusStyles(getStatusLabel(discussion.status)).badgeColor} border-0 text-white cursor-pointer flex items-center gap-1 hover:opacity-90 transition-opacity`}
                    >
                      {getStatusLabel(discussion.status)}
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className={discussion.status === "resolved" ? "bg-green-50 font-medium" : ""}
                      onClick={() => handleStatusChange("解決済み")}
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      解決済み
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={discussion.status === "open" ? "bg-amber-50 font-medium" : ""}
                      onClick={() => handleStatusChange("未対応")}
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                      未対応
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={discussion.status === "in_progress" ? "bg-blue-50 font-medium" : ""}
                      onClick={() => handleStatusChange("対応中")}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      対応中
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={discussion.status === "closed" ? "bg-gray-50 font-medium" : ""}
                      onClick={() => handleStatusChange("取り消し")}
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-500 mr-2"></div>
                      取り消し
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Badge variant="outline" className="text-xs font-normal">
                  {discussion.original_category}
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(discussion.created_at), { addSuffix: true, locale: ja })}作成
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{discussion.original_content}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* ステータス変更確認モーダル */}
        {showStatusConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl"
            >
              <h3 className="text-lg font-bold mb-2">ステータスの変更</h3>
              <p className="mb-4">
                ステータスを「{getStatusLabel(discussion.status)}」から「{newStatus}」に変更しますか？
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={cancelStatusChange}>
                  キャンセル
                </Button>
                <Button
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  onClick={confirmStatusChange}
                >
                  変更する
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 決定内容記録エリア */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-md overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-teal-500 to-emerald-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-teal-600"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                決定内容
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  このディスカッションに関する決定事項や重要な情報を記録してください。
                </p>
                <Textarea
                  placeholder="決定内容や対応方針などを入力してください..."
                  value={decisionContent}
                  onChange={(e) => setDecisionContent(e.target.value)}
                  className="min-h-24 border-teal-200 focus:border-teal-300 focus:ring-teal-300 bg-white/80 backdrop-blur-sm rounded-xl text-gray-700 placeholder:text-gray-400"
                />
                {decisionContent && (
                  <div className="mt-4 p-4 bg-teal-50 rounded-lg">
                    <h4 className="text-sm font-medium text-teal-800 mb-2">現在の決定内容</h4>
                    <p className="text-gray-700 whitespace-pre-line">{decisionContent}</p>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button
                    onClick={handleDecisionSave}
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2"
                    >
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    保存する
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* コメント入力エリア */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <form onSubmit={handleCommentSubmit}>
                <div className="mb-3">
                  <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                    コメントを追加
                  </h3>
                  <Textarea
                    placeholder="このディスカッションについてコメントを入力してください..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-20 border-purple-200 focus:border-purple-300 focus:ring-purple-300 bg-white/80 backdrop-blur-sm rounded-xl text-gray-700 placeholder:text-gray-400"
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                    disabled={!comment.trim()}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    送信する
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* タイムライン */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-purple-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              タイムライン
            </h3>
          </div>

          <div className="space-y-4">
            {timelineItems.length === 0 ? (
              <Card className="border-dashed border-2 border-purple-200 bg-white/50 backdrop-blur-sm">
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <MessageSquare className="h-10 w-10 text-purple-300 mb-3" />
                  <p className="text-center text-gray-500">
                    まだコメントはありません。最初のコメントを投稿してみましょう！
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="relative border-l-2 border-purple-200 pl-6 ml-4 pb-4">
                {timelineItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="mb-6 relative"
                  >
                    {/* タイムラインのドット */}
                    <div className="absolute w-4 h-4 bg-purple-500 rounded-full -left-[30px] top-2 border-2 border-white" />

                    <Card className={`border-0 shadow-sm ${getTimelineItemStyle(item.type)}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8 bg-purple-200 text-purple-700">
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-gray-800">匿名ユーザー</span>
                              <span className="text-xs text-gray-500">
                                {format(item.timestamp, "yyyy/MM/dd HH:mm")}
                              </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-line">{item.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
