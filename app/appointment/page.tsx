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
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedCandidate, setConfirmedCandidate] = useState<string>("");

  // 新規入力欄用の state
  const [lastname, setLastName] = useState("");
  const [firstname, setFirstName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");

  // バックエンドAPIのURL
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // URL の token を使ってフォームデータを復元する
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get("token");
    if (token) {
      fetch(`${apiUrl}/retrieve_form_data?token=${encodeURIComponent(token)}`)
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
          if (data.isConfirmed) {
            setIsConfirmed(true);
            if (data.confirmedCandidate) {
              setConfirmedCandidate(data.confirmedCandidate);
            }
          }
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
      const dayMap = ["日", "月", "火", "水", "木", "金", "土"];
      return format(date, "M/d") + `(${dayMap[date.getDay()]})`;
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

  // 選択された候補をフォーマットする関数
  const formatCandidate = (slotPair: string[]): string => {
    try {
      const startDate = parseISO(slotPair[0]);
      const endDate = parseISO(slotPair[1]);
      const dayMap = ["日", "月", "火", "水", "木", "金", "土"];
      if (format(startDate, "M/d") === format(endDate, "M/d")) {
        const candidateDay = dayMap[startDate.getDay()];
        return `${format(startDate, "M/d")}(${candidateDay}) ${format(
          startDate,
          "HH:mm"
        )} - ${format(endDate, "HH:mm")}`;
      } else {
        return `${format(startDate, "MM/dd HH:mm")} ~ ${format(
          endDate,
          "MM/dd HH:mm"
        )}`;
      }
    } catch (err) {
      console.error("Error formatting candidate:", err);
      return slotPair.join(", ");
    }
  };

  // 候補のフィルタリング処理
  const filteredCandidates = candidates.filter((candidate) => {
    if (candidate.length !== 2) return false;
    if (candidate[0].substring(0, 10) !== candidate[1].substring(0, 10))
      return false;
    const candidateStart = candidate[0].substring(11, 16);
    const candidateEnd = candidate[1].substring(11, 16);
    if (candidateEnd < candidateStart) return false;
    if (!(candidateStart >= minTime && candidateEnd <= maxTime)) return false;
    if (selectedDays.length > 0) {
      try {
        const date = parseISO(candidate[0]);
        const dayMap = ["日", "月", "火", "水", "木", "金", "土"];
        const candidateDay = dayMap[date.getDay()];
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
    console.log("選択された日程", selectedCandidate);
    if (!selectedCandidate) {
      alert("候補を選択してください。");
      return;
    }

    let formattedCandidate;
    if (selectedCandidate === "none") {
      formattedCandidate = selectedCandidate;
      const isConfirmedSend = window.confirm(
        "「可能な日程がない」として登録を行います。\n\nこちらの内容で間違いないですか？"
      );
      if (!isConfirmedSend) {
        return;
      }
    } else {
      formattedCandidate = formatCandidate(selectedCandidate.split(", "));
      const isConfirmedSend = window.confirm(
        `以下の日程で登録を行います:\n${formattedCandidate}\n\nこちらの内容で間違いないですか？`
      );
      if (!isConfirmedSend) {
        return;
      }
    }
    setIsLoading(true);

    const payload = {
      candidate: selectedCandidate === "none" ? null : selectedCandidate,
      users: users.map((user) => user.email),
      lastname,
      firstname,
      company,
      email,
      token,
    };

    try {
      const response = await fetch(`${apiUrl}/appointment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Failed to schedule appointment.");
      }
      const data = await response.json();
      console.log("Response from backend:", data);
      setConfirmedCandidate(formattedCandidate);
      setIsConfirmed(true);
    } catch (error) {
      console.error("日程の確定に失敗しました。:", error);
      alert("日程の確定に失敗しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-3xl">
        <div className="bg-white shadow rounded-lg p-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">日程選択</h1>
            <p className="mt-2 text-gray-600 text-lg">
              以下の候補から希望する日程を選択してください。
            </p>
          </div>
          {isConfirmed ? (
            <>
              <div className="p-8 bg-gray-200 rounded-lg text-center mb-4">
                <p className="text-xl font-semibold text-gray-800">確定した日程</p>
                <p className="text-lg text-gray-700">
                  {confirmedCandidate === "none"
                    ? "確定した日程はありません。\n再度担当者から連絡します。"
                    : confirmedCandidate
                      ? confirmedCandidate
                      : "日程の詳細が取得できませんでした。"}
                </p>
              </div>
              <div className="p-8 bg-gray-100 rounded-lg text-center">
                <p className="text-xl font-semibold text-gray-700">このフォームは既に使用済みです。</p>
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 入力フィールド：氏名*/}
              <div className="grid gap-6 mb-6 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    氏
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={lastname}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="山田"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    名
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={firstname}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="太郎"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    required
                  />
                </div>
              </div>
              {/* 入力フィールド：会社名*/}
              <div>
                <label htmlFor="company" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  会社名
                </label>
                <input
                  type="text"
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="株式会社〇〇"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  required
                />
              </div>
              {/* 入力フィールド：連絡先（メールアドレス） */}
              <div className="mb-6">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  連絡先 (メールアドレス)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@domain.com"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  required
                />
              </div>
              {/* 日程候補の表示 */}
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
                      className={`cursor-pointer relative rounded-xl border-2 transition-all duration-300 p-6 flex justify-between items-center transform hover:scale-105 active:scale-95 active:ring-2 active:ring-blue-400 ${isSelected
                        ? "border-blue-500 bg-blue-100 shadow-lg"
                        : "border-gray-300 hover:border-blue-400 hover:shadow-md"
                        }`}
                    >
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-2">
                          <Calendar className={`h-6 w-6 ${isSelected ? "text-blue-500" : "text-gray-500"}`} />
                          <span className={`text-xl ${isSelected ? "font-semibold text-blue-500" : "text-gray-700"}`}>
                            {candidateDate}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className={`h-6 w-6 ${isSelected ? "text-blue-500" : "text-gray-500"}`} />
                          <span className={`text-xl ${isSelected ? "font-semibold text-blue-500" : "text-gray-700"}`}>
                            {startTime} - {endTime}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${isSelected ? "bg-blue-500 text-white" : "bg-gray-300"
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
                  className={`cursor-pointer relative rounded-xl border-2 transition-all duration-300 p-6 flex justify-between items-center transform hover:scale-105 active:scale-95 active:ring-2 active:ring-red-400 ${selectedCandidate === "none"
                    ? "border-red-500 bg-red-100 shadow-lg"
                    : "border-gray-300 hover:border-red-400 hover:shadow-md"
                    }`}
                >
                  <div className="flex items-center space-x-6">
                    <span
                      className={`text-xl ${selectedCandidate === "none"
                        ? "font-semibold text-red-500"
                        : "text-gray-700"
                        }`}
                    >
                      可能な日程がない
                    </span>
                  </div>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${selectedCandidate === "none"
                      ? "bg-red-500 text-white"
                      : "bg-gray-300"
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
                className={`w-full py-4 mt-8 bg-green-500 hover:bg-green-600 transition-all duration-200 text-white text-lg font-semibold rounded-lg shadow-md ${isLoading ? "opacity-50 cursor-not-allowed" : ""
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
