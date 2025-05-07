// ディスカッションの進捗ステータス
export type ProgressStatus = "未対応" | "対応中" | "解決済み" | "取り消し";

// ディスカッションの型定義
export type Discussion = {
  id: string;
  title: string;
  content: string;
  category: string;
  status: ProgressStatus;
  createdAt: Date;
  updatedAt: Date;
};

// サンプルのディスカッションデータ
export const sampleDiscussions: Discussion[] = [
  {
    id: "1",
    title: "受付システムの改善提案",
    content:
      "現在の受付システムが使いにくいため、改善を提案します。\n\n主な問題点：\n1. 操作が複雑で直感的でない\n2. 処理速度が遅い\n3. エラーメッセージがわかりにくい",
    category: "システム改善",
    status: "対応中",
    createdAt: new Date(Date.now() - 3600000 * 24 * 5),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 3),
  },
  {
    id: "2",
    title: "コーヒーマシンの故障について",
    content: "休憩室のコーヒーマシンが故障しています。修理が必要です。",
    category: "設備管理",
    status: "解決済み",
    createdAt: new Date(Date.now() - 3600000 * 24 * 7),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 2),
  },
  {
    id: "4",
    title: "オフィスレイアウトの変更提案",
    content:
      "現在のオフィスレイアウトをより効率的な配置に変更することを提案します。",
    category: "オフィス環境",
    status: "取り消し",
    createdAt: new Date(Date.now() - 3600000 * 24 * 15),
    updatedAt: new Date(Date.now() - 3600000 * 24 * 9),
  },
];

// ステータスに応じた色とアイコンを取得する関数
export const getStatusStyles = (status: ProgressStatus) => {
  switch (status) {
    case "解決済み":
      return {
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        borderColor: "border-green-200",
        badgeColor: "bg-green-500",
        label: "解決済み",
      };
    case "対応中":
      return {
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
        borderColor: "border-blue-200",
        badgeColor: "bg-blue-500",
        label: "対応中",
      };
    case "未対応":
      return {
        bgColor: "bg-amber-100",
        textColor: "text-amber-700",
        borderColor: "border-amber-200",
        badgeColor: "bg-amber-500",
        label: "未対応",
      };
    case "取り消し":
      return {
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        borderColor: "border-red-200",
        badgeColor: "bg-red-500",
        label: "取り消し",
      };
    default:
      return {
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
        borderColor: "border-gray-200",
        badgeColor: "bg-gray-500",
        label: "不明",
      };
  }
};
