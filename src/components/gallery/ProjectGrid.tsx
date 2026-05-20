"use client";

import { ReactNode } from "react";

export default function ProjectGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 p-4 md:p-6 w-full max-w-7xl mx-auto">
      {children}
    </div>
  );
}
