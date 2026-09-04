"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

export function Header() {
  const pathname = usePathname();
  const segments = pathname?.split("/").filter(Boolean) || [];

  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
      <nav className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">/</span>
        {segments.map((seg, i) => (
          <span key={i} className="flex items-center gap-2">
            <span
              className={
                i === segments.length - 1
                  ? "font-medium text-white"
                  : "text-zinc-400"
              }
            >
              {seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ")}
            </span>
            {i < segments.length - 1 && (
              <span className="text-zinc-500">/</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-lg border border-zinc-800 bg-zinc-900 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-blue-500"
          />
        </div>
        <button className="relative rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500" />
        </button>
        <div className="h-8 w-8 rounded-full bg-zinc-700" />
      </div>
    </header>
  );
}
