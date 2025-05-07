"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface Discussion {
  id: string;
  title: string;
  status: "open" | "in_progress" | "closed";
  original_content: string;
  original_category: string;
  created_at: string;
  updated_at: string;
}

interface DiscussionsResponse {
  discussions: Discussion[];
  total: number;
  hasMore: boolean;
}

const statusLabels = {
  open: "未対応",
  in_progress: "対応中",
  closed: "完了",
};

const statusColors = {
  open: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  closed: "bg-green-100 text-green-800",
};

export default function DiscussionsPage() {
  const router = useRouter();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [page]);

  const fetchDiscussions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/discussions?page=${page}&limit=10&sortBy=created_at&sortOrder=desc`
      );
      const data: DiscussionsResponse = await response.json();

      if (page === 1) {
        setDiscussions(data.discussions);
      } else {
        setDiscussions((prev) => [...prev, ...data.discussions]);
      }
      setHasMore(data.hasMore);
      setError(null);
    } catch (err) {
      setError("ディスカッションの取得に失敗しました");
      console.error("Failed to fetch discussions:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setPage((prev) => prev + 1);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "yyyy年MM月dd日 HH:mm", {
      locale: ja,
    });
  };

  if (loading && page === 1) {
    return (
      <div className="container mx-auto p-4 space-y-4">
        <h1 className="text-2xl font-bold mb-6">ディスカッション一覧</h1>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="w-full">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ディスカッション一覧</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {discussions.length === 0 && !loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">ディスカッションはまだありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <Card
              key={discussion.id}
              className="w-full hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/discussions/${discussion.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{discussion.title}</CardTitle>
                  <Badge
                    className={`${statusColors[discussion.status]} font-medium`}
                  >
                    {statusLabels[discussion.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {discussion.original_content}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{discussion.original_category}</Badge>
                    </div>
                    <div className="text-right">
                      <p>作成: {formatDate(discussion.created_at)}</p>
                      <p>更新: {formatDate(discussion.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMore && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? "読み込み中..." : "もっと見る"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 