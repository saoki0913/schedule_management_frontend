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
  selectedDays: string[];
  setSelectedDays: (value: string[]) => void;
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
    selectedDays, setSelectedDays,
    durationMinutes, setDurationMinutes,
    users,
    handleAddUser,
    handleRemoveUser,
    handleChangeUserEmail,
    handleSubmit,
  } = props;

  // 曜日チェックボックス用の設定（selectedDays は配列）
  const weekdays = ['月', '火', '水', '木', '金', '土', '日'];
  const selectedDaysArray = selectedDays;

  const handleDayToggle = (day: string) => {
    let newSelectedDaysArray: string[];
    if (selectedDaysArray.includes(day)) {
      newSelectedDaysArray = selectedDaysArray.filter((d) => d !== day);
    } else {
      newSelectedDaysArray = [...selectedDaysArray, day];
    }
    setSelectedDays(newSelectedDaysArray);
  };
  
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
              className="border p-3 w-full bg-blue-100"
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
              className="border p-3 w-full bg-blue-100"
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
              className="border p-3 bg-blue-100 w-full"
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
              className="border p-3 bg-blue-100 w-full"
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
        {/* 曜日選択 */}
        <div className="p-4 rounded-lg ">
          <label className="block mb-1 font-bold text-xl text-gray-800">曜日選択</label>
          <div className="flex flex-wrap gap-4">
            {weekdays.map((day) => (
              <label key={day} className="flex items-center cursor-pointer space-x-2">
                <input
                  type="checkbox"
                  checked={selectedDaysArray.includes(day)}
                  onChange={() => handleDayToggle(day)}
                  className="w-5 h-6" 
                />
                <span className="text-xl font-medium">{day}</span>
              </label>
            ))}
            <button
              type="button"
              onClick={() => setSelectedDays([])}
              className="bg-blue-300 hover:bg-blue-400 text-sm text-black py-1 px-2 rounded"
              >
              曜日選択をリセット
            </button>
          </div>
        </div>

        {/* 面談時間 */}
        <div className="items-end p-3 rounded">
          <label className="block mb-1 font-semibold text-xl">面談時間</label>
          <select
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            className="border p-3 bg-blue-100"
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
            className="bg-blue-300 hover:bg-blue-400 text-xl text-black py-3 px-4 mt-2 mb-5 rounded"
          >
            参加者を追加
          </button>
        </div>

        {/* フォーム送信ボタン */}
        <div className="md:col-span-2 ml-4">
          <button
            type="submit"
            className="bg-blue-300 hover:bg-blue-400 active:translate-y-0.3 active:scale-95 transition-all duration-200 text-xl text-black py-3 px-4 mt-2 mb-5 rounded"
          >
            候補日一覧を表示
          </button>
        </div>
      </form>
    </div>
  );
}
