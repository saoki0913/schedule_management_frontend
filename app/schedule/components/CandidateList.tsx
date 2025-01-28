"use client"; // フロント側でnavigator.clipboardを使うので必要

import { useCallback } from "react";

interface CandidateListProps {
  candidates: string[];
}

export default function CandidateList({ candidates }: CandidateListProps) {
  // 「コピー」ボタン押下時の処理
  const handleCopy = useCallback(() => {
    if (candidates.length === 0) return;

    const text = candidates.join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("候補日程をコピーしました!");
      })
      .catch((err) => {
        console.error("コピーに失敗しました:", err);
      });
  }, [candidates]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">候補日一覧</h2>

      {/* relativeにして、absolute配置のボタンを右上に */}
      <div className="relative bg-rose-100 p-8 rounded min-h-[400px]">
        {/* コピー用ボタン */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 bg-white text-sm px-2 py-1 rounded shadow hover:bg-gray-50"
        >
          copy
        </button>

        {candidates.length > 0 ? (
          <ul className="list-disc list-inside">
            {candidates.map((slot) => (
              <div key={slot}>{slot}</div>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">候補がありません。</p>
        )}
      </div>
    </div>
  );
}
