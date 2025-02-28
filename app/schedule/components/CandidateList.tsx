"use client";
import { useCallback } from "react";
import { parseISO, format } from "date-fns";

interface CandidateListProps {
  // 例: [ ["2025-02-03T10:30:00","2025-02-03T11:00:00"], ... ]
  candidates: string[][];
  minTime: string;
  maxTime: string;
  isLoading: boolean; // 親から渡されるローディング状態
  selectedDays: string[]; // 選択された曜日（例: ["月", "火"]）
}

export default function CandidateList({
  candidates,
  minTime,
  maxTime,
  isLoading,
  selectedDays,
}: CandidateListProps) {
  // "2025-02-03T10:30:00" → "yyyy/MM/dd HH:mm" のようにフォーマット
  const formatCandidate = (slotPair: string[]): string => {
    if (slotPair.length !== 2) {
      return slotPair.join(" ");
    }
    try {
      const startDate = parseISO(slotPair[0]);
      const endDate = parseISO(slotPair[1]);
      // 同じ日の場合
      if (format(startDate, "yyyy/MM/dd") === format(endDate, "yyyy/MM/dd")) {
        const datePart = format(startDate, "yyyy/MM/dd");
        const startTime = format(startDate, "HH:mm");
        const endTime = format(endDate, "HH:mm");
        return `${datePart} ${startTime} ~ ${endTime}`;
      } else {
        // 日付が異なる場合は、両方のフルフォーマットを表示
        const startFormatted = format(startDate, "yyyy/MM/dd HH:mm");
        const endFormatted = format(endDate, "yyyy/MM/dd HH:mm");
        return `${startFormatted} ~ ${endFormatted}`;
      }
    } catch (err) {
      console.error("Date parsing error:", err);
      return slotPair.join(" ");
    }
  };

  // 候補の時間帯を、minTime 〜 maxTime の範囲内にフィルタリングする
  //曜日フィルタも適用
  const filteredCandidates = candidates.filter((slotPair) => {
    if (slotPair.length !== 2) return false;
    // 日付部分（最初の10文字）が異なる場合は、日をまたいでいると判断して除外
    if (slotPair[0].substring(0, 10) !== slotPair[1].substring(0, 10))
      return false;

    // ISO 文字列の 11文字目から16文字目が "HH:mm" 部分
    const candidateStart = slotPair[0].substring(11, 16);
    const candidateEnd = slotPair[1].substring(11, 16);
    // 終了時刻が開始時刻よりも早い場合は、0:00をまたいでいるとみなし除外
    if (candidateEnd < candidateStart) return false;
    if (!(candidateStart >= minTime && candidateEnd <= maxTime)) return false;
    
    // 選択された曜日がある場合、候補の開始日時の曜日が含まれているかチェック
    if (selectedDays.length > 0) {
      try {
        const date = parseISO(slotPair[0]);
        const dayIndex = date.getDay(); // 0: 日, 1: 月, ...
        const dayMap = ["日", "月", "火", "水", "木", "金", "土"];
        const candidateDay = dayMap[dayIndex];
        if (!selectedDays.includes(candidateDay)) return false;
      } catch (err) {
        console.error("Day parsing error:", err);
        return false;
      }
    }
    return true;
  });

  // 「コピー」ボタン押下時の処理
  const handleCopy = useCallback(() => {
    if (filteredCandidates.length === 0) return;
    const text = filteredCandidates
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
  }, [filteredCandidates, formatCandidate]);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-2">候補日一覧</h2>
      <div className="relative bg-rose-100 p-8 rounded min-h-[400px]">
        {isLoading ? (
          // ローディング中はサークル型スピナーを表示
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-500"></div>
            <span className="mt-2 text-gray-500 text-lg">Loading...</span>
          </div>
        ) : (
          <>
            {/* コピー用ボタン */}
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 bg-white text-sm px-2 py-1 rounded shadow hover:bg-gray-50"
            >
              copy
            </button>
            {filteredCandidates.length > 0 ? (
              <ul className="list-inside space-y-1">
                {filteredCandidates.map((slotPair, index) => (
                  <li key={index}>{formatCandidate(slotPair)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">候補がありません。</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
