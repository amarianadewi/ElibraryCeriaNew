"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, PenTool, Award, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StudentBottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/dashboard", label: "Beranda", icon: Home },
    { href: "/katalog", label: "Katalog", icon: BookOpen },
    { href: "/jurnal", label: "Jurnal", icon: PenTool },
    { href: "/bintang", label: "Bintang", icon: Award },
    { href: "/leaderboard", label: "Peringkat", icon: Trophy },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-orange-100 px-3 py-2 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all",
                isActive
                  ? "text-orange-600 font-extrabold scale-105"
                  : "text-slate-500 font-semibold hover:text-orange-500"
              )}
            >
              <div
                className={cn(
                  "p-1.5 rounded-xl transition-colors",
                  isActive ? "bg-orange-100 text-orange-600" : "bg-transparent"
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] mt-0.5">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

