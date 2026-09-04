"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  Scissors,
  FileText,
  MonitorPlay,
  Download,
  Settings,
  Brain,
  Film,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/clips", label: "AI Clips", icon: Scissors },
  { href: "/transcripts", label: "Transcripts", icon: FileText },
  { href: "/rendering", label: "Rendering", icon: MonitorPlay },
  { href: "/exports", label: "Exports", icon: Download },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/ai-models", label: "AI Models", icon: Brain },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-300",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Film className="h-6 w-6 text-blue-500" />
          {!collapsed && (
            <span className="text-lg font-bold text-white">AI Clips</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-500/10 text-blue-500"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-zinc-700" />
          {!collapsed && (
            <div className="flex-1 truncate">
              <p className="text-sm font-medium text-white">User</p>
              <p className="text-xs text-zinc-400">user@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
