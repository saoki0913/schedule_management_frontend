"use client"; 
import { FormEventHandler } from "react";

interface User {
  email: string;
}

function generateTimeOptions(): string[] {
  const options: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      // "00:00" の場合はスキップする
      if (hour === 0 && minute === 0) continue;
      const hh = String(hour).padStart(2, "0");
      const mm = String(minute).padStart(2, "0");
      options.push(`${hh}:${mm}`);
    }
  }
  return options;
}

interface ScheduleFormProps {
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
  durationMinutes: number;
  setDurationMinutes: (value: number) => void;
  users: User[];
  handleAddUser: () => void;
  handleRemoveUser: (index: number) => void;
  handleChangeUserEmail: (index: number, value: string) => void;
  handleSubmit: FormEventHandler<HTMLFormElement>;
}

export default function ScheduleForm(props: ScheduleFormProps) {
  const {
    startDate, setStartDate,
    endDate, setEndDate,
    startTime, setStartTime,
    endTime, setEndTime,
    durationMinutes, setDurationMinutes,
    users,
    handleAddUser,
    handleRemoveUser,
    handleChangeUserEmail,
    handleSubmit,
  } = props;

  return (
    <div>
      <h1 className="mb-5 font-semibold text-xl">スケジュール調整</h1>
      <form onSubmit={handleSubmit} className="gap-4 md:grid-cols-2">
        {/* 日付範囲 */}
        <div className="flex items-end space-x-2 p-3 rounded w-full">
          <div className="flex-1">
            <label className="block mb-1 font-semibold text-xl">調整期間</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border p-3 w-full bg-rose-100"
              required
            />
          </div>
          <span className="pb-3">~</span>
          <div className="flex-1">
            <label className="block mb-1 mt-7"></label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border p-3 w-full bg-rose-100"
              required
            />
          </div>
        </div>

        {/* 時間範囲 */}
        <div className="flex items-end space-x-2 p-3 rounded w-full">
          <div className="flex-1">
            <label className="block mb-1 font-semibold text-xl">時間帯</label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="border p-3 bg-rose-100 w-full"
              required
            >
              {generateTimeOptions().map((timeStr) => (
                <option key={timeStr} value={timeStr}>
                  {timeStr}
                </option>
              ))}
            </select>
          </div>
          <span className="pb-3">~</span>
          <div className="flex-1">
            <label className="block mb-1 mt-7"></label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="border p-3 bg-rose-100 w-full"
              required
            >
              {generateTimeOptions().map((timeStr) => (
                <option key={timeStr} value={timeStr}>
                  {timeStr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 面談時間 */}
        <div className="items-end p-3 rounded">
          <label className="block mb-1 font-semibold text-xl">面談時間</label>
          <select
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="border p-3 bg-rose-100"
          >
            <option value={30}>30</option>
            <option value={60}>60</option>
            <option value={90}>90</option>
            <option value={120}>120</option>
          </select>
          <span className="pb-3 ml-3">分</span>
        </div>

        {/* 参加者メールアドレス */}
        <div className="md:col-span-2 mt-2 ml-4">
          <label className="block mb-1 font-semibold text-xl">担当者</label>
          {users.map((user, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="email"
                value={user.email}
                onChange={(e) => handleChangeUserEmail(index, e.target.value)}
                className="border p-2 mr-2 flex-1"
                placeholder="email@example.com"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => handleRemoveUser(index)}
                  className="bg-red-500 text-white px-2 py-1 rounded transition-all duration-200 active:scale-95 active:ring-2 active:ring-red-400"
                >
                  削除
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddUser}
            className="bg-rose-300 hover:bg-rose-400 text-xl text-black py-3 px-4 mt-2 mb-5 rounded"
          >
            参加者を追加
          </button>
        </div>

        {/* フォーム送信ボタン */}
        <div className="md:col-span-2 ml-4">
        <button
          type="submit"
          className="bg-rose-300 hover:bg-rose-400 active:translate-y-0.3 active:scale-95 transition-all duration-200 text-xl text-black py-3 px-4 mt-2 mb-5 rounded"
        >
          空き時間を確認
        </button>
        </div>
      </form>
    </div>
  );
}
