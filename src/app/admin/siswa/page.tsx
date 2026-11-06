"use client";

import { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  KeyRound,
  Download,
  AlertCircle,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export default function AdminSiswaPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Add student form
  const [newNisn, setNewNisn] = useState("");
  const [newName, setNewName] = useState("");
  const [newClass, setNewClass] = useState("kelas-1");
  const [newBirthDate, setNewBirthDate] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Import state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importTargetClass, setImportTargetClass] = useState("all");
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string; nisn: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const url = selectedClass ? `/api/admin/students?classId=${selectedClass}` : "/api/admin/students";
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedClass]);

  const handleResetPassword = async (studentId: string, name: string) => {
    if (!confirm(`Reset password untuk siswa "${name}" ke bawaan 123456?`)) return;

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password", studentId }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Server gagal merespons (Timeout). Pastikan Environment Variables Firebase sudah terpasang di Vercel.");
      }
      if (!res.ok) throw new Error(data.error || "Gagal mendaftarkan siswa.");
      alert(data.message || "Password berhasil di-reset ke 123456.");
    } catch (err: any) {
      alert("Gagal reset password: " + err.message);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/students?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Server gagal merespons (Timeout). Pastikan Environment Variables Firebase sudah terpasang di Vercel.");
      }
      if (!res.ok) throw new Error(data.error || "Gagal mendaftarkan siswa.");
      alert(data.message || "Data siswa berhasil dihapus.");
      setDeleteTarget(null);
      fetchStudents();
    } catch (e: any) {
      alert("Gagal menghapus siswa: " + e.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    setAddMsg(null);

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nisn: newNisn,
          name: newName,
          classId: newClass,
          birthDate: newBirthDate,
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Server gagal merespons (Timeout). Pastikan Environment Variables Firebase sudah terpasang di Vercel.");
      }
      if (!res.ok) throw new Error(data.error || "Gagal mendaftarkan siswa.");

      setAddMsg({ type: "success", text: "Siswa berhasil didaftarkan!" });
      setNewNisn("");
      setNewName("");
      fetchStudents();
      setTimeout(() => setShowAddModal(false), 1200);
    } catch (err: any) {
      setAddMsg({ type: "error", text: err.message });
    } finally {
      setAddLoading(false);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("targetClass", importTargetClass);

      const res = await fetch("/api/admin/students/import", {
        method: "POST",
        body: formData,
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Server gagal merespons. Pastikan konfigurasi Firebase aktif.");
      }
      setImportResult(data);
      if (res.ok) fetchStudents();
    } catch (err: any) {
      setImportResult({ error: err.message });
    } finally {
      setImportLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      { NISN: "1234567891", Nama: "Budi Santoso", "Tanggal Lahir": "2016-04-12", Kelas: "kelas-1" },
      { NISN: "1234567892", Nama: "Siti Rahmawati", "Tanggal Lahir": "2016-08-25", Kelas: "kelas-1" },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template Siswa");
    XLSX.writeFile(wb, "template-import-siswa-sdn05.xlsx");
  };

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.nisn?.includes(search)
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Data Siswa 👥
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Kelola data siswa, reset password akun, dan impor daftar siswa massal via Excel.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={downloadTemplate}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Template Excel</span>
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Import Excel</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari berdasarkan nama atau NISN siswa..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500"
        >
          <option value="">Semua Kelas</option>
          <option value="kelas-1">Kelas 1</option>
          <option value="kelas-2">Kelas 2</option>
          <option value="kelas-3">Kelas 3</option>
          <option value="kelas-4">Kelas 4</option>
          <option value="kelas-5">Kelas 5</option>
          <option value="kelas-6">Kelas 6</option>
        </select>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Mobile horizontal scroll hint */}
        <div className="md:hidden px-4 py-2 bg-amber-50/80 border-b border-amber-200/50 text-[11px] text-amber-900 font-semibold flex items-center gap-1.5">
          <span>💡</span>
          <span>Geser tabel ke samping untuk melihat bintang, status password & aksi</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-slate-500">Memuat data siswa...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-slate-500">
            Tidak ada data siswa yang sesuai.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">NISN</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Kelas</th>
                  <th className="py-3 px-4">Bintang</th>
                  <th className="py-3 px-4">Buku Selesai</th>
                  <th className="py-3 px-4">Status Password</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{s.nisn}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-bold uppercase text-[10px]">
                        {s.classId}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-600">{s.totalPoints || 0} ⭐</td>
                    <td className="py-3 px-4 font-semibold">{s.totalBooksCompleted || 0} buku</td>
                    <td className="py-3 px-4">
                      {s.mustChangePassword ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Default (123456)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          Sudah Diganti
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleResetPassword(s.id, s.name)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-700 font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                          title="Reset password ke 123456"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Reset
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: s.id, name: s.name, nisn: s.nisn })}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-700 hover:text-red-700 font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                          title="Hapus data siswa"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add Student */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-black text-slate-900">Tambah Siswa Baru</h3>

            {addMsg && (
              <div
                className={`p-3 rounded-xl text-xs font-bold ${
                  addMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {addMsg.text}
              </div>
            )}

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">NISN (10 Digit)</label>
                <input
                  type="text"
                  required
                  value={newNisn}
                  onChange={(e) => setNewNisn(e.target.value)}
                  placeholder="1234567890"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama Siswa"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kelas</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold focus:outline-none focus:border-orange-500"
                  >
                    <option value="kelas-1">Kelas 1</option>
                    <option value="kelas-2">Kelas 2</option>
                    <option value="kelas-3">Kelas 3</option>
                    <option value="kelas-4">Kelas 4</option>
                    <option value="kelas-5">Kelas 5</option>
                    <option value="kelas-6">Kelas 6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={newBirthDate}
                    onChange={(e) => setNewBirthDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 font-semibold">
                *Password awal siswa otomatis diset ke <strong>123456</strong> dan wajib diubah saat login pertama.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-extrabold shadow-xs disabled:opacity-50"
                >
                  {addLoading ? "Menyimpan..." : "Simpan Siswa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  Import Data Siswa Excel / DAPODIK
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mendukung berkas ekspor <strong>DAPODIK Kemendikdasmen</strong> maupun format Excel mandiri.
                </p>
              </div>
            </div>

            {/* Target Class Selection */}
            <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <label className="block text-xs font-black text-slate-700">
                Pilih Kelas yang Ingin Diimpor:
              </label>
              <select
                value={importTargetClass}
                onChange={(e) => setImportTargetClass(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500 shadow-xs"
              >
                <option value="all">🌟 Semua Kelas (Otomatis sesuai kolom Rombel di file)</option>
                <option value="kelas-1">Hanya Kelas 1</option>
                <option value="kelas-2">Hanya Kelas 2</option>
                <option value="kelas-3">Hanya Kelas 3</option>
                <option value="kelas-4">Hanya Kelas 4</option>
                <option value="kelas-5">Hanya Kelas 5</option>
                <option value="kelas-6">Hanya Kelas 6</option>
              </select>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {importTargetClass === "all"
                  ? "💡 Sistem akan otomatis membagi siswa ke Kelas 1 s.d. 6 berdasarkan kolom Rombel Saat Ini."
                  : `🎯 Hanya siswa ${importTargetClass.replace("-", " ").toUpperCase()} yang akan diimpor. Siswa kelas lain di file akan dilewati.`}
              </p>
            </div>

            {/* Upload Box */}
            <div className="p-6 border-2 border-dashed border-emerald-200 rounded-2xl text-center space-y-3 bg-emerald-50/30">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleImportExcel}
                className="hidden"
                id="excel-file-upload"
              />
              <label
                htmlFor="excel-file-upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs cursor-pointer shadow-xs transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Pilih Berkas Excel / CSV (.xlsx / .csv)
              </label>
              <p className="text-[11px] text-slate-400">
                Format yang didukung: <strong>.xlsx, .xls, .csv</strong> (otomatis mengenali kolom Nama, NISN, Tanggal Lahir, Rombel Saat Ini)
              </p>
              {importLoading && (
                <p className="text-xs font-bold text-emerald-700 animate-pulse">
                  Sedang membaca dan mengimpor data siswa...
                </p>
              )}
            </div>

            {/* Results feedback */}
            {importResult && (
              <div
                className={`p-4 rounded-2xl text-xs space-y-2 ${
                  importResult.success
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "bg-red-50 text-red-900 border border-red-200"
                }`}
              >
                <p className="font-bold">{importResult.message || importResult.error}</p>

                {/* Class count breakdown if available */}
                {importResult.classCounts && (
                  <div className="pt-2 border-t border-emerald-200/60">
                    <span className="font-extrabold text-[11px] block mb-1 text-emerald-800">
                      Distribusi Siswa per Rombel di Berkas:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                      {Object.entries(importResult.classCounts).map(([cls, count]) => (
                        <div key={cls} className="bg-white/80 px-2 py-1 rounded-lg border border-emerald-200 font-semibold">
                          <span className="uppercase">{cls.replace("kelas-", "Kls ")}</span>: <strong>{count as number}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResult.errors?.length > 0 && (
                  <div className="mt-2 text-[11px] space-y-1 pt-2 border-t border-red-200">
                    <span className="font-bold">Catatan baris tidak terimpor:</span>
                    <ul className="list-disc pl-4 space-y-0.5 max-h-24 overflow-y-auto">
                      {importResult.errors.map((err: any, i: number) => (
                        <li key={i}>
                          Baris {err.row}: {err.error} {err.nisn ? `(NISN: ${err.nisn})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setImportResult(null);
                }}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete Student */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-black text-slate-900">Hapus Data Siswa?</h3>
              <p className="text-xs text-slate-500">
                Apakah Anda yakin ingin menghapus akun siswa <strong>{deleteTarget.name}</strong> (NISN: {deleteTarget.nisn})?
              </p>
              <p className="text-[11px] text-red-600 font-semibold bg-red-50 p-2.5 rounded-xl border border-red-100 text-left">
                ⚠️ Seluruh riwayat membaca, jurnal, dan perolehan Bintang Literasi siswa ini akan ikut terhapus permanen.
              </p>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteStudent}
                disabled={deleteLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-xs transition-colors disabled:opacity-50"
              >
                {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

