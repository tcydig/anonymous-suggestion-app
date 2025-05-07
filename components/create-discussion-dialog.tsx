"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircle } from "lucide-react"

interface CreateDiscussionDialogProps {
  isOpen: boolean
  onClose: () => void
  originalPostId: string
}

export function CreateDiscussionDialog({
  isOpen,
  onClose,
  originalPostId,
}: CreateDiscussionDialogProps) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("タイトルを入力してください")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/discussions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalPostId,
          title,
          status: "未対応",
        }),
      })

      if (!response.ok) {
        throw new Error("ディスカッションの作成に失敗しました")
      }

      onClose()
      router.push("/discussions")
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期せぬエラーが発生しました")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-purple-600" />
            ディスカッションを作成
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">タイトル</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ディスカッションのタイトルを入力"
                className="w-full"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              キャンセル
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "作成中..." : "ディスカッションを作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 