"use client";
import { useCallback } from "react";
import { parseISO, format } from "date-fns";

interface CandidateListProps {
  // 例: [ ["2025-02-03T10:30:00","2025-02-03T11:00:00"], ... ]
  candidates: string[][];
}

export default function CandidateList({ candidates }: CandidateListProps) {
  // "2025-02-03T10:30:00" → "2025/02/03 10:30" のようにフォーマット
  const formatDate = (isoString: string) => {
    try {
      const date = parseISO(isoString);
      return format(date, "yyyy/MM/dd HH:mm");
    } catch (err) {
      console.error("Date parsing error:", err);
      return isoString; // パースできなければ元の文字列
    }
  };

  // "2025-02-03T10:30:00" + "2025-02-03T11:00:00"
  // → "2025/02/03 10:30 ~ 2025/02/03 11:00"
  const formatCandidate = (slotPair: string[]): string => {
    if (slotPair.length !== 2) {
      // 想定と異なるデータ構造ならそのまま返す
      return slotPair.join(" ");
    }
    const [startStr, endStr] = slotPair;
    const startFormatted = formatDate(startStr);
    const endFormatted   = formatDate(endStr);

    return `${startFormatted} ~ ${endFormatted}`;
  };

  // 「コピー」ボタン押下時の処理
  const handleCopy = useCallback(() => {
    if (candidates.length === 0) return;
    // 各ペアを "YYYY/MM/DD HH:mm ~ YYYY/MM/DD HH:mm" で結合し、改行で連結
    const text = candidates
      .map((pair) => formatCandidate(pair))
      .join("\n");

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

      <div className="relative bg-rose-100 p-8 rounded min-h-[400px]">
        {/* コピー用ボタン */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 bg-white text-sm px-2 py-1 rounded shadow hover:bg-gray-50"
        >
          copy
        </button>

        {candidates.length > 0 ? (
          <ul className="list-disc list-inside space-y-1">
            {candidates.map((slotPair, index) => (
              <li key={index}>{formatCandidate(slotPair)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">候補がありません。</p>
        )}
      </div>
    </div>
  );
}
