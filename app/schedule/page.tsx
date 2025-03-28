"use client";

import { useState } from "react";
import Link from "next/link";
import CandidateList from "./components/CandidateList";
import ScheduleForm from "./components/ScheduleForm";

interface User {
  email: string;
}

export default function SchedulePage() {
  // 現在の日付を "YYYY-MM-DD" 形式で取得
  const today = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [durationMinutes, setDurationMinutes] = useState(30);
  // 選択された曜日を保持する state
  const [selectedDays, setSelectedDays] = useState<string[]>(["月", "火", "水", "木", "金"]);
  // 送信済みかどうかを示す state
  const isConfirmed = false;
  const [users, setUsers] = useState<User[]>([{ email: "" }]);
  // ローディング状態を管理する state
  const [isLoading, setIsLoading] = useState(false);
  // 取得した候補リストを表示するための state
  const [candidates, setCandidates] = useState<string[][]>([]);

  // BASE_URL を定義
  const BASE_URL = "https://func-sche.azurewebsites.net";
  // const BASE_URL = "http://localhost:7071";

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
      selected_days: selectedDays,
      duration_minutes: durationMinutes,
      users: validUsers,
    };

    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/get_availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        console.error("Failed to fetch schedule");
        return;
      }

      const data = await res.json();
      setCandidates(data.comon_availability || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // サーバー側にフォームデータを保存してトークンを取得する関数
  const storeFormData = async (): Promise<string | null> => {
    const payload = {
      isConfirmed: isConfirmed,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime,
      end_time: endTime,
      selected_days: selectedDays,
      duration_minutes: durationMinutes,
      users,
      candidates,
    };
    try {
      const res = await fetch(`${BASE_URL}/storeFormData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log(payload);
      if (!res.ok) {
        console.error("Failed to store form data");
        return null;
      }
      const data = await res.json();
      return data.token;
    } catch (error) {
      console.error("Error storing form data:", error);
      return null;
    }
  };

  //「日程調整画面を表示」ボタン押下時の処理 
  const handleCreateForm = async () => {
    if (candidates.length === 0) {
      alert("候補がありません。候補を取得してください。");
      return;
    }
    const token = await storeFormData();
    if (!token) {
      alert("フォームの作成に失敗しました。再度お試しください。");
      return;
    }
    const url = `/appointment?token=${encodeURIComponent(token)}`;
    window.open(url, "SelectScheduleForm", "width=600,height=800");
  };

  // 「リンクを共有」ボタン押下時の処理（メール送信用）
  const handleShareForm = async () => {
    if (candidates.length === 0) {
      alert("候補がありません。フォームを作成してください。");
      return;
    }
    const token = await storeFormData();
    if (!token) {
      alert("フォームの共有に失敗しました。再度お試しください。");
      return;
    }
    const shareUrl = window.location.origin + `/appointment?token=${encodeURIComponent(token)}`;

    const subject = "【日程調整のお願い】インテリジェントフォース/採用担当";
    const body = `＜ここにメール相手の性を入力＞様

インテリジェントフォース採用担当です。

以下URLよりご都合の良い時間帯を登録いただけますでしょうか。

▼面接日程調整URL
${shareUrl}

ご不明点やご質問がございましたら、お気軽にご連絡くださいませ。
お手数をおかけいたしますが、何卒よろしくお願い申し上げます。

`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
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
            selectedDays={selectedDays}
            setSelectedDays={setSelectedDays}
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
            isLoading={isLoading}
            selectedDays={selectedDays}
          />
          {/* フォーム作成ボタン */}
          <button
            onClick={handleCreateForm}
            className="mt-4 mr-4 inline-block bg-gray-500 text-white px-4 py-2 rounded"
          >
            日程調整画面を表示
          </button>
          {/* フォーム共有ボタン */}
          <button
            onClick={handleShareForm}
            className="inline-block bg-gray-500 text-white px-4 py-2 rounded"
          >
            リンクを共有
          </button>
        </div>
      </div>
    </div>
  );
}
