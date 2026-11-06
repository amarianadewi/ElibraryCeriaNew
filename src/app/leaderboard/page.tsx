"use client";

import { useEffect, useState } from "react";
import StudentNavbar from "@/components/student/StudentNavbar";
import StudentBottomNav from "@/components/student/StudentBottomNav";
import { Trophy, Medal, Crown, Sparkles, BookOpen, Clock } from "lucide-react";
import { formatMinutes } from "@/lib/utils";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [currentStudent, setCurrentStudent] = useState<any>(null);
  const [tab, setTab] = useState<"global" | "class">("global");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // 1. Fetch current student identity once
  useEffect(() => {
    async function fetchMe() {
      try {
        const studentRes = await fetch("/api/student/me");
        if (studentRes.ok) {
          const sData = await studentRes.json();
          setCurrentStudent(sData);
          if (sData?.classId && !selectedClass) {
            setSelectedClass(sData.classId);
          }
        }
      } catch (err) {
        console.error("Failed to load student profile:", err);
      }
    }
    fetchMe();
  }, []);

  // 2. Fetch leaderboard data whenever tab or selectedClass changes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg("");
      try {
        let query = "";
        if (tab === "class") {
          const cId = selectedClass || currentStudent?.classId || "kelas-1";
          query = `?classId=${cId}`;
        }

        const lbRes = await fetch(`/api/leaderboard${query}`);
        if (!lbRes.ok) {
          throw new Error("Gagal memuat papan peringkat.");
        }

        const lbData = await lbRes.json();
        setLeaderboard(lbData.leaderboard || []);
        if (Array.isArray(lbData.classes) && lbData.classes.length > 0) {
          setClasses(lbData.classes);
          if (!selectedClass && currentStudent?.classId) {
            setSelectedClass(currentStudent.classId);
          } else if (!selectedClass && lbData.classes[0]) {
            setSelectedClass(lbData.classes[0].id);
          }
        }
      } catch (e: any) {
        console.error("Leaderboard fetch error:", e);
        setErrorMsg(e?.message || "Terjadi kesalahan saat memuat peringkat.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [tab, selectedClass, currentStudent?.classId]);

  const top3 = leaderboard.slice(0, 3);
  const restList = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#FFFDF8] pb-24 md:pb-12">
      <StudentNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center justify-center gap-2">
            <Trophy className="w-8 h-8 text-amber-500" />
            Papan Peringkat Literasi Ceria 🏆
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500">
            Apresiasi siswa-siswi terhebat dalam membudayakan minat membaca di SD Negeri Kaliwungu 05
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-orange-100 p-1.5 rounded-2xl max-w-xs mx-auto">
          <button
            onClick={() => setTab("global")}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              tab === "global"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-600 hover:text-orange-600"
            }`}
          >
            Peringkat Global
          </button>
          <button
            onClick={() => {
              setTab("class");
              if (!selectedClass && currentStudent?.classId) {
                setSelectedClass(currentStudent.classId);
              }
            }}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              tab === "class"
                ? "bg-white text-orange-600 shadow-sm"
                : "text-slate-600 hover:text-orange-600"
            }`}
          >
            Peringkat Kelas
          </button>
        </div>

        {/* Class Filter Buttons when tab === 'class' */}
        {tab === "class" && classes.length > 0 && (
          <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
            {classes.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClass(c.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedClass === c.id
                    ? "bg-orange-500 text-white shadow-xs"
                    : "bg-orange-50 text-slate-700 hover:bg-orange-100 border border-orange-200"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Error message alert */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm font-semibold text-center">
            {errorMsg}
          </div>
        )}

        {/* Podium Top 3 */}
        {!loading && top3.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 items-end">
            {/* Rank 2 */}
            {top3[1] ? (
              <div className="card-ceria p-4 bg-white text-center flex flex-col items-center border-slate-200 order-1">
                <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-xl mb-2">
                  🥈
                </div>
                <span className="text-[10px] font-black uppercase text-slate-400">Juara 2</span>
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 truncate max-w-full">
                  {top3[1].name}
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">{top3[1].className}</span>
                <span className="mt-2 text-xs sm:text-sm font-black text-amber-600">
                  {top3[1].totalPoints} ⭐
                </span>
              </div>
            ) : (
              <div className="order-1" />
            )}

            {/* Rank 1 */}
            {top3[0] ? (
              <div className="card-ceria p-5 bg-gradient-to-b from-amber-50 to-white text-center flex flex-col items-center border-2 border-amber-400 shadow-lg order-2 -translate-y-2">
                <Crown className="w-8 h-8 text-amber-500 mb-1 animate-pulse" />
                <div className="w-14 h-14 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-2xl mb-2">
                  🥇
                </div>
                <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                  Juara 1
                </span>
                <h3 className="font-black text-sm sm:text-base text-slate-900 truncate max-w-full">
                  {top3[0].name}
                </h3>
                <span className="text-xs font-bold text-orange-600">{top3[0].className}</span>
                <span className="mt-2 text-sm sm:text-base font-black text-amber-600">
                  {top3[0].totalPoints} ⭐
                </span>
              </div>
            ) : (
              <div className="order-2" />
            )}

            {/* Rank 3 */}
            {top3[2] ? (
              <div className="card-ceria p-4 bg-white text-center flex flex-col items-center border-amber-200 order-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center text-xl mb-2">
                  🥉
                </div>
                <span className="text-[10px] font-black uppercase text-amber-800">Juara 3</span>
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 truncate max-w-full">
                  {top3[2].name}
                </h3>
                <span className="text-[11px] font-semibold text-slate-500">{top3[2].className}</span>
                <span className="mt-2 text-xs sm:text-sm font-black text-amber-600">
                  {top3[2].totalPoints} ⭐
                </span>
              </div>
            ) : (
              <div className="order-3" />
            )}
          </div>
        )}

        {/* Full Ranking Table */}
        <div className="card-ceria bg-white border-2 border-orange-200 overflow-hidden">
          <div className="p-4 border-b border-orange-100 flex justify-between items-center bg-orange-50/50">
            <h3 className="font-black text-sm text-slate-800">Daftar Peringkat Siswa</h3>
            <span className="text-xs font-bold text-slate-500">{leaderboard.length} Siswa</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs font-bold text-slate-500 animate-pulse">
              Memuat peringkat literasi...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-12 text-center text-xs font-bold text-slate-500">
              Belum ada data aktivitas membaca untuk ditampilkan pada kelas ini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {leaderboard.map((item) => {
                const isMe = currentStudent && currentStudent.id === item.id;
                return (
                  <div
                    key={item.id}
                    className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                      isMe ? "bg-orange-50/80 font-bold" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                          item.rank === 1
                            ? "bg-amber-400 text-white"
                            : item.rank === 2
                            ? "bg-slate-300 text-slate-800"
                            : item.rank === 3
                            ? "bg-amber-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {item.rank}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-xs sm:text-sm text-slate-800">
                            {item.name}
                          </h4>
                          {isMe && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-orange-500 text-white">
                              Kamu
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500">
                          {item.className} • {item.totalBooksCompleted} Buku Selesai
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs sm:text-sm font-black text-amber-600 block">
                        {item.totalPoints} ⭐
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {formatMinutes(item.totalReadingMinutes)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <StudentBottomNav />
    </div>
  );
}
