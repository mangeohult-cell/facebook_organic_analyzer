"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, GitCompare, Upload, Users } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/month", label: "Månadsvy", icon: Calendar },
  { href: "/compare", label: "Jämförelse", icon: GitCompare },
  { href: "/upload", label: "Ladda upp", icon: Upload },
  { href: "/admin", label: "Admin", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <aside className="w-60 min-h-screen bg-[#303942] flex flex-col">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <span className="text-white font-bold text-lg leading-tight">
          Facebook<br />
          <span className="text-[#ED5821]">Organic</span> Analyzer
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                active
                  ? "bg-[#ED5821] text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
        <p className="text-white/40 text-xs">v1.0</p>
        <button
          onClick={() => signOut({ redirectUrl: "/sign-in" })}
          className="text-white/40 hover:text-white text-xs transition-colors"
        >
          Logga ut
        </button>
      </div>
    </aside>
  );
}
