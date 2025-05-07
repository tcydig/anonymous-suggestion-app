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
import { sampleDiscussions, getStatusStyles, type Discussion, type ProgressStatus } from "../../lib/discussion-data"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// タイムラインアイテムの型定義
type TimelineItem = {
  id: string
  content: string
  timestamp: Date
  type: "comment" | "status-change" | "note"
}

// サンプルのタイムラインデータ
const getSampleTimelineItems = (discussionId: string): TimelineItem[] => {
  switch (discussionId) {
    case "1":
      return [
        {
          id: "t1-1",
          content: "このディスカッションを「対応中」に設定しました。",
          timestamp: new Date(Date.now() - 3600000 * 24 * 3), // 3日前
          type: "status-change",
        },
        {
          id: "t1-2",
          content:
            "受付システムの問題点をリストアップしました。主に以下の点が挙げられています：\n1. 操作が複雑で直感的でない\n2. 処理速度が遅い\n3. エラーメッセージがわかりにくい",
          timestamp: new Date(Date.now() - 3600000 * 24 * 2), // 2日前
          type: "comment",
        },
        {
          id: "t1-3",
          content: "IT部門に相談したところ、次回のアップデートで改善される予定とのことです。",
          timestamp: new Date(Date.now() - 3600000 * 24), // 1日前
          type: "note",
        },
        {
          id: "t1-4",
          content: "アップデートの具体的な日程は来週発表されるそうです。それまでは現行システムを使用してください。",
          timestamp: new Date(Date.now() - 3600000 * 12), // 12時間前
          type: "comment",
        },
      ]
    case "2":
      return [
        {
          id: "t2-1",
          content: "このディスカッションを「対応中」に設定しました。",
          timestamp: new Date(Date.now() - 3600000 * 24 * 5), // 5日前
          type: "status-change",
        },
        {
          id: "t2-2",
          content: "業者に連絡して修理を依頼しました。来週の火曜日に来る予定です。",
          timestamp: new Date(Date.now() - 3600000 * 24 * 4), // 4日前
          type: "comment",
        },
        {
          id: "t2-3",
          content: "修理費用が高額なため、新しいマシンの購入を検討しています。",
          timestamp: new Date(Date.now() - 3600000 * 24 * 3), // 3日前
          type: "note",
        },
        {
          id: "t2-4",
          content: "新しいコーヒーマシンを発注しました。来週末に届く予定です。",
          timestamp: new Date(Date.now() - 3600000 * 24 * 2), // 2日前
          type: "comment",
        },
        {
          id: "t2-5",
          content: "このディスカッションを「対応済み」に設定しました。",
          timestamp: new Date(Date.now() - 3600000 * 24 * 2), // 2日前
          type: "status-change",
        },
      ]
    case "3":
      return [
        {
          id: "t3-1",
          content: "このディスカッションを「対応中」に設定しました。",
          timestamp: new Date(Date.now() - 3600000 * 24 * 7), // 7日前
          type: "status-change",
        },
        {
          id: "t3-2",
          content: "マニュアル作成を担当します。来週中に完成させる予定です。",
          timestamp: new Date(Date.now() - 3600000 * 24 * 6), // 6日前
          type: "comment",
        },
        {
          id: "t3-3",
          content: "人手不足のため、マニュアル作成が遅れています。もう少しお待ちください。",
          timestamp: new Date(Date.now() - 3600000 * 24 * 4), // 4日前
          type: "note",
        },
        {
          id: "t3-4",
          content: "このディスカッションを「保留」に設定しました。",
          timestamp: new Date(Date.now() - 3600000 * 24 * 4), // 4日前
          type: "status-change",
        },
      ]
    case "4":
      return [
        {
          id: "t4-1",
          content: "このディスカッションを「対応中」に設定しました。",
          timestamp: new Date(Date.now() - 3600000 * 24 * 10), // 10日前
          type: "status-change",
        },
        {
          id: "t4-2",
          content: "予算の関係で今期は難しいかもしれません。次期の予算で検討します。",
          timestamp: new Date(Date.now() - 3600000 * 24 * 9), // 9日前
          type: "comment",
        },
        {
          id: "t4-3",
          content: "このディスカッションを「取り下げ」に設定しました。",
          timestamp: new Date(Date.now() - 3600000 * 24 * 9), // 9日前
          type: "status-change",
        },
      ]
    default:
      return []
  }
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
    // ディスカッションデータの取得
    const foundDiscussion = sampleDiscussions.find((d) => d.id === discussionId)
    if (foundDiscussion) {
      setDiscussion(foundDiscussion)
    }

    // タイムラインデータの取得
    const timelineData = getSampleTimelineItems(discussionId)
    // 日付の新しい順にソート
    timelineData.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    setTimelineItems(timelineData)

    setIsLoading(false)
  }, [discussionId])

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (comment.trim()) {
      const newComment: TimelineItem = {
        id: `new-${Date.now()}`,
        content: comment,
        timestamp: new Date(),
        type: "comment",
      }

      // 新しいコメントを配列の先頭に追加
      setTimelineItems([newComment, ...timelineItems])
      setComment("")
    }
  }

  const handleStatusChange = (status: ProgressStatus) => {
    if (!discussion || status === discussion.status) return

    setNewStatus(status)
    setShowStatusConfirm(true)
  }

  const confirmStatusChange = () => {
    if (!discussion || !newStatus) return

    // ディスカッションのステータスを更新
    const updatedDiscussion = { ...discussion, status: newStatus, updatedAt: new Date() }
    setDiscussion(updatedDiscussion)

    // タイムラインに追加
    const statusChangeItem: TimelineItem = {
      id: `status-${Date.now()}`,
      content: `このディスカッションを「${newStatus}」に設定しました。`,
      timestamp: new Date(),
      type: "status-change",
    }

    // 新しいステータス変更を配列の先頭に追加
    setTimelineItems([statusChangeItem, ...timelineItems])
    setShowStatusConfirm(false)
    setNewStatus(null)
  }

  const cancelStatusChange = () => {
    setShowStatusConfirm(false)
    setNewStatus(null)
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

  const statusStyles = getStatusStyles(discussion.status)

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
                      className={`${statusStyles.badgeColor} border-0 text-white cursor-pointer flex items-center gap-1 hover:opacity-90 transition-opacity`}
                    >
                      {discussion.status}
                      <ChevronDown className="h-3 w-3 ml-1" />
                    </Badge>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className={discussion.status === "解決済み" ? "bg-green-50 font-medium" : ""}
                      onClick={() => handleStatusChange("解決済み")}
                    >
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                      解決済み
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={discussion.status === "未対応" ? "bg-amber-50 font-medium" : ""}
                      onClick={() => handleStatusChange("未対応")}
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                      未対応
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={discussion.status === "対応中" ? "bg-blue-50 font-medium" : ""}
                      onClick={() => handleStatusChange("対応中")}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                      対応中
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={discussion.status === "取り消し" ? "bg-gray-50 font-medium" : ""}
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
                  {discussion.category}
                </Badge>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(discussion.createdAt, { addSuffix: true, locale: ja })}作成
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{discussion.content}</p>
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
                ステータスを「{discussion.status}」から「{newStatus}」に変更しますか？
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
                <div className="flex justify-end">
                  <Button
                    onClick={() => alert("決定内容を保存しました")}
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
