// app/page.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">ホームページ</h1>
      <Link
        href="/schedule"
        className="inline-block bg-gray-500 text-white px-4 py-2 rounded "
      >
        スケジュールページへ
      </Link>
    </main>
  );
}
