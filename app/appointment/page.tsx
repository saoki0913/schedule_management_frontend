"use client";

import { useState, useEffect } from "react";
import { parseISO, format } from "date-fns";
import { Calendar, Clock, Check } from "lucide-react";

export default function SelectSchedulePage() {
  // 各種 state
  const [candidates, setCandidates] = useState<string[][]>([]);
  const [users, setUsers] = useState<{ email: string }[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [minTime, setMinTime] = useState("10:00");
  const [maxTime, setMaxTime] = useState("18:00");
  // 送信済みかどうかを示す state
  const [isConfirmed, setIsConfirmed] = useState(false);

  const BASE_URL = "https://func-sche.azurewebsites.net";
  // const BASE_URL = "http://localhost:7071";

  // URL の token を使ってフォームデータを復元する
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
          if (data.users) setUsers(data.users);
          if (data.candidates) setCandidates(data.candidates);
          if (data.start_time) setMinTime(data.start_time);
          if (data.end_time) setMaxTime(data.end_time);
          if (data.selected_days) setSelectedDays(data.selected_days);
          // もしサーバー側で既に確定済みなら isConfirmed を true にする
          if (data.isConfirmed) setIsConfirmed(true);
        })
        .catch((error) => {
          console.error("Error retrieving form data:", error);
        });
    }
  }, []);

  // 日付・時刻のフォーマット関数
  const formatDatePart = (isoString: string) => {
    try {
      const date = parseISO(isoString);
      return format(date, "yyyy/MM/dd");
    } catch (err) {
      console.error("Date parsing error:", err);
      return isoString;
    }
  };

  const formatTimePart = (isoString: string) => {
    try {
      const date = parseISO(isoString);
      return format(date, "HH:mm");
    } catch (err) {
      console.error("Time parsing error:", err);
      return isoString;
    }
  };

  // 候補のフィルタリング処理（曜日フィルタ等を含む）
  const filteredCandidates = candidates.filter((candidate) => {
    if (candidate.length !== 2) return false;
    if (candidate[0].substring(0, 10) !== candidate[1].substring(0, 10)) return false;
    const candidateStart = candidate[0].substring(11, 16);
    const candidateEnd = candidate[1].substring(11, 16);
    if (candidateEnd < candidateStart) return false;
    if (!(candidateStart >= minTime && candidateEnd <= maxTime)) return false;
    if (selectedDays.length > 0) {
      try {
        const date = parseISO(candidate[0]);
        const dayIndex = date.getDay();
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

  // 送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    if (!selectedCandidate) {
      alert("候補を選択してください。");
      return;
    }
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
      // 送信が成功したら、フォームを無効化するために isConfirmed を true にする
      setIsConfirmed(true);
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      alert("日程の確定に失敗しました。");
    } finally {
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
          {isConfirmed ? (
            <div className="p-8 bg-gray-100 rounded-lg text-center">
              <p className="text-xl font-semibold text-gray-700">
                このフォームは既に使用済みです。
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
