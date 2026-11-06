"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, LogOut, User, BookOpen, KeyRound } from "lucide-react";

export default function StudentNavbar() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);

  useEffect(() => {
    fetch("/api/student/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStudent(data);
      })
      .catch(console.error);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/student/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-orange-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 rounded-xl overflow-hidden shadow-xs ring-2 ring-orange-400/40 group-hover:scale-105 transition-transform">
            <Image
              src="/logo.png"
              alt="Logo E-Library Kaliwungu 05 Ceria"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="font-extrabold text-lg sm:text-xl text-slate-800 tracking-tight leading-tight flex items-center gap-1.5">
              E-Library <span className="text-orange-500">Ceria</span>
            </h1>
            <p className="text-xs font-semibold text-slate-500">SD Negeri Kaliwungu 05</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/dashboard"
            className="px-3 py-2 rounded-xl font-bold text-sm text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Beranda
          </Link>
          <Link
            href="/katalog"
            className="px-3 py-2 rounded-xl font-bold text-sm text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Katalog Buku
          </Link>
          <Link
            href="/jurnal"
            className="px-3 py-2 rounded-xl font-bold text-sm text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Jurnal Baca
          </Link>
          <Link
            href="/bintang"
            className="px-3 py-2 rounded-xl font-bold text-sm text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Bintang & Lencana
          </Link>
          <Link
            href="/leaderboard"
            className="px-3 py-2 rounded-xl font-bold text-sm text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Peringkat
          </Link>
        </nav>

        {/* Student Stats & Profile */}
        <div className="flex items-center gap-3">
          {student && (
            <div className="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 px-3 py-1.5 rounded-2xl shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
              <div className="text-left">
                <span className="block text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Bintang
                </span>
                <span className="block text-sm font-extrabold text-amber-900 leading-none">
                  {student.totalPoints || 0}
                </span>
              </div>
            </div>
          )}

          {student ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <span className="block text-xs font-bold text-slate-800 truncate max-w-[120px]">
                  {student.name}
                </span>
                <span className="block text-[11px] font-semibold text-orange-600">
                  {student.className || "Siswa"}
                </span>
              </div>
              <Link
                href="/ganti-password"
                title="Ganti Password"
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
              >
                <KeyRound className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLogout}
                title="Keluar"
                className="p-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-xs"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

