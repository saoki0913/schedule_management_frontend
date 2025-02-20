"use client";

import { useState, useEffect } from "react";
import { parseISO, format } from "date-fns";
import { Calendar, Clock, Check } from "lucide-react";

export default function SelectSchedulePage() {
  // 初期値は空の配列・文字列にしておく
  const [candidates, setCandidates] = useState<string[][]>([]);
  const [users, setUsers] = useState<{ email: string }[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");

  // ローディング状態を管理する state
  const [isLoading, setIsLoading] = useState(false);

  // 開始・終了時刻（フィルタ条件）の state
  const [minTime, setMinTime] = useState("10:00");
  const [maxTime, setMaxTime] = useState("18:00");

  // BASE_URL を定義
  // const BASE_URL = "https://func-sche.azurewebsites.net";
  const BASE_URL = "http://localhost:7071";

  // URL に token があればサーバーからフォームデータを復元する
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    if (token) {
      fetch(`${BASE_URL}/retrieveFormData?token=${encodeURIComponent(token)}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to retrieve form data");
          }
          return res.json();
        })
        .then((data) => {
          // 復元するデータの例：{ users, candidates, start_time, end_time }
          if (data.users) setUsers(data.users);
          if (data.candidates) setCandidates(data.candidates);
          if (data.start_time) setMinTime(data.start_time);
          if (data.end_time) setMaxTime(data.end_time);
        })
        .catch((error) => {
          console.error("Error retrieving form data:", error);
        });
    }
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

  // フィルタリング条件：受け取った時刻範囲内の候補のみ表示
  const filteredCandidates = candidates.filter((candidate) => {
    if (candidate.length !== 2) return false;
    const candidateStart = candidate[0].substring(11, 16);
    const candidateEnd = candidate[1].substring(11, 16);
    return candidateStart >= minTime && candidateEnd <= maxTime;
  });

  // バックエンドへ選択候補を送信して予定登録を依頼する
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    if (!selectedCandidate) {
      alert("候補を選択してください。");
      return;
    }

    // ローディング状態にする
    setIsLoading(true);

    const payload = {
      candidate: selectedCandidate === "none" ? null : selectedCandidate,
      users: users.map((user) => user.email),
      token: token,
    };

    try {
      const response = await fetch(`${BASE_URL}/appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } finally {
      // 処理が完了したらローディング状態を解除する
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-200 to-red-300 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-3xl">
        {/* カード風コンテナ */}
        <div className="bg-white shadow rounded-lg p-8">
          {/* ヘッダー */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">面接日程選択</h1>
            <p className="mt-2 text-gray-600 text-lg">
              以下の候補から希望する面接日程を選択してください。
            </p>
          </div>
          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              {filteredCandidates.map((candidate, index) => {
                const candidateValue = candidate.join(", ");
                const isSelected = selectedCandidate === candidateValue;
                const candidateDate = formatDatePart(candidate[0]);
                const startTime = formatTimePart(candidate[0]);
                const endTime = formatTimePart(candidate[1]);

                return (
                  <div
                    key={index}
                    onClick={() => setSelectedCandidate(candidateValue)}
                    className={`cursor-pointer relative rounded-xl border-2 transition-all duration-300 p-6 flex justify-between items-center transform hover:scale-105 active:scale-95 active:ring-2 active:ring-blue-400 ${
                      isSelected
                        ? "border-blue-500 bg-blue-100 shadow-lg"
                        : "border-gray-300 hover:border-blue-400 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <Calendar
                          className={`h-6 w-6 ${isSelected ? "text-blue-500" : "text-gray-500"}`}
                        />
                        <span className={`text-xl ${isSelected ? "font-semibold text-blue-500" : "text-gray-700"}`}>
                          {candidateDate}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock
                          className={`h-6 w-6 ${isSelected ? "text-blue-500" : "text-gray-500"}`}
                        />
                        <span className={`text-xl ${isSelected ? "font-semibold text-blue-500" : "text-gray-700"}`}>
                          {startTime} - {endTime}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                        isSelected ? "bg-blue-500 text-white" : "bg-gray-300"
                      }`}
                    >
                      <Check className={`w-5 h-5 ${isSelected ? "opacity-100" : "opacity-0"}`} />
                    </div>
                  </div>
                );
              })}
              {/* 「可能な日程がない」選択肢 */}
              <div
                onClick={() => setSelectedCandidate("none")}
                className={`cursor-pointer relative rounded-xl border-2 transition-all duration-300 p-6 flex justify-between items-center transform hover:scale-105 active:scale-95 active:ring-2 active:ring-red-400 ${
                  selectedCandidate === "none"
                    ? "border-red-500 bg-red-100 shadow-lg"
                    : "border-gray-300 hover:border-red-400 hover:shadow-md"
                }`}
              >
                <div className="flex items-center space-x-6">
                  <span
                    className={`text-xl ${
                      selectedCandidate === "none" ? "font-semibold text-red-500" : "text-gray-700"
                    }`}
                  >
                    可能な日程がない
                  </span>
                </div>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                    selectedCandidate === "none" ? "bg-red-500 text-white" : "bg-gray-300"
                  }`}
                >
                  <Check className={`w-5 h-5 ${selectedCandidate === "none" ? "opacity-100" : "opacity-0"}`} />
                </div>
              </div>
            </div>
            {/* 送信ボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 mt-8 bg-rose-500 hover:bg-rose-600 transition-all duration-200 text-white text-lg font-semibold rounded-lg shadow-md ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "処理中..." : "日程を確定する"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

