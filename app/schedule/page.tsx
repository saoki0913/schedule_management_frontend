"use client"; 

import { useState } from "react";
import Link from "next/link";
import CandidateList from "./components/CandidateList";
import ScheduleForm from "./components/ScheduleForm";

interface User {
  email: string;
}

export default function SchedulePage() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [users, setUsers] = useState<User[]>([{ email: "" }]);

  // 取得した候補リストを表示するためのステート
  const [candidates, setCandidates] = useState<string[]>([]);

  // 参加者追加
  const handleAddUser = () => {
    setUsers((prev) => [...prev, { email: "" }]);
  };

  // 参加者削除
  const handleRemoveUser = (index: number) => {
    setUsers((prev) => prev.filter((_, i) => i !== index));
  };

  // 参加者メールアドレス変更
  const handleChangeUserEmail = (index: number, value: string) => {
    setUsers((prev) =>
      prev.map((user, i) => (i === index ? { email: value } : user))
    );
  };

  // スケジュール取得リクエスト送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 空メールが混ざっていた場合は除外 or バリデーション
    const validUsers = users.filter((u) => u.email.trim() !== "");
    if (!validUsers.length) {
      alert("参加者がありません。");
      return;
    }

    const requestBody = {
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: durationMinutes,
      users: validUsers
    };

    try {
      // バックエンドのエンドポイントURL
      const res = await fetch("http://func-sche.azurewebsites.net/get_availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        // エラー処理
        console.error("Failed to fetch schedule");
        return;
      }

      const data = await res.json();
      // ① バックエンドから comon_availability という配列が返ってくる想定
      // ② 存在しない場合は空配列をセット
      setCandidates(data.comon_availability  || []);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="text-right mb-5">
        <Link
        href="/"
        className="inline-block bg-gray-500 text-white px-4 py-2 rounded "
        >
        ホームページへ
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左カラム */}
        <div>
          
            {/* Form */}
            <ScheduleForm
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
                durationMinutes={durationMinutes}
                setDurationMinutes={setDurationMinutes}
                users={users}
                handleAddUser={handleAddUser}
                handleRemoveUser={handleRemoveUser}
                handleChangeUserEmail={handleChangeUserEmail}
                handleSubmit={handleSubmit}
            />
        </div>
        {/* 右カラム */}
        <div>
        {/* 候補日一覧 */}
        {/* 取得結果表示 */}
        <CandidateList candidates={candidates} />
        </div>
       </div>
    </div>
  );
}
