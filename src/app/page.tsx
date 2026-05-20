import { Suspense } from "react";
import HomeClient from "@/app/HomeClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full bg-[#0f0c29] flex items-center justify-center">
          <p className="text-white/50">加载中…</p>
        </div>
      }
    >
      <HomeClient />
    </Suspense>
  );
}
