"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import StudentNavbar from "@/components/student/StudentNavbar";
import StudentBottomNav from "@/components/student/StudentBottomNav";
import {
  BookOpen,
  ArrowLeft,
  Sparkles,
  Calendar,
  Layers,
  GraduationCap,
  Bookmark,
  Share2,
} from "lucide-react";

export default function BookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [book, setBook] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [bookRes, progRes] = await Promise.all([
          fetch(`/api/books/${resolvedParams.id}`),
          fetch(`/api/reading-progress?bookId=${resolvedParams.id}`),
        ]);

        if (bookRes.ok) {
          const b = await bookRes.json();
          setBook(b);
        }
        if (progRes.ok) {
          const p = await progRes.json();
          setProgress(p.progress);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#FFFDF8] p-8 text-center">
        <h2 className="text-xl font-bold">Buku tidak ditemukan.</h2>
        <Link href="/katalog" className="text-orange-600 font-bold mt-4 inline-block">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-24 md:pb-12">
      <StudentNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Back Link */}
        <Link
          href="/katalog"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-orange-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Katalog
        </Link>

        {/* Main Book Card */}
        <div className="card-ceria p-6 sm:p-8 bg-white border-2 border-orange-200 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-start">
            {/* Cover */}
            <div className="relative w-44 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden shadow-lg border-2 border-orange-100 shrink-0 mx-auto sm:mx-0">
              <Image
                src={book.coverUrl || "/logo.png"}
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Book Info */}
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="badge-ceria bg-orange-100 text-orange-700">
                    Jenjang {book.readingLevel}
                  </span>
                  <span className="badge-ceria bg-sky-100 text-sky-700">
                    {book.category}
                  </span>
                  <span className="badge-ceria bg-amber-100 text-amber-800">
                    Kelas {book.recommendedGrades?.join(", ") || "1-6"}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight">
                  {book.title}
                </h1>
                <p className="text-sm font-bold text-slate-600">
                  Karya: <span className="text-orange-600">{book.author}</span>
                </p>
              </div>

              {/* Badges / Metrics */}
              <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400">Penerbit</span>
                  <span className="text-xs font-black text-slate-700 truncate block">
                    {book.publisher || "Pusbuk"}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-400">Tahun</span>
                  <span className="text-xs font-black text-slate-700">
                    {book.publicationYear || 2023}
                  </span>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-400">Target Usia</span>
                  <span className="text-xs font-black text-slate-700">
                    {book.recommendedAgeMin}–{book.recommendedAgeMax} Thn
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-2">
                <Link
                  href={`/baca/${book.id}?page=${progress?.lastPage || 1}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-md hover:shadow-lg transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>
                    {progress?.lastPage
                      ? `Lanjutkan Membaca (Hal. ${progress.lastPage})`
                      : "Mulai Membaca Sekarang"}
                  </span>
                </Link>

                {progress && (
                  <p className="text-xs font-semibold text-slate-500">
                    Status:{" "}
                    <span className="text-orange-600 font-bold">
                      {progress.status === "selesai" ? "Sudah Selesai Dibaca 🎉" : `Sedang Dibaca (${progress.progressPercentage}%)`}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">
              Sinopsis & Gambaran Cerita
            </h3>
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              {book.description ||
                "Buku bacaan anak non-teks berkualitas dari Kemendikdasmen untuk melatih kemampuan literasi dan imajinasi."}
            </p>
          </div>

          {/* AI Recommendation Insight */}
          {book.aiSummary && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Catatan Rekomendasi Literasi
              </div>
              <p className="text-xs font-medium text-amber-900 leading-relaxed">
                {book.aiSummary}
              </p>
            </div>
          )}
        </div>
      </main>

      <StudentBottomNav />
    </div>
  );
}

