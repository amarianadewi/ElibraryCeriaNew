"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldAlert, CheckCircle2 } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("Password baru minimal harus 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    if (newPassword === "123456") {
      setError("Password baru tidak boleh menggunakan password default (123456).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/student/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengubah password.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-orange-200">
        <div className="text-center mb-6">
          <div className="relative w-16 h-16 mx-auto mb-3 rounded-2xl overflow-hidden shadow-md ring-4 ring-orange-400/30">
            <Image src="/logo.png" alt="Logo" fill className="object-cover" priority />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Ganti Password</h1>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            Demi keamanan akun Anda, silakan ubah password bawaan Anda.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-2 animate-bounce" />
            <h3 className="text-lg font-bold text-slate-800">Password Berhasil Diubah!</h3>
            <p className="text-xs text-slate-500 mt-1">Mengarahkan Anda ke Dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password Lama (Awal: 123456)
              </label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password lama"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-orange-100 text-sm font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password Baru (Min. 6 Karakter)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Buat password baru yang mudah diingat"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-orange-100 text-sm font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ulangi Password Baru
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password baru"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-orange-100 text-sm font-semibold focus:outline-none focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {loading ? "Menyimpan Password..." : "Simpan Password Baru"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

