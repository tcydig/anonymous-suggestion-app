"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PenSquare, ThumbsUp, Filter, MessageCircle, Sparkles, Info } from "lucide-react"

export default function HowToUsePage() {
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
            使い方ガイド
          </h1>
          <p className="text-gray-600">つぶやきボックスの使い方を紹介します</p>
        </motion.div>

        <div className="space-y-6">
          {/* アプリの存在理由セクション */}
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-indigo-600" />
                  このアプリについて
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium text-gray-800">つぶやきボックスが存在する理由：</p>
                <ul className="list-disc list-inside space-y-3 pl-4">
                  <li className="text-gray-700">
                    <span className="font-medium">気軽な意見共有の場</span>
                    <p className="mt-1 text-gray-600 pl-5">
                      事務員やスタッフの方が気軽に思っていることを残せる場所を作りたいという想いから生まれました。
                      日々の業務の中で感じたことや改善点を匿名で共有できます。
                    </p>
                  </li>
                  <li className="text-gray-700">
                    <span className="font-medium">サービス改善のための意見収集</span>
                    <p className="mt-1 text-gray-600 pl-5">
                      皆さんの自然な意見をもとにアプリ化の材料にしたいと考えています。
                      投稿された内容は今後のサービス改善やシステム開発の貴重な参考資料となります。
                    </p>
                  </li>
                </ul>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 mt-4">
                  <p className="text-purple-800 text-sm">
                    このアプリはスタッフの皆さんの声を大切にし、より良い職場環境づくりをサポートするためのツールです。
                    匿名性が保たれているので、安心して率直な意見を共有してください。
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-purple-500 to-pink-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PenSquare className="h-5 w-5 text-purple-600" />
                  投稿する
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>「投稿」ページで、あなたの考えや提案を共有しましょう。以下の手順に従ってください：</p>
                <ol className="list-decimal list-inside space-y-2 pl-4">
                  <li>投稿カテゴリーを選択します（改善提案、ぼやき、質問、アイデア）</li>
                  <li>テキストエリアに内容を入力します</li>
                  <li>「つぶやく」ボタンをクリックして投稿を完了します</li>
                </ol>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  すべての投稿は匿名で行われます。個人情報は含めないようにしましょう。
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-cyan-400" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-blue-600" />
                  いいねする
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>他のユーザーの投稿に「いいね」をつけて、共感や支持を表現できます：</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>投稿の下部にあるハートアイコンをクリックします</li>
                  <li>いいねの数は投稿の下部に表示されます</li>
                </ul>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  いいねは匿名で行われ、誰がいいねしたかは表示されません。
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card className="border-0 shadow-md overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-green-400 to-emerald-500" />
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-green-600" />
                  投稿を閲覧・フィルタリングする
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>「一覧」ページでは、すべての投稿を閲覧したり、フィルタリングしたりできます：</p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>カテゴリーで絞り込むことができます</li>
                  <li>新しい順、古い順、いいね数順で並び替えることができます</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  )
}

