"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import StudentNavbar from "@/components/student/StudentNavbar";
import StudentBottomNav from "@/components/student/StudentBottomNav";
import { Search, Filter, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";

export default function KatalogPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const categories = [
    "Semua",
    "Cerita Anak",
    "Sains",
    "Lingkungan",
    "Budaya",
    "Pengetahuan Umum",
    "Pendidikan Karakter",
  ];

  const grades = [
    { label: "Semua Kelas", value: "" },
    { label: "Kelas 1", value: "1" },
    { label: "Kelas 2", value: "2" },
    { label: "Kelas 3", value: "3" },
    { label: "Kelas 4", value: "4" },
    { label: "Kelas 5", value: "5" },
    { label: "Kelas 6", value: "6" },
  ];

  const levels = ["Semua", "Dini", "Awal", "Semenjana", "Madya", "Mahir"];

  useEffect(() => {
    async function fetchBooks() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append("q", search);
        if (selectedGrade) params.append("grade", selectedGrade);
        if (selectedCategory && selectedCategory !== "Semua") params.append("category", selectedCategory);
        if (selectedLevel && selectedLevel !== "Semua") params.append("level", selectedLevel);
        params.append("page", String(page));
        params.append("limit", "18");

        const res = await fetch(`/api/books?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setBooks(data.books || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchBooks, 300);
    return () => clearTimeout(timer);
  }, [search, selectedGrade, selectedCategory, selectedLevel, page]);

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-24 md:pb-12">
      <StudentNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Katalog Buku Cerita & Pengetahuan 📚
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Jelajahi {total} koleksi buku digital resmi Kemendikdasmen untuk SD Negeri Kaliwungu 05.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="card-ceria p-4 sm:p-5 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari judul buku, nama penulis, atau topik cerita..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border-2 border-orange-100 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Grade Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Kelas:
            </span>
            {grades.map((g) => (
              <button
                key={g.value}
                onClick={() => {
                  setSelectedGrade(g.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedGrade === g.value
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-orange-50 text-orange-800 hover:bg-orange-100"
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 mr-1">Kategori:</span>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setSelectedCategory(c === "Semua" ? "" : c);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  (c === "Semua" && !selectedCategory) || selectedCategory === c
                    ? "bg-slate-800 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Book Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-600">Memuat koleksi buku ceria...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="card-ceria p-12 text-center space-y-3">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700">Tidak ada buku yang cocok</h3>
            <p className="text-xs text-slate-500">
              Coba ganti kata kunci pencarian atau ubah pilihan filter kelas/kategori.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
            {books.map((b) => (
              <Link
                key={b.id}
                href={`/katalog/${b.id}`}
                className="card-ceria p-3 flex flex-col group hover:border-orange-400 bg-white"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2.5 bg-slate-100 shadow-xs">
                  <Image
                    src={b.coverUrl || "/logo.png"}
                    alt={b.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                  />
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-white/95 text-orange-600 shadow-xs">
                      {b.readingLevel}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                      {b.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 line-clamp-1 mt-0.5">
                      {b.author}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-orange-600">
                    <span className="bg-orange-50 px-2 py-0.5 rounded-md">
                      Kelas {b.recommendedGrades?.join(", ") || "1-6"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold disabled:opacity-40 hover:bg-orange-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl">
              Halaman {page} dari {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold disabled:opacity-40 hover:bg-orange-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      <StudentBottomNav />
    </div>
  );
}

