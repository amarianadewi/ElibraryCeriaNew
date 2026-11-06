"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { BookOpen, KeyRound, Sparkles, User, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"student" | "admin">("student");

  // Student form state
  const [nisn, setNisn] = useState("");
  const [studentPassword, setStudentPassword] = useState("");

  // Admin form state
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nisn, password: studentPassword }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        if (!res.ok) {
          throw new Error(
            `Server gagal merespons (Status ${res.status}). Kemungkinan Environment Variables Firebase di Vercel belum aktif. Pastikan sudah klik Redeploy di Vercel.`
          );
        }
        throw new Error("Respon dari server tidak dapat dibaca.");
      }

      if (!res.ok) {
        throw new Error(data?.error || "Gagal masuk.");
      }

      if (data.mustChangePassword) {
        router.push("/ganti-password");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setError("Email atau password admin salah: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-sky-50">
      <div className="w-full max-w-md space-y-4">
        {/* Main Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-orange-200">
          {/* Logo & Header */}
          <div className="text-center mb-6">
            <div className="relative w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden shadow-md ring-4 ring-orange-400/30">
              <Image
                src="/logo.png"
                alt="Logo E-Library Kaliwungu 05 Ceria"
                fill
                className="object-cover"
                priority
              />
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              E-Library <span className="text-orange-500">Ceria</span>
            </h1>
            <p className="text-xs font-bold text-slate-500 mt-1">
              SD Negeri Kaliwungu 05 • Literasi Menyenangkan
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex bg-orange-100/70 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setRole("student");
                setError("");
              }}
              className={`flex-1 py-2 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                role === "student"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-600 hover:text-orange-600"
              }`}
            >
              <User className="w-4 h-4" />
              Siswa
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("admin");
                setError("");
              }}
              className={`flex-1 py-2 rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all ${
                role === "admin"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-slate-600 hover:text-orange-600"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Student Login Form */}
          {role === "student" ? (
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Nomor Induk Siswa Nasional (NISN)
                </label>
                <input
                  type="text"
                  required
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value)}
                  placeholder="Contoh: 1234567890"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-orange-100 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex justify-between items-center">
                  <span>Password</span>
                  <span className="text-[11px] text-orange-600 font-semibold">
                    Awal: 123456
                  </span>
                </label>
                <input
                  type="password"
                  required
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-orange-100 text-sm font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? (
                  "Sedang Masuk..."
                ) : (
                  <>
                    <span>Mulai Membaca</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Admin Login Form */
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Email Super Admin
                </label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="fitria.novetasari15@admin.sd.belajar.id"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-orange-100 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password Admin
                </label>
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-orange-100 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Memeriksa..." : "Masuk ke Dashboard Admin"}
              </button>
            </form>
          )}

          {/* Footer note */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] font-semibold text-slate-400">
              Belum punya akun siswa? Hubungi Guru Kelas atau Kepala Sekolah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
