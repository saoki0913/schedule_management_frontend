// app/profile/[userId]/page.tsx
import Image from "next/image";
import React from "react";

// ユーザー情報の型(例)
type User = {
  id: string;
  name: string;
  furigana: string;
  age: number;
  finalEducation: string;
  career: string;
  resumeUrl?: string;
  careerSheetUrl?: string;
  currentStep: number; // 進行状況を数値で表す
};

export default async function ProfilePage({
  params,
}: {
  params: { userId: string };
}) {
  const userId = params.userId;

  // 本来は fetch や DB クエリなどでユーザー情報を取得する
  // 今回はモック的に userId を使ってなんとなくデータ生成してみる例
  const user: User = {
    id: userId,
    name: `山田 太郎(${userId})`,
    furigana: "やまだ たろう",
    age: 30,
    finalEducation: "○○大学",
    career: "○○株式会社",
    resumeUrl: "#", // 履歴書のURL
    careerSheetUrl: "#", // 職務経歴書のURL
    // 例: userId を数値にしたときの剰余で適当に currentStep を決める
    currentStep: Number(userId) % 10, 
  };

  // 面談ステップ（仮に10ステップある想定）
  // currentStep の値に応じてどこまで色をつけるかを決定
  const totalSteps = 10;
  const steps = Array.from({ length: totalSteps }, (_, idx) => {
    // idx は0-based、currentStep が例えば3なら、ステップ0~3までは色付き、それ以降はグレー
    const isActive = idx <= user.currentStep;
    return {
      label: stepLabel(idx), // 例: ラベル生成ロジック
      color: isActive ? "bg-purple-700 text-white" : "bg-gray-300 text-black",
    };
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー相当 */}
      <header className="bg-white shadow px-4 py-3 flex items-center justify-between">
        <div>
          <button className="mr-2 px-3 py-1 border rounded">Sign in</button>
          <button className="px-3 py-1 border rounded bg-black text-white">
            Register
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-7xl h-auto mx-auto p-6 bg-white mt-4 shadow">
        {/* 上部エリア */}
        <div className="flex items-start">
          {/* プロフィール画像(仮) */}
          <div className="w-36 h-36 bg-gray-300 flex-shrink-0 mr-6" />

          <div>
            <p className="text-gray-500">{user.furigana}</p>
            <h2 className="text-2xl font-bold">
              {user.name} （{user.age}）
            </h2>
          </div>
        </div>

        {/* ステップバー表示 */}
        <div className="flex items-center mt-6 space-x-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center">
              <div
                className={`px-4 py-2 rounded-r-full ${step.color} ${
                  idx === 0 ? "rounded-l-full" : ""
                }`}
              >
                {step.label}
              </div>
              {idx < steps.length - 1 && (
                <div className="w-2 h-2 transform rotate-45 bg-transparent" />
              )}
            </div>
          ))}
        </div>

        {/* 基本情報 */}
        <div className="mt-8 space-y-2">
          <div>
            <span className="text-xl font-bold mr-4">最終学歴</span>
            <span>{user.finalEducation}</span>
          </div>
          <div>
            <span className="text-xl font-bold mr-4">職務経歴</span>
            <span>{user.career}</span>
          </div>
          <div>
            <span className="text-xl font-bold mr-4">履歴書</span>
            {user.resumeUrl ? (
              <a href={user.resumeUrl} target="_blank" rel="noopener noreferrer">
                {/* 添付アイコンの例: paperclip.svg など */}
                <Image
                  src="/paperclip.svg"
                  width={16}
                  height={16}
                  alt="PDF"
                  className="inline-block ml-1"
                />
              </a>
            ) : (
              "未登録"
            )}
          </div>
          <div>
            <span className="text-xl font-bold mr-4">職務経歴書</span>
            {user.careerSheetUrl ? (
              <a
                href={user.careerSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/paperclip.svg"
                  width={16}
                  height={16}
                  alt="PDF"
                  className="inline-block ml-1"
                />
              </a>
            ) : (
              "未登録"
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * ステップ毎のラベルを生成する例
 * 実際にはDBにステップ情報を持っているかもしれないので、適宜置き換えてください
 */
function stepLabel(stepIndex: number) {
  switch (stepIndex) {
    case 0: return "エントリー";
    case 1: return "調整中";
    case 2: return "カジュアル";
    case 3: return "調整中";
    case 4: return "1次";
    case 5: return "調整中";
    case 6: return "2次";
    case 7: return "調整中";
    case 8: return "最終";
    case 9: return "調整中";
    default: return "不明なステップ";
  }
}
