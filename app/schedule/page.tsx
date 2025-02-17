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
  const [candidates, setCandidates] = useState<string[][]>([]);

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
      users: validUsers,
    };

    try {
      // バックエンドのエンドポイントURL https://func-sche.azurewebsites.net
      const res = await fetch("https://func-sche.azurewebsites.net/get_availability", {
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
      // バックエンドから comon_availability という配列が返ってくる想定
      setCandidates(data.comon_availability || []);
      } catch (error) {
        console.error("Error:", error);
      }
  };

// URL を組み立てる共通関数
const buildFormUrl = () => {
  const params = new URLSearchParams();
  params.set("users", JSON.stringify(users));
  params.set("candidates", JSON.stringify(candidates));
  params.set("start_time", startTime); // 例: "10:00"
  params.set("end_time", endTime);     // 例: "18:00"
  return `/appointment?${params.toString()}`;
};

// 「フォーム作成」ボタン押下時の処理
const handleCreateForm = () => {
  if (candidates.length === 0) {
    alert("候補がありません。候補を取得してください。");
    return;
  }
  // 共通関数で URL を生成
  const url = buildFormUrl();

  // 新しいウィンドウ（例：600x800）で /appointment ページを開く
  window.open(url, "SelectScheduleForm", "width=600,height=800");
};

// 「フォーム共有」ボタン押下時の処理
const handleShareForm = async () => {
  if (candidates.length === 0) {
    alert("候補がありません。フォームを作成してください。");
    return;
  }

  // 共通関数で URL を生成
  const shareUrl = window.location.origin + buildFormUrl();

  // Web Share API が利用可能か確認
  if (navigator.share) {
    try {
      await navigator.share({
        title: "面接スケジュールフォーム",
        text: "面接のスケジュールを入力するフォームです。",
        url: shareUrl,
      });
    } catch (error) {
      console.error("共有エラー:", error);
    }
  } else {
    // Web Share APIが利用できない場合はURLをクリップボードにコピー
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("共有リンクをクリップボードにコピーしました！");
    } catch (error) {
      console.error("クリップボードへのコピーに失敗しました:", error);
    }
  }
};


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="text-right mb-5">
        <Link
          href="/"
          className="inline-block bg-gray-500 text-white px-4 py-2 rounded"
        >
          ホームページへ
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 左カラム */}
        <div>
          {/* スケジュール設定フォーム */}
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
          {/* 候補日一覧の表示 */}
          <CandidateList
            candidates={candidates}
            minTime={startTime}
            maxTime={endTime}
          />
          {/* フォーム作成ボタン */}
          <button
            onClick={handleCreateForm}
            className="mt-4 mr-4 nline-block bg-gray-500 text-white px-4 py-2 rounded"
          >
            フォーム作成
          </button>
          {/* フォーム共有ボタン */}
          <button
            onClick={handleShareForm}
            className="nline-block bg-gray-500 text-white px-4 py-2 rounded"
          >
            フォーム共有
          </button>
        </div>
      </div>
    </div>
  );
}
