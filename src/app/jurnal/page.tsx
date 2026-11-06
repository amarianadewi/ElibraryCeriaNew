"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import StudentNavbar from "@/components/student/StudentNavbar";
import StudentBottomNav from "@/components/student/StudentBottomNav";
import {
  PenTool,
  Calendar,
  BookOpen,
  Clock,
  FileText,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  ArrowRight,
  BookMarked,
  Smile,
  ExternalLink,
} from "lucide-react";
import { formatDateIndo } from "@/lib/utils";

interface ReadBookProgress {
  id: string;
  bookId: string;
  bookTitle: string;
  coverUrl?: string;
  lastPage?: number;
  highestPage?: number;
  pagesReadCount?: number;
  progressPercentage?: number;
  readingMinutes?: number;
  status?: string;
  updatedAt?: string;
}

interface JournalItem {
  id: string;
  bookId?: string;
  bookTitle: string;
  coverUrl?: string;
  readingDate: string;
  durationMinutes: number;
  pagesRead: number;
  summary: string;
  feeling?: string;
  createdAt: string;
}

const FEELING_OPTIONS = [
  "😊 Sangat Seru",
  "💡 Penuh Ilmu Baru",
  "❤️ Menyentuh Hati",
  "😄 Lucu & Menghibur",
  "🤔 Bikin Penasaran",
];

