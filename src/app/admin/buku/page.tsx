"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AdminBukuPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState("25");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBooks() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append("q", search);
        if (category) params.append("category", category);
        if (level) params.append("level", level);
        params.append("page", String(page));
        params.append("limit", pageSize);

        const res = await fetch(`/api/books?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setBooks(data.books || []);
          setTotal(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    const t = setTimeout(loadBooks, 250);
    return () => clearTimeout(t);
  }, [search, category, level, page, pageSize]);

  const startIndex = pageSize === "all" ? 1 : (page - 1) * parseInt(pageSize) + 1;
  const endIndex =
    pageSize === "all" ? total : Math.min(page * parseInt(pageSize), total);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Title & Stats Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-orange-500" />
            Katalog & Klasifikasi Buku 📚
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Kelola dan tinjau seluruh koleksi buku nonteks resmi Kemendikdasmen di SDN Kaliwungu 05.
          </p>
        </div>

        {/* Total Metric Card */}
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Koleksi
              </span>
              <span className="text-sm font-black text-slate-800">{total} Buku Terdaftar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari judul buku, nama penulis, atau topik cerita..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-44 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500"
          >
            <option value="">Semua Kategori</option>
            <option value="Cerita Anak">Cerita Anak</option>
            <option value="Sains">Sains</option>
            <option value="Lingkungan">Lingkungan</option>
            <option value="Budaya">Budaya</option>
            <option value="Pendidikan Karakter">Pendidikan Karakter</option>
            <option value="Pengetahuan Umum">Pengetahuan Umum</option>
            <option value="Sejarah">Sejarah</option>
          </select>

          {/* Level Dropdown */}
          <select
            value={level}
            onChange={(e) => {
              setLevel(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-40 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500"
          >
            <option value="">Semua Jenjang</option>
            <option value="Dini">Jenjang Dini</option>
            <option value="Awal">Jenjang Awal</option>
            <option value="Semenjana">Jenjang Semenjana</option>
            <option value="Madya">Jenjang Madya</option>
            <option value="Mahir">Jenjang Mahir</option>
          </select>

          {/* Items Per Page */}
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-slate-500">
            <span>Tampil:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-800 focus:outline-none focus:border-orange-500"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="all">Semua ({total})</option>
            </select>
          </div>
        </div>

        {/* Counter summary */}
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Menampilkan <strong className="text-slate-800">{total > 0 ? startIndex : 0} - {endIndex}</strong> dari{" "}
            <strong className="text-orange-600">{total}</strong> buku
          </span>
          {(search || category || level) && (
            <button
              onClick={() => {
                setSearch("");
                setCategory("");
                setLevel("");
                setPage(1);
              }}
              className="text-orange-600 hover:underline text-[11px]"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Mobile horizontal scroll hint */}
        <div className="md:hidden px-4 py-2 bg-amber-50/80 border-b border-amber-200/50 text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
          <span>💡</span>
          <span>Geser tabel ke samping untuk melihat kategori, jenjang & tautan buku</span>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-slate-500">Memuat katalog seluruh buku...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="p-16 text-center text-xs font-bold text-slate-500 space-y-2">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <p>Tidak ada buku yang cocok dengan pencarian Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">No</th>
                  <th className="py-3 px-4">Buku & Penulis</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Jenjang</th>
                  <th className="py-3 px-4">Rekomendasi Kelas</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {books.map((b, idx) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 text-slate-400 font-mono font-bold">
                      {pageSize === "all" ? idx + 1 : (page - 1) * parseInt(pageSize) + idx + 1}
                    </td>
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="relative w-10 aspect-[3/4] rounded-lg overflow-hidden shrink-0 border border-slate-200 shadow-xs bg-slate-100">
                        <Image src={b.coverUrl || "/logo.png"} alt={b.title} fill className="object-cover" />
                      </div>
                      <div className="truncate max-w-[280px]">
                        <h4 className="font-extrabold text-xs text-slate-900 truncate">{b.title}</h4>
                        <span className="text-[10px] text-slate-400 block truncate">{b.author}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 font-bold text-[10px] text-slate-700">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-orange-50 font-bold text-[10px] text-orange-700">
                        {b.readingLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      Kelas {b.recommendedGrades?.join(", ") || "1-6"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        Terverifikasi
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/baca/${b.id}`}
                        target="_blank"
                        className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-700 inline-flex items-center gap-1 font-bold text-[11px] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Baca
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {pageSize !== "all" && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200">
          <span className="text-xs font-bold text-slate-500">
            Halaman <strong className="text-slate-800">{page}</strong> dari{" "}
            <strong className="text-slate-800">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
            >
              Awal
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
              title="Halaman Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page number buttons */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    page === pageNum
                      ? "bg-orange-500 text-white shadow-xs"
                      : "border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
              title="Halaman Selanjutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none"
            >
              Akhir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
