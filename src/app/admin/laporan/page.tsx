"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileSpreadsheet, FileText, Download, Printer, Filter } from "lucide-react";
import { formatMinutes } from "@/lib/utils";

export default function AdminLaporanPage() {
  const [selectedClass, setSelectedClass] = useState("");
  const [exporting, setExporting] = useState(false);

  const exportExcel = async () => {
    setExporting(true);
    try {
      const url = selectedClass ? `/api/admin/students?classId=${selectedClass}` : "/api/admin/students";
      const res = await fetch(url);
      const data = await res.json();
      const students = data.students || [];

      const rows = students.map((s: any, idx: number) => ({
        No: idx + 1,
        NISN: s.nisn,
        "Nama Siswa": s.name,
        Kelas: s.classId?.toUpperCase(),
        "Buku Selesai": s.totalBooksCompleted || 0,
        "Halaman Dibaca": s.totalPagesRead || 0,
        "Waktu Membaca (Menit)": s.totalReadingMinutes || 0,
        "Bintang Literasi": s.totalPoints || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Laporan Literasi");
      XLSX.writeFile(wb, `Laporan-Literasi-SDN-Kaliwungu-05-${selectedClass || "Semua"}.xlsx`);
    } catch (e: any) {
      alert("Gagal ekspor Excel: " + e.message);
    } finally {
      setExporting(false);
    }
  };

  const exportPDF = async () => {
    setExporting(true);
    try {
      const url = selectedClass ? `/api/admin/students?classId=${selectedClass}` : "/api/admin/students";
      const res = await fetch(url);
      const data = await res.json();
      const students = data.students || [];

      const doc = new jsPDF();

      // Header
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN AKTIVITAS LITERASI SISWA", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("SD NEGERI KALIWUNGU 05 - E-LIBRARY CERIA", 105, 27, { align: "center" });
      doc.setFontSize(10);
      doc.text(`Dicetak pada: ${new Date().toLocaleDateString("id-ID")}`, 105, 33, { align: "center" });

      doc.setLineWidth(0.5);
      doc.line(14, 37, 196, 37);

      const tableRows = students.map((s: any, idx: number) => [
        idx + 1,
        s.nisn,
        s.name,
        s.classId?.toUpperCase() || "-",
        s.totalBooksCompleted || 0,
        s.totalPagesRead || 0,
        `${s.totalReadingMinutes || 0} mnt`,
        `${s.totalPoints || 0} ⭐`,
      ]);

      (autoTable as any)(doc, {
        startY: 42,
        head: [["No", "NISN", "Nama Siswa", "Kelas", "Buku", "Halaman", "Waktu", "Bintang"]],
        body: tableRows,
        theme: "striped",
        headStyles: { fillColor: [255, 107, 0] },
        styles: { fontSize: 9 },
      });

      doc.save(`Laporan-Literasi-SDN-Kaliwungu-05-${selectedClass || "Semua"}.pdf`);
    } catch (e: any) {
      alert("Gagal ekspor PDF: " + e.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Laporan & Ekspor Data Literasi 📊
        </h1>
        <p className="text-xs font-semibold text-slate-500">
          Unduh laporan resmi perkembangan literasi siswa dalam format Excel (.xlsx) dan PDF siap cetak.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
        <h2 className="text-base font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Filter className="w-5 h-5 text-orange-500" />
          Filter Laporan
        </h2>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Pilih Kelas</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full sm:w-64 px-4 py-2.5 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-orange-500"
          >
            <option value="">Semua Kelas (1 s/d 6)</option>
            <option value="kelas-1">Kelas 1</option>
            <option value="kelas-2">Kelas 2</option>
            <option value="kelas-3">Kelas 3</option>
            <option value="kelas-4">Kelas 4</option>
            <option value="kelas-5">Kelas 5</option>
            <option value="kelas-6">Kelas 6</option>
          </select>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {/* Excel Card */}
          <div className="card-ceria p-5 bg-emerald-50/50 border-emerald-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Ekspor Format Excel (.xlsx)</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Cocok untuk olah data lanjutan, rekapitulasi nilai, atau administrasi sekolah.
              </p>
            </div>
            <button
              onClick={exportExcel}
              disabled={exporting}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas Excel</span>
            </button>
          </div>

          {/* PDF Card */}
          <div className="card-ceria p-5 bg-orange-50/50 border-orange-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Ekspor Format PDF (.pdf)</h3>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Laporan rapi siap cetak lengkap dengan kop sekolah untuk dokumentasi evaluasi.
              </p>
            </div>
            <button
              onClick={exportPDF}
              disabled={exporting}
              className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Berkas PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