function JurnalContent() {
  const searchParams = useSearchParams();

  // Data states
  const [journals, setJournals] = useState<JournalItem[]>([]);
  const [loadingJournals, setLoadingJournals] = useState(true);
  const [readBooks, setReadBooks] = useState<ReadBookProgress[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);

  // Form states
  const [selectedBookId, setSelectedBookId] = useState(() => searchParams.get("bookId") || "");
  const [bookTitle, setBookTitle] = useState(() => searchParams.get("bookTitle") || "");
  const [coverUrl, setCoverUrl] = useState("");
  const readingDate = new Date().toISOString().slice(0, 10);
  const [feeling, setFeeling] = useState("😊 Sangat Seru");
  const [summary, setSummary] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // 1. Fetch student's journal history
  const fetchJournals = async () => {
    try {
      const res = await fetch("/api/journals");
      if (res.ok) {
        const data = await res.json();
        setJournals(data.journals || []);
      }
    } catch (e) {
      console.error("Gagal memuat jurnal:", e);
    } finally {
      setLoadingJournals(false);
    }
  };

  // 2. Fetch books the student has actually read in the app
  const fetchReadBooks = async () => {
    try {
      const res = await fetch("/api/reading-progress");
      if (res.ok) {
        const data = await res.json();
        const list: ReadBookProgress[] = data.progresses || [];
        setReadBooks(list);

        // Check if query param bookId matches
        const qBookId = searchParams.get("bookId");
        const qTitle = searchParams.get("bookTitle");
        if (qBookId) {
          const match = list.find((b) => b.bookId === qBookId);
          if (match) {
            setSelectedBookId(match.bookId);
            setBookTitle(match.bookTitle);
            setCoverUrl(match.coverUrl || "");
          } else if (qTitle) {
            // Dynamically include book coming directly from reading session
            const newEntry: ReadBookProgress = {
              id: qBookId,
              bookId: qBookId,
              bookTitle: decodeURIComponent(qTitle),
              status: "sedang",
            };
            setReadBooks([newEntry, ...list]);
            setSelectedBookId(qBookId);
            setBookTitle(decodeURIComponent(qTitle));
          }
        }
      }
    } catch (e) {
      console.error("Gagal memuat riwayat buku:", e);
    } finally {
      setLoadingBooks(false);
    }
  };

  useEffect(() => {
    fetchJournals();
    fetchReadBooks();
  }, []);

  // Handle dropdown selection
  const handleSelectBook = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedBookId(val);

    if (!val) {
      setBookTitle("");
      setCoverUrl("");
      return;
    }

    const matched = readBooks.find((b) => b.bookId === val);
    if (matched) {
      setBookTitle(matched.bookTitle);
      setCoverUrl(matched.coverUrl || "");
    }
  };

  const selectedBookData = readBooks.find((b) => b.bookId === selectedBookId);

  // Submit journal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!selectedBookId || !bookTitle) {
      setFeedback({
        type: "error",
        text: "Pilih salah satu buku yang telah kamu baca dari daftar pilihan di bawah.",
      });
      return;
    }

    if (!summary.trim() || summary.trim().length < 10) {
      setFeedback({
        type: "error",
        text: "Tuliskan ringkasan atau pesan baik minimal 1-2 kalimat (minimal 10 huruf).",
      });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: selectedBookId,
          bookTitle,
          coverUrl,
          readingDate: readingDate || new Date().toISOString().slice(0, 10),
          durationMinutes: selectedBookData?.readingMinutes || 15,
          pagesRead: selectedBookData?.highestPage || selectedBookData?.lastPage || 10,
          summary: summary.trim(),
          feeling,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan jurnal.");

      setFeedback({
        type: "success",
        text: "🎉 Jurnal berhasil dicatat ke riwayat membaca! Kamu mendapatkan +5 Bintang Literasi ⭐",
      });

      // Reset form text
      setSummary("");

      // Refresh journals history immediately
      await fetchJournals();

      // Scroll to history
      setTimeout(() => {
        const el = document.getElementById("riwayat-jurnal");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Gagal menyimpan jurnal.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-24 md:pb-12">
      <StudentNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <PenTool className="w-7 h-7 text-orange-500 shrink-0" />
            <span>Jurnal Membaca Siswa 📝</span>
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Catat pemahamanmu setelah membaca buku untuk mengasah ingatan dan kumpulkan <strong>+5 Bintang Literasi</strong> untuk setiap jurnal yang kamu selesaikan!
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border-2 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-300 text-emerald-800 shadow-xs"
                : "bg-rose-50 border-rose-300 text-rose-800"
            }`}
          >
            {feedback.type === "success" ? (
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Form Card */}
        <div className="card-ceria p-5 sm:p-8 bg-white border-2 border-orange-200 rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-orange-500" />
              <span>Tulis Catatan Membaca Baru</span>
            </h2>
            <span className="text-[11px] font-extrabold text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
              +5 ⭐ Bintang
            </span>
          </div>

          {/* Condition: Student has NOT read any books yet */}
          {!loadingBooks && readBooks.length === 0 ? (
            <div className="p-6 rounded-2xl bg-amber-50/70 border-2 border-dashed border-amber-300 text-center space-y-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-900">
                  Kamu Belum Membaca Buku di Aplikasi
                </h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                  Untuk mengisi jurnal membaca, kamu harus membaca buku cerita terlebih dahulu melalui katalog. Setelah kamu membuka dan membaca buku, bukunya akan otomatis muncul di sini!
                </p>
              </div>
              <Link
                href="/katalog"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Buka Katalog & Mulai Membaca</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* 1. Book Selector Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700">
                  Pilih Buku yang Telah Kamu Baca: <span className="text-red-500">*</span>
                </label>

                {loadingBooks ? (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-400 font-semibold animate-pulse">
                    Memuat daftar buku yang telah kamu baca...
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      required
                      value={selectedBookId}
                      onChange={handleSelectBook}
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-orange-200 text-xs sm:text-sm font-extrabold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
                    >
                      <option value="">
                        -- Pilih Buku dari Riwayat Membacamu ({readBooks.length} Buku Tersedia) --
                      </option>
                      {readBooks.map((b) => (
                        <option key={b.bookId} value={b.bookId}>
                          {b.bookTitle}{" "}
                          {b.status === "selesai"
                            ? "✅ (Selesai)"
                            : `(Dibaca s.d. Hal ${b.lastPage || 1})`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <p className="text-[11px] text-slate-400 font-medium">
                  💡 Hanya buku yang pernah kamu buka dan baca di aplikasi yang muncul di pilihan ini.
                </p>
              </div>

              {/* Book Preview Card if Selected */}
              {selectedBookData && (
                <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-12 sm:w-14 aspect-[3/4] rounded-xl overflow-hidden shrink-0 border border-orange-200 shadow-xs bg-white">
                      <Image
                        src={selectedBookData.coverUrl || "/logo.png"}
                        alt={selectedBookData.bookTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                        {selectedBookData.bookTitle}
                      </h4>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] font-bold">
                        <span className="flex items-center gap-1 text-slate-600 bg-white px-2 py-0.5 rounded-md border border-orange-100">
                          <Calendar className="w-3 h-3 text-orange-500" />
                          {formatDateIndo(readingDate)}
                        </span>
                        <span className="flex items-center gap-1 text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                          <Clock className="w-3 h-3 text-sky-500" />
                          {selectedBookData.readingMinutes || 15} Menit (Otomatis)
                        </span>
                        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          <FileText className="w-3 h-3 text-emerald-500" />
                          Hal. {selectedBookData.highestPage || selectedBookData.lastPage || 1} (
                          {selectedBookData.status === "selesai" ? "Tamat" : "Sedang dibaca"})
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/baca/${selectedBookData.bookId}`}
                    target="_blank"
                    className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs transition-colors self-start sm:self-center"
                  >
                    <span>Baca Lagi</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}

              {/* 2. Feeling / Emotion Selector (Quick 1-tap) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700">
                  Bagaimana Perasaanmu Setelah Membaca Buku Ini?
                </label>
                <div className="flex flex-wrap gap-2">
                  {FEELING_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => setFeeling(opt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        feeling === opt
                          ? "bg-orange-500 text-white shadow-xs scale-105"
                          : "bg-slate-100 hover:bg-orange-50 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Summary & Lessons Learned (Mandatory) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-700">
                  Tuliskan Ringkasan Cerita atau Pesan Baik yang Kamu Dapatkan: <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Ceritakan dengan kata-katamu sendiri apa yang terjadi di dalam buku dan pesan baik apa yang kamu pelajari..."
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-orange-100 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none focus:border-orange-500 transition-colors leading-relaxed"
                />
                <p className="text-[11px] text-slate-400 font-medium">
                  💡 Tanggal baca, menit membaca, dan jumlah halaman otomatis tersimpan dari rekor membaca akunmu.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting || !selectedBookId}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{submitting ? "Menyimpan ke Riwayat..." : "Simpan Jurnal & Ambil +5 Bintang ⭐"}</span>
              </button>
            </form>
          )}
        </div>

        {/* ============================================================== */}
        {/* Riwayat / History Jurnal Membaca                               */}
        {/* ============================================================== */}
        <div id="riwayat-jurnal" className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                <span>Riwayat Jurnal Kamu</span>
                <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-black">
                  {journals.length}
                </span>
              </h2>
              <p className="text-xs font-semibold text-slate-400">
                Seluruh catatan membaca yang sudah berhasil kamu rekam dan kumpulkan bintangnya.
              </p>
            </div>
          </div>

          {loadingJournals ? (
            <div className="p-12 text-center text-xs font-bold text-slate-500 space-y-2">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Memuat riwayat jurnal membaca...</p>
            </div>
          ) : journals.length === 0 ? (
            <div className="card-ceria p-8 sm:p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center mx-auto">
                <PenTool className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Belum Ada Riwayat Jurnal</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Ayo pilih buku yang telah kamu baca di atas, ceritakan pelajaran baiknya, dan raih <strong>+5 Bintang Literasi</strong> pertamamu!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {journals.map((j, idx) => (
                <div
                  key={j.id || idx}
                  className="card-ceria p-4 sm:p-5 bg-white border border-orange-100 rounded-3xl space-y-3 hover:border-orange-300 transition-colors shadow-xs"
                >
                  {/* Top Bar: Book Cover, Title, Date, Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative w-12 aspect-[3/4] rounded-lg overflow-hidden shrink-0 border border-slate-200 shadow-xs bg-slate-100">
                        <Image
                          src={j.coverUrl || "/logo.png"}
                          alt={j.bookTitle}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 truncate">
                          {j.bookTitle}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-bold text-slate-500">
                          <span className="flex items-center gap-1 text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                            {formatDateIndo(j.readingDate || j.createdAt)}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 text-sky-600">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            {j.durationMinutes} Menit
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="flex items-center gap-1 text-emerald-600">
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            {j.pagesRead} Halaman
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                        +5 ⭐ Bintang
                      </span>
                      {j.feeling && (
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {j.feeling}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary Text */}
                  <div className="bg-slate-50/80 p-3 sm:p-3.5 rounded-2xl border border-slate-100">
                    <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed italic">
                      &quot;{j.summary}&quot;
                    </p>
                  </div>

                  {/* Action Link if Book ID exists */}
                  {j.bookId && (
                    <div className="flex justify-end pt-0.5">
                      <Link
                        href={`/baca/${j.bookId}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
                      >
                        <span>Baca Kembali Buku Ini</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <StudentBottomNav />
    </div>
  );
}

export default function JurnalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <JurnalContent />
    </Suspense>
  );
}
