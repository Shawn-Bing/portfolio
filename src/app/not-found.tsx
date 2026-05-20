import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-6xl font-bold mb-4 text-indigo-400">404</h1>
      <h2 className="text-2xl font-semibold mb-2">页面未找到</h2>
      <p className="text-white/50 mb-8">抱歉，您访问的页面不存在。</p>
      <Link
        href="/"
        className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition-colors"
      >
        返回首页
      </Link>
    </div>
  );
}
