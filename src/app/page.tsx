import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Sparkles,
  Award,
  ArrowRight,
  ShieldCheck,
  Star,
  Zap,
  Users,
  Trophy,
  CheckCircle2,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF7ED] via-[#FFFDF8] to-white flex flex-col">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-orange-400/30 shadow-md">
            <Image
              src="/logo.png"
              alt="Logo E-Library Kaliwungu 05 Ceria"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div>
            <span className="font-black text-xl text-slate-800 tracking-tight leading-none block">
              E-Library <span className="text-orange-500">Ceria</span>
            </span>
            <span className="text-xs font-bold text-slate-500">SD Negeri Kaliwungu 05</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/katalog"
            className="hidden sm:inline-flex px-4 py-2 rounded-xl text-slate-700 hover:text-orange-600 font-bold text-sm transition-colors"
          >
            Katalog Buku
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all"
          >
            Masuk / Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center text-center space-y-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-800 font-extrabold text-xs uppercase tracking-wider shadow-xs">
          <Sparkles className="w-4 h-4 text-orange-500 fill-orange-400" />
          Pusat Literasi Digital Resmi Sekolah
        </div>

        <div className="max-w-3xl space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Membaca Menyenangkan, Berprestasi <span className="text-orange-500">Ceria!</span> 🌟
          </h1>
          <p className="text-base sm:text-lg font-medium text-slate-600 leading-relaxed">
            Perpustakaan digital modern <strong>SD Negeri Kaliwungu 05</strong>. Temukan ratusan buku
            cerita bergambar Kemendikdasmen, catat jurnal membaca, dan kumpulkan <strong>Bintang Literasi</strong> tertinggi!
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Masuk Sebagai Siswa</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/katalog"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-orange-50 text-slate-700 font-extrabold text-sm border-2 border-orange-200 shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-orange-500" />
            <span>Jelajahi 480+ Buku</span>
          </Link>
        </div>

        {/* Live Metrics Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-4xl pt-4">
          <div className="card-ceria p-4 bg-white/80 border-orange-200">
            <span className="block text-2xl sm:text-3xl font-black text-orange-600">487+</span>
            <span className="text-xs font-bold text-slate-500">Buku Digital Resmi</span>
          </div>
          <div className="card-ceria p-4 bg-white/80 border-sky-200">
            <span className="block text-2xl sm:text-3xl font-black text-sky-600">6 Jenjang</span>
            <span className="text-xs font-bold text-slate-500">Kelas 1 s/d 6 SD</span>
          </div>
          <div className="card-ceria p-4 bg-white/80 border-emerald-200">
            <span className="block text-2xl sm:text-3xl font-black text-emerald-600">6 Lencana</span>
            <span className="text-xs font-bold text-slate-500">Penghargaan Literasi</span>
          </div>
          <div className="card-ceria p-4 bg-white/80 border-amber-200">
            <span className="block text-2xl sm:text-3xl font-black text-amber-600">100% Gratis</span>
            <span className="text-xs font-bold text-slate-500">Kemendikdasmen RI</span>
          </div>
        </div>

        {/* Three Pillars (Read, Record, Reward) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-6 text-left">
          <div className="card-ceria p-6 sm:p-7 bg-white border-2 border-orange-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl shadow-xs">
              📖
            </div>
            <h2 className="text-lg font-black text-slate-800">1. READ — Membaca</h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              Akses koleksi buku nonteks resmi Kemendikdasmen dengan e-reader interaktif. Lacak waktu aktif membaca dan halaman yang sudah diselesaikan.
            </p>
          </div>

          <div className="card-ceria p-6 sm:p-7 bg-white border-2 border-sky-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center text-2xl shadow-xs">
              📝
            </div>
            <h2 className="text-lg font-black text-slate-800">2. RECORD — Mencatat</h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              Tulis catatan dan pesan kebaikan dari buku yang kamu baca di Jurnal Membaca. Dapatkan +5 Bintang Literasi setiap kali mengisi jurnal.
            </p>
          </div>

          <div className="card-ceria p-6 sm:p-7 bg-white border-2 border-amber-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shadow-xs">
              ⭐
            </div>
            <h2 className="text-lg font-black text-slate-800">3. REWARD — Menghargai</h2>
            <p className="text-xs sm:text-sm font-medium text-slate-600 leading-relaxed">
              Raih poin Bintang Literasi, buka lencana kehormatan seperti Kutu Buku & Sahabat Literasi, serta puncaki papan peringkat sekolah!
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-orange-100 py-6 text-center text-xs font-semibold text-slate-400">
        <p>© 2026 E-Library Kaliwungu 05 Ceria • SD Negeri Kaliwungu 05</p>
      </footer>
    </div>
  );
}
