"use client";

import { useEffect, useState } from "react";
import StudentNavbar from "@/components/student/StudentNavbar";
import StudentBottomNav from "@/components/student/StudentBottomNav";
import { Sparkles, Award, Lock, CheckCircle2, ShieldCheck, Flame } from "lucide-react";
import { formatDateIndo } from "@/lib/utils";

export default function BintangPage() {
  const [student, setStudent] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [studentRes, badgesRes] = await Promise.all([
          fetch("/api/student/me"),
          fetch("/api/badges"),
        ]);

        if (studentRes.ok) setStudent(await studentRes.json());
        if (badgesRes.ok) {
          const bData = await badgesRes.json();
          setBadges(bData.badges || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const pointRules = [
    { activity: "Membaca 10 Menit Aktif", points: "+5 Poin", desc: "Dihitung otomatis saat layar aktif" },
    { activity: "Membaca 20 Halaman Unik", points: "+5 Poin", desc: "Halaman yang sama tidak dihitung ulang" },
    { activity: "Menyelesaikan 1 Buku", points: "+20 Poin", desc: "Membaca minimal 90% halaman buku" },
    { activity: "Mengisi Jurnal Membaca", points: "+5 Poin", desc: "Setelah mencatat ringkasan bacaan" },
    { activity: "Streak Membaca 7 Hari", points: "+15 Poin", desc: "Membaca konsisten selama 7 hari" },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-24 md:pb-12">
      <StudentNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Header Hero */}
        <div className="card-ceria p-6 sm:p-8 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white border-none shadow-lg text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shadow-inner">
            ⭐
          </div>
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-amber-100">
              Koleksi Bintang Literasimu
            </span>
            <h1 className="text-4xl sm:text-5xl font-black mt-1">
              {student ? student.totalPoints || 0 : 0}{" "}
              <span className="text-2xl font-bold">Bintang</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm font-medium text-amber-50 max-w-md mx-auto">
            Semakin banyak kamu membaca buku dan mengisi jurnal, semakin banyak Bintang Literasi dan
            lencana kehormatan yang kamu kumpulkan!
          </p>
        </div>

        {/* Lencana Kehormatan / Badges */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              Lencana Pencapaian ({badges.filter((b) => b.unlocked).length}/{badges.length})
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              Buka seluruh lencana dengan rajin membaca setiap hari!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {badges.map((b) => (
              <div
                key={b.id}
                className={`card-ceria p-5 flex items-start gap-4 transition-all ${
                  b.unlocked
                    ? "bg-white border-2 border-amber-300 shadow-md"
                    : "bg-slate-50 border border-slate-200 opacity-60"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                    b.unlocked ? "bg-amber-100 shadow-xs ring-2 ring-amber-300" : "bg-slate-200 grayscale"
                  }`}
                >
                  {b.icon || "🏆"}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-sm text-slate-800">{b.name}</h3>
                    {b.unlocked ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-500">{b.description}</p>
                  {b.unlocked && b.unlockedAt && (
                    <span className="block text-[10px] font-bold text-amber-700">
                      Diraih: {formatDateIndo(b.unlockedAt)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Aturan Poin Literasi */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              Cara Mendapatkan Bintang Literasi
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              Pelajari aktivitas apa saja yang memberikanmu Bintang tambahan
            </p>
          </div>

          <div className="card-ceria bg-white border-2 border-orange-200 overflow-hidden">
            <div className="divide-y divide-orange-100">
              {pointRules.map((rule, idx) => (
                <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800">{rule.activity}</h4>
                    <p className="text-xs font-medium text-slate-500">{rule.desc}</p>
                  </div>
                  <span className="px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-800 font-black text-sm shrink-0">
                    {rule.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <StudentBottomNav />
    </div>
  );
}

