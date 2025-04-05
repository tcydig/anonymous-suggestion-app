"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Heart, Trash2, Pencil, Check, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Update the Post type definition
type Post = {
  id: string
  content: string
  timestamp: Date
  likes: number
  category: string
}

// Update the PostItemProps interface
interface PostItemProps {
  post: Post
  onLike: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (id: string, newContent: string) => void
}

// Helper function to get gradient based on category
const getCategoryGradient = (category: string) => {
  switch (category) {
    case "改善提案":
      return "from-blue-500 to-cyan-400"
    case "ぼやき":
      return "from-orange-400 to-pink-500"
    case "質問":
      return "from-purple-500 to-indigo-400"
    case "アイデア":
      return "from-green-400 to-emerald-500"
    default:
      return "from-gray-400 to-gray-500"
  }
}

// Remove the onReaction and reactions props from the function parameters
export default function PostItem({ post, onLike, onDelete, onEdit }: PostItemProps) {
  const [liked, setLiked] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(post.content)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const handleLike = () => {
    if (!liked) {
      onLike(post.id)
      setLiked(true)
    }
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    onDelete(post.id)
    setShowDeleteDialog(false)
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    onEdit(post.id, editedContent)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedContent(post.content)
    setIsEditing(false)
  }

  const categoryGradient = getCategoryGradient(post.category)

  return (
    <>
      <Card
        className={`border-0 shadow-md transition-all duration-300 ${
          isHovered ? "shadow-lg transform -translate-y-1" : ""
        } overflow-hidden`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`h-1 w-full bg-gradient-to-r ${categoryGradient}`} />
        <CardContent className="pt-6 relative">
          <Badge className={`absolute top-2 right-2 bg-gradient-to-r ${categoryGradient} border-0 text-white text-xs`}>
            {post.category}
          </Badge>

          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-32 border-purple-200 focus:border-purple-300 focus:ring-purple-300 bg-white/80 backdrop-blur-sm rounded-xl text-gray-700"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleCancel}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-1 text-purple-600 hover:text-purple-700 transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-gray-800">{post.content}</p>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center border-t border-purple-100 py-3 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(post.timestamp, { addSuffix: true, locale: ja })}
          </span>

          <div className="flex items-center gap-3">
            {/* Edit button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleEdit}
                    className="text-gray-400 hover:text-purple-500 transition-colors"
                    disabled={isEditing}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>編集</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Delete button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleDelete}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    disabled={isEditing}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>削除</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Like button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1 ${
                      liked ? "text-pink-600" : "text-purple-600 hover:text-pink-600"
                    } transition-colors`}
                    disabled={liked || isEditing}
                  >
                    <Heart className={`h-4 w-4 transition-all ${liked ? "fill-pink-600 scale-110" : ""}`} />
                    <span>{post.likes}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>いいね</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>投稿を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。投稿を削除すると、すべてのデータが完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

