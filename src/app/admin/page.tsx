"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  FileText,
  Clock,
  Trophy,
  ArrowRight,
  TrendingUp,
  Activity,
} from "lucide-react";
import { formatMinutes, formatDateIndo } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-500">Memuat statistik perpustakaan...</p>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalStudents: 0,
    totalBooks: 0,
    totalPagesRead: 0,
    totalReadingMinutes: 0,
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Dashboard Pemantauan Literasi
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Monitoring aktivitas membaca, statistik siswa, dan koleksi buku SD Negeri Kaliwungu 05.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/siswa"
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-sm transition-all"
          >
            + Tambah Siswa
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Siswa
            </span>
            <span className="text-2xl font-black text-slate-900">{summary.totalStudents}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Koleksi Buku
            </span>
            <span className="text-2xl font-black text-slate-900">{summary.totalBooks}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Halaman Dibaca
            </span>
            <span className="text-2xl font-black text-slate-900">{summary.totalPagesRead}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Waktu Baca
            </span>
            <span className="text-2xl font-black text-slate-900">
              {formatMinutes(summary.totalReadingMinutes)}
            </span>
          </div>
        </div>
      </div>

      {/* Two Columns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Active Students */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Siswa Paling Aktif Membaca
            </h2>
            <Link
              href="/admin/siswa"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              Semua Siswa <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.topStudents?.map((s: any, idx: number) => (
              <div key={s.id} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-700 text-xs font-black flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{s.name}</h3>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {s.classId} • {s.totalBooksCompleted} Buku
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-amber-600">{s.totalPoints} ⭐</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reading Activities */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Aktivitas Membaca Terkini
            </h2>
          </div>

          <div className="divide-y divide-slate-100">
            {stats?.recentActivities?.slice(0, 5).map((act: any) => (
              <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="truncate max-w-[240px]">
                  <h3 className="font-bold text-slate-800 truncate">{act.bookTitle}</h3>
                  <span className="text-[10px] text-slate-400">
                    Mencapai halaman {act.lastPage} ({act.status})
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400 shrink-0">
                  {formatDateIndo(act.updatedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

