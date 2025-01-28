// import { useRouter } from "next/router";
// import { useState } from "react";

// // モックデータ (実際にはDB/APIから取得)
// const mockData = {
//   1: { judgment: "合格", evaluation: "誠実", remarks: "特に問題なし" },
//   2: { judgment: "不合格", evaluation: "準備不足", remarks: "次回期待" },
// };

// const InterviewResultPage = ({ params }: { params: { stepId: string } }) => {
//   const stepId = params.stepId; // URLのステップIDを取得
//   const [formData, setFormData] = useState(
//     mockData[stepId] || { judgment: "", evaluation: "", remarks: "" }
//   );

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSave = async () => {
//     // サーバーにデータを保存
//     const response = await fetch(`/api/interviews/${stepId}`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(formData),
//     });

//     if (response.ok) {
//       alert("保存されました！");
//     } else {
//       alert("保存に失敗しました");
//     }
//   };

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white shadow mt-6">
//       <h1 className="text-xl font-bold">ステップ {stepId} の面談結果</h1>

//       {/* 面談結果入力フォーム */}
//       <div className="mt-4 space-y-4">
//         <div>
//           <label className="block font-bold">判定結果</label>
//           <input
//             type="text"
//             name="judgment"
//             value={formData.judgment}
//             onChange={handleInputChange}
//             className="w-full border px-3 py-2 rounded"
//           />
//         </div>
//         <div>
//           <label className="block font-bold">評価</label>
//           <input
//             type="text"
//             name="evaluation"
//             value={formData.evaluation}
//             onChange={handleInputChange}
//             className="w-full border px-3 py-2 rounded"
//           />
//         </div>
//         <div>
//           <label className="block font-bold">備考</label>
//           <textarea
//             name="remarks"
//             value={formData.remarks}
//             onChange={handleInputChange}
//             className="w-full border px-3 py-2 rounded"
//           />
//         </div>
//         <button
//           onClick={handleSave}
//           className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           保存する
//         </button>
//       </div>
//     </div>
//   );
// };

// export default InterviewResultPage;
