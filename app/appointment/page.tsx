"use client";

import { useState, useEffect } from "react";
import { parseISO, format } from "date-fns";
import { Calendar, Clock, Check } from "lucide-react";

export default function SelectSchedulePage() {
  // クエリパラメータから取得するので、初期値は空の配列・文字列にしておく
  const [candidates, setCandidates] = useState<string[][]>([]);
  const [users, setUsers] = useState<{ email: string }[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");

  // クエリパラメータから受け取る開始時刻・終了時刻（フィルタ条件）
  const [minTime, setMinTime] = useState("10:00");
  const [maxTime, setMaxTime] = useState("18:00");

  // クエリパラメータからデータを取得
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    // 候補リストの取得
    const candidatesParam = searchParams.get("candidates");
    if (candidatesParam) {
      try {
        setCandidates(JSON.parse(candidatesParam));
      } catch (err) {
        console.error("Error parsing candidates", err);
      }
    }

    // ユーザー情報の取得
    const usersParam = searchParams.get("users");
    if (usersParam) {
      try {
        setUsers(JSON.parse(usersParam));
      } catch (err) {
        console.error("Error parsing users", err);
      }
    }

    // 開始・終了時刻の取得（なければデフォルト値）
    const st = searchParams.get("start_time");
    const et = searchParams.get("end_time");
    if (st) setMinTime(st);
    if (et) setMaxTime(et);
  }, []);

  // ISO 文字列の日付部分を "yyyy/MM/dd" 形式に変換
  const formatDatePart = (isoString: string) => {
    try {
      const date = parseISO(isoString);
      return format(date, "yyyy/MM/dd");
    } catch (err) {
      console.error("Date parsing error:", err);
      return isoString;
    }
  };

  // ISO 文字列の日付部分から "HH:mm" 形式の時刻を取得
  const formatTimePart = (isoString: string) => {
    try {
      const date = parseISO(isoString);
      return format(date, "HH:mm");
    } catch (err) {
      console.error("Time parsing error:", err);
      return isoString;
    }
  };

  // フィルタリング条件：クエリから受け取った時刻（例：10:00〜18:00）の範囲内の候補のみ表示
  const filteredCandidates = candidates.filter((candidate) => {
    if (candidate.length !== 2) return false;
    // ISO 文字列から "HH:mm" 部分を抽出（例："2025-02-03T10:30:00" → "10:30"）
    const candidateStart = candidate[0].substring(11, 16);
    const candidateEnd = candidate[1].substring(11, 16);
    return candidateStart >= minTime && candidateEnd <= maxTime;
  });

  // バックエンドへ選択された候補情報を送信し、Outlook 登録を依頼する
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) {
      alert("候補を選択してください。");
      return;
    }

    const payload = {
      candidate: selectedCandidate === "none" ? null : selectedCandidate,
      users: users.map((user) => user.email),
    };

    try {
      const response = await fetch("http://localhost:7071/appointment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to schedule appointment.");
      }

      const data = await response.json();
      console.log("Response from backend:", data);
      alert(data.message);
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      alert("日程の確定に失敗しました。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="w-full max-w-3xl px-4">
        {/* カード風のコンテナ */}
        <div className="bg-white shadow rounded-lg p-8">
          {/* ヘッダー部分 */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold tracking-tight">面接日程選択</h1>
            <p className="mt-2 text-gray-600 text-lg">
              以下の候補から希望する面接日程を選択してください。
            </p>
          </div>
          {/* フォーム部分 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              {/* フィルタリング済み候補の表示 */}
              {filteredCandidates.map((candidate, index) => {
                // 各候補は [開始日時, 終了日時] の配列
                const candidateValue = candidate.join(", ");
                const isSelected = selectedCandidate === candidateValue;
                const candidateDate = formatDatePart(candidate[0]);
                const startTime = formatTimePart(candidate[0]);
                const endTime = formatTimePart(candidate[1]);

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedCandidate(candidateValue)}
                    className={`cursor-pointer relative rounded-xl border-2 transition-all duration-200 p-6 flex justify-between items-center ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : "border-gray-300 hover:border-blue-400 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center space-x-8">
                      <div className="flex items-center space-x-3">
                        <Calendar
                          className={`h-5 w-5 ${
                            isSelected ? "text-blue-500" : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-lg ${
                            isSelected
                              ? "font-medium text-blue-500"
                              : "text-gray-600"
                          }`}
                        >
                          {candidateDate}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Clock
                          className={`h-5 w-5 ${
                            isSelected ? "text-blue-500" : "text-gray-500"
                          }`}
                        />
                        <span
                          className={`text-lg ${
                            isSelected
                              ? "font-medium text-blue-500"
                              : "text-gray-600"
                          }`}
                        >
                          {startTime} - {endTime}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                        isSelected ? "bg-blue-500 text-white" : "bg-gray-300"
                      }`}
                    >
                      <Check
                        className={`w-4 h-4 ${
                          isSelected ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
              {/* 「可能な日程がない」選択肢 */}
              <div
                onClick={() => setSelectedCandidate("none")}
                className={`cursor-pointer relative rounded-xl border-2 transition-all duration-200 p-6 flex justify-between items-center ${
                  selectedCandidate === "none"
                    ? "border-blue-500 bg-blue-50 shadow-lg"
                    : "border-gray-300 hover:border-blue-400 hover:shadow-md"
                }`}
              >
                <div className="flex items-center space-x-8">
                  <span
                    className={`text-lg ${
                      selectedCandidate === "none"
                        ? "font-medium text-blue-500"
                        : "text-gray-600"
                    }`}
                  >
                    可能な日程がない
                  </span>
                </div>
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                    selectedCandidate === "none"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  <Check
                    className={`w-4 h-4 ${
                      selectedCandidate === "none" ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </div>
              </div>
            </div>
            {/* 送信ボタン */}
            <button
              type="submit"
              className="w-full py-4 mt-6 bg-rose-300 hover:bg-rose-500 transition-colors text-white text-lg font-medium rounded-lg"
            >
              日程を確定する
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
