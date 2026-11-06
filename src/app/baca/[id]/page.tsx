"use client";

import { use, useEffect, useState, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Clock,
  Sparkles,
  PenTool,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { formatMinutes } from "@/lib/utils";
import PdfCanvasReader from "@/components/reader/PdfCanvasReader";

function ActiveTimer({ isTabActiveRef }: { isTabActiveRef: React.RefObject<boolean> }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isTabActiveRef.current) {
        setSeconds((prev) => prev + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isTabActiveRef]);

  return (
    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 text-xs font-semibold text-orange-400 border border-slate-700">
      <Clock className="w-3.5 h-3.5" />
      <span>{formatMinutes(Math.round(seconds / 60))} aktif</span>
    </div>
  );
}

function ReaderContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [book, setBook] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(24);
  const [zoom, setZoom] = useState<number>(100);
  const [showCelebration, setShowCelebration] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);

  const isTabActiveRef = useRef(true);

  // Load book details
  useEffect(() => {
    async function fetchBook() {
      try {
        const res = await fetch(`/api/books/${id}`);
        if (res.ok) {
          const b = await res.json();
          setBook(b);
          setTotalPages(b.totalPages || 24);

          const qPage = searchParams.get("page");
          if (qPage) {
            setCurrentPage(parseInt(qPage));
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [id, searchParams]);

  // Page visibility tracker (only count active reading time)
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabActiveRef.current = document.visibilityState === "visible";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Heartbeat progress recorder every 30 seconds
  useEffect(() => {
    const sendHeartbeat = async () => {
      if (!isTabActiveRef.current || !book) return;

      try {
        const res = await fetch("/api/reading-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId: id,
            currentPage: currentPage,
            durationSeconds: 30,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.newlyCompleted && !isCompleted) {
            setIsCompleted(true);
            setPointsEarned(data.pointsAwarded || 20);
            setShowCelebration(true);
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        }
      } catch (err) {
        console.error("Heartbeat error:", err);
      }
    };

    const heartbeatTimer = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(heartbeatTimer);
  }, [id, currentPage, book, isCompleted]);

  // Handle page turn & sync with stable reference
  const handlePageChange = useCallback(
    async (newPage: number) => {
      if (newPage < 1) return;
      setCurrentPage(newPage);

      try {
        const res = await fetch("/api/reading-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId: id,
            currentPage: newPage,
            durationSeconds: 5,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.newlyCompleted && !isCompleted) {
            setIsCompleted(true);
            setPointsEarned(data.pointsAwarded || 20);
            setShowCelebration(true);
            confetti({
              particleCount: 120,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    },
    [id, isCompleted]
  );

  const handleTotalPagesLoaded = useCallback((loadedTotal: number) => {
    setTotalPages(loadedTotal);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white font-bold">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-2" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        Buku tidak ditemukan.
      </div>
    );
  }

  const pdfSource = book.pdfUrl || "";

  return (
    <div className="h-screen max-h-screen overflow-hidden bg-slate-950 flex flex-col select-none">
      {/* Top Reader Navbar */}
      <header className="h-14 shrink-0 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between text-white z-20">
        <div className="flex items-center gap-3">
          <Link
            href={`/katalog/${book.id}`}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="truncate max-w-[180px] sm:max-w-md">
            <h2 className="text-xs sm:text-sm font-bold truncate">{book.title}</h2>
            <p className="text-[10px] text-slate-400 truncate">{book.author}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Active Timer (Isolated state prevents re-renders of the canvas reader) */}
          <ActiveTimer isTabActiveRef={isTabActiveRef} />

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(60, z - 15))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-200"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold px-1.5">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(160, z + 15))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-200"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 transition-colors hidden sm:block"
            title="Layar Penuh"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Page-by-Page Canvas View (Fit to screen: scroll only active when zoom > 100) */}
      <main
        className={`flex-1 relative flex items-center justify-center p-2 sm:p-4 bg-slate-950 ${
          zoom > 100 ? "overflow-auto cursor-grab active:cursor-grabbing" : "overflow-hidden"
        }`}
      >
        {pdfSource ? (
          <PdfCanvasReader
            pdfUrl={pdfSource}
            currentPage={currentPage}
            zoom={zoom}
            onPageChange={handlePageChange}
            onTotalPagesLoaded={handleTotalPagesLoaded}
          />
        ) : (
          <div className="text-white text-center font-bold">Berkas PDF sedang disiapkan.</div>
        )}
      </main>

      {/* Bottom Floating Navigation Bar */}
      <footer className="h-16 shrink-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-4 sm:px-6 flex items-center justify-between text-white z-20">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-30 disabled:pointer-events-none font-bold text-xs transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Sebelumnya</span>
        </button>

        {/* Page Selector */}
        <div className="flex items-center gap-2 text-xs font-bold bg-slate-800/80 px-4 py-1.5 rounded-xl border border-slate-700">
          <span className="text-slate-400">Halaman</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={currentPage}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val)) handlePageChange(val);
            }}
            className="w-12 py-1 px-1.5 text-center rounded-lg bg-slate-950 border border-slate-700 text-white font-black focus:outline-none focus:border-orange-500"
          />
          <span className="text-slate-400">dari {totalPages}</span>
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-30 disabled:pointer-events-none font-extrabold text-xs text-white shadow-md transition-all"
        >
          <span>Selanjutnya</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>

      {/* Book Completion Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl border-4 border-amber-300">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-4xl shadow-inner animate-bounce">
              ⭐
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-800">
                Hebat! Buku Selesai Dibaca! 🎉
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                Kamu telah membaca minimal 90% halaman buku &quot;{book.title}&quot;.
              </p>
            </div>
            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 font-extrabold text-sm flex items-center justify-center gap-1.5">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
              +{pointsEarned} Bintang Literasi Baru!
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Link
                href={`/jurnal?bookId=${book.id}&bookTitle=${encodeURIComponent(book.title)}`}
                className="w-full py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs shadow-md flex items-center justify-center gap-2"
              >
                <PenTool className="w-4 h-4" />
                Catat di Jurnal Membaca (+5 Poin)
              </Link>
              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Lanjut Membaca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReaderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ReaderContent id={resolvedParams.id} />
    </Suspense>
  );
}
