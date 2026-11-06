"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StudentNavbar from "@/components/student/StudentNavbar";
import StudentBottomNav from "@/components/student/StudentBottomNav";
import { PenTool, Calendar, BookOpen, Clock, FileText, CheckCircle2, Sparkles } from "lucide-react";
import { formatDateIndo } from "@/lib/utils";

function JurnalContent() {
  const searchParams = useSearchParams();
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [bookTitle, setBookTitle] = useState(() => searchParams.get("bookTitle") || "");
  const [bookId, setBookId] = useState(() => searchParams.get("bookId") || "");
  const [readingDate, setReadingDate] = useState(new Date().toISOString().slice(0, 10));
  const [durationMinutes, setDurationMinutes] = useState("15");
  const [pagesRead, setPagesRead] = useState("10");
  const [summary, setSummary] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const fetchJournals = async () => {
    try {
      const res = await fetch("/api/journals");
      if (res.ok) {
        const data = await res.json();
        setJournals(data.journals || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAlertMsg("");

    try {
      const res = await fetch("/api/journals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          bookTitle,
          readingDate,
          durationMinutes: parseInt(durationMinutes),
          pagesRead: parseInt(pagesRead),
          summary,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan jurnal.");

      setAlertMsg("🎉 Jurnal berhasil dicatat! Kamu mendapatkan 5 Bintang Literasi!");
      setSummary("");
      fetchJournals();
    } catch (err: any) {
      setAlertMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-24 md:pb-12">
      <StudentNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <PenTool className="w-7 h-7 text-orange-500" />
            Jurnal Membaca Siswa 📝
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Catat pemahamanmu setelah membaca buku untuk mengasah ingatan dan kumpulkan +5 Bintang Literasi!
          </p>
        </div>

        {alertMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-800 font-bold text-xs sm:text-sm flex items-center gap-2 animate-in fade-in">
            <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{alertMsg}</span>
          </div>
        )}

        {/* Input Form Card */}
        <div className="card-ceria p-6 sm:p-8 bg-white border-2 border-orange-200 space-y-6">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <span>Tulis Catatan Membaca Baru</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul Buku yang Dibaca
              </label>
              <input
                type="text"
                required
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="Contoh: Kisah Si Kancil dan Buaya"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-orange-100 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanggal Membaca
                </label>
                <input
                  type="date"
                  required
                  value={readingDate}
                  onChange={(e) => setReadingDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border-2 border-orange-100 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Waktu Membaca (Menit)
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border-2 border-orange-100 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jumlah Halaman Dibaca
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={pagesRead}
                  onChange={(e) => setPagesRead(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border-2 border-orange-100 text-sm font-bold text-slate-800 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ringkasan atau Pelajaran yang Kamu Dapatkan
              </label>
              <textarea
                required
                rows={4}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Ceritakan apa yang terjadi di dalam buku dan apa pesan baik yang kamu pelajari..."
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-orange-100 text-sm font-medium text-slate-800 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{submitting ? "Menyimpan..." : "Simpan Jurnal & Ambil Bintang"}</span>
            </button>
          </form>
        </div>

        {/* Previous Journals List */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-800">
            Riwayat Jurnal Kamu ({journals.length})
          </h2>

          {loading ? (
            <p className="text-xs font-bold text-slate-500">Memuat jurnal...</p>
          ) : journals.length === 0 ? (
            <div className="card-ceria p-8 text-center text-slate-500 text-xs font-semibold">
              Belum ada jurnal yang kamu tulis. Ayo mulai membaca dan catat jurnal pertamamu!
            </div>
          ) : (
            <div className="space-y-3">
              {journals.map((j) => (
                <div
                  key={j.id}
                  className="card-ceria p-5 bg-white border border-orange-100 space-y-2 hover:border-orange-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2">
                    <h3 className="text-base font-extrabold text-slate-800">
                      {j.bookTitle}
                    </h3>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        {formatDateIndo(j.readingDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        {j.durationMinutes} mnt
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-emerald-500" />
                        {j.pagesRead} hal
                      </span>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    &quot;{j.summary}&quot;
                  </p>
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
