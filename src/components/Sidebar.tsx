"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: "⊞" },
  { href: "/events/new", label: "New Event", icon: "＋" },
  { href: "/clients", label: "Clients", icon: "👤" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-espresso-800 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-espresso-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-espresso-500 flex items-center justify-center text-white font-bold text-sm">
            ☕
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Omda Coffee</p>
            <p className="text-espresso-300 text-xs">Operations</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-espresso-600 text-white"
                  : "text-espresso-200 hover:bg-espresso-700 hover:text-white"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-espresso-700">
        <p className="text-espresso-400 text-xs">v0.1.0</p>
      </div>
    </aside>
  );
}
