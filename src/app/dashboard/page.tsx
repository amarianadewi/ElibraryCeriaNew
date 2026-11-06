"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import StudentNavbar from "@/components/student/StudentNavbar";
import StudentBottomNav from "@/components/student/StudentBottomNav";
import {
  BookOpen,
  Sparkles,
  Clock,
  FileText,
  Trophy,
  ArrowRight,
  Flame,
  Award,
} from "lucide-react";
import { formatMinutes } from "@/lib/utils";

export default function DashboardPage() {
  const [student, setStudent] = useState<any>(null);
  const [recentProgress, setRecentProgress] = useState<any[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const studentRes = await fetch("/api/student/me");
        if (studentRes.ok) {
          const s = await studentRes.json();
          setStudent(s);

          // Fetch recommended books for student's grade
          const gradeMatch = s.classId ? s.classId.match(/\d+/) : null;
          const grade = gradeMatch ? gradeMatch[0] : "3";

          const booksRes = await fetch(`/api/books?grade=${grade}&limit=6`);
          if (booksRes.ok) {
            const bData = await booksRes.json();
            setRecommendedBooks(bData.books || []);
          }
        }

        // Fetch recent progresses
        const progRes = await fetch("/api/reading-progress");
        if (progRes.ok) {
          const pData = await progRes.json();
          setRecentProgress(pData.progresses || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const lastRead = recentProgress.length > 0 ? recentProgress[0] : null;

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-24 md:pb-12">
      <StudentNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 p-6 sm:p-8 text-white shadow-lg">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Semangat Literasi Ceria
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Halo, {student ? student.name : "Siswa Hebat"}! 👋
            </h1>
            <p className="text-sm sm:text-base font-medium text-orange-50">
              Setiap halaman yang kamu baca adalah petualangan baru. Kumpulkan Bintang Literasi dan
              jadilah Juara Membaca di SDN Kaliwungu 05!
            </p>
          </div>
          {/* Decorative shapes */}
          <div className="absolute right-2 -bottom-10 opacity-20 pointer-events-none select-none text-9xl">
            📖
          </div>
        </div>

        {/* Literacy Summary Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card-ceria p-4 sm:p-5 flex items-center gap-3.5 border-orange-200">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-500">Buku Selesai</span>
              <span className="text-xl sm:text-2xl font-black text-slate-800">
                {student ? student.totalBooksCompleted || 0 : 0}
              </span>
            </div>
          </div>

          <div className="card-ceria p-4 sm:p-5 flex items-center gap-3.5 border-sky-200">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-500">Halaman Dibaca</span>
              <span className="text-xl sm:text-2xl font-black text-slate-800">
                {student ? student.totalPagesRead || 0 : 0}
              </span>
            </div>
          </div>

          <div className="card-ceria p-4 sm:p-5 flex items-center gap-3.5 border-emerald-200">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-500">Waktu Membaca</span>
              <span className="text-xl sm:text-2xl font-black text-slate-800">
                {student ? formatMinutes(student.totalReadingMinutes || 0) : "0 menit"}
              </span>
            </div>
          </div>

          <div className="card-ceria p-4 sm:p-5 flex items-center gap-3.5 border-amber-200 bg-amber-50/50">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-500">Bintang Literasi</span>
              <span className="text-xl sm:text-2xl font-black text-amber-600">
                {student ? student.totalPoints || 0 : 0} ⭐
              </span>
            </div>
          </div>
        </div>

        {/* Section: Lanjutkan Membaca */}
        {lastRead && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                Lanjutkan Membaca
              </h2>
            </div>
            <div className="card-ceria p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-6 bg-white border-2 border-orange-200">
              <div className="relative w-28 sm:w-32 aspect-[3/4] rounded-2xl overflow-hidden shadow-md shrink-0 border-2 border-orange-100">
                <Image
                  src={lastRead.coverUrl || "/logo.png"}
                  alt={lastRead.bookTitle || "Cover"}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 w-full space-y-3">
                <div className="space-y-1">
                  <span className="badge-ceria bg-orange-100 text-orange-700">
                    Halaman Terakhir: {lastRead.lastPage || 1}
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-800 leading-snug">
                    {lastRead.bookTitle}
                  </h3>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Progres Membaca</span>
                    <span>{lastRead.progressPercentage || 0}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${lastRead.progressPercentage || 5}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/baca/${lastRead.bookId}?page=${lastRead.lastPage || 1}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-md transition-all"
                  >
                    <span>Lanjutkan Membaca</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Section: Rekomendasi Buku */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-500" />
                Rekomendasi Buku Untuk Kamu
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Dipilih khusus untuk mendukung kegiatan membaca di jenjang kelasmu
              </p>
            </div>
            <Link
              href="/katalog"
              className="text-xs sm:text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {recommendedBooks.map((book) => (
              <Link
                key={book.id}
                href={`/katalog/${book.id}`}
                className="card-ceria p-3 flex flex-col group hover:border-orange-400"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2.5 bg-slate-100 shadow-xs">
                  <Image
                    src={book.coverUrl || "/logo.png"}
                    alt={book.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-black bg-white/90 text-orange-700 shadow-xs backdrop-blur-xs">
                    {book.readingLevel}
                  </span>
                </div>
                <h3 className="font-extrabold text-xs text-slate-800 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-[11px] font-medium text-slate-500 line-clamp-1 mt-1">
                  {book.author}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <StudentBottomNav />
    </div>
  );
}

