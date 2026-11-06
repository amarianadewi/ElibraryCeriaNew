"use client";

import React, { memo, useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface PdfCanvasReaderProps {
  pdfUrl: string;
  currentPage: number;
  zoom: number;
  onPageChange: (newPage: number) => void;
  onTotalPagesLoaded: (totalPages: number) => void;
}

interface CachedPage {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  zoom: number;
}

function PdfCanvasReaderComponent({
  pdfUrl,
  currentPage,
  zoom,
  onPageChange,
  onTotalPagesLoaded,
}: PdfCanvasReaderProps) {
  // Dual Canvas Double Buffering: Slot A and Slot B
  // Swapping between rendered canvases ensures 100% zero-flicker transitions
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);
  const [activeCanvasSlot, setActiveCanvasSlot] = useState<"A" | "B">("A");

  // Track container dimensions to avoid layout jumps
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: 600,
    height: 800,
  });

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resizeVersion, setResizeVersion] = useState(0);

  // Stable callbacks in refs so they NEVER trigger re-fetching or reloading
  const onTotalPagesLoadedRef = useRef(onTotalPagesLoaded);
  const onPageChangeRef = useRef(onPageChange);

  // Track loaded PDF URL so we NEVER reload the same document repeatedly
  const loadedPdfUrlRef = useRef<string>("");
  const pdfDocRef = useRef<any>(null);

  // In-memory cache of pre-rendered offscreen canvases
  const pageCacheRef = useRef<Map<number, CachedPage>>(new Map());
  const activeRenderTasksRef = useRef<Map<number, any>>(new Map());
  const activeCanvasSlotRef = useRef<"A" | "B">("A");

  useEffect(() => {
    onTotalPagesLoadedRef.current = onTotalPagesLoaded;
    onPageChangeRef.current = onPageChange;
    activeCanvasSlotRef.current = activeCanvasSlot;
  });

  // 1. Load PDF Document (ONLY runs once per pdfUrl, never re-triggered on parent re-renders!)
  useEffect(() => {
    if (!pdfUrl) return;

    // Guard: If this document is already loaded, NEVER reload or show "Membuka Buku Digital..."
    if (loadedPdfUrlRef.current === pdfUrl && pdfDocRef.current) {
      return;
    }

    let isCancelled = false;
    loadedPdfUrlRef.current = pdfUrl;
    setInitialLoading(true);
    setError(null);
    pageCacheRef.current.clear();

    async function loadPdf() {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const loadingTask = pdfjsLib.getDocument({
          url: pdfUrl,
          cMapUrl: "https://unpkg.com/pdfjs-dist@4.10.38/cmaps/",
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!isCancelled) {
          pdfDocRef.current = doc;
          setPdfDoc(doc);
          onTotalPagesLoadedRef.current(doc.numPages);
          setInitialLoading(false);
        }
      } catch (err: any) {
        if (!isCancelled) {
          console.error("PDF load error:", err);
          setError("Gagal memuat berkas buku digital. Silakan coba muat ulang.");
          setInitialLoading(false);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
    };
  }, [pdfUrl]);

  // 2. Render Page to Offscreen Canvas (Fitted proportionally to BOTH available width and height)
  const renderPageToOffscreen = useCallback(
    async (doc: any, pageNum: number, currentZoom: number): Promise<CachedPage | null> => {
      try {
        // Cancel any active render on this specific page to prevent worker conflicts
        const existingTask = activeRenderTasksRef.current.get(pageNum);
        if (existingTask) {
          try {
            existingTask.cancel();
          } catch (_) {}
          activeRenderTasksRef.current.delete(pageNum);
        }

        const page = await doc.getPage(pageNum);
        const baseViewport = page.getViewport({ scale: 1 });

        // Calculate available viewport dimensions (accounting for header 56px, footer 64px, and padding)
        const availableWidth = Math.max(window.innerWidth - 32, 280);
        const availableHeight = Math.max(window.innerHeight - 140, 260);

        // Fit page proportionally to BOTH width and height so it fits 100% inside the screen without scrolling
        const scaleX = availableWidth / baseViewport.width;
        const scaleY = availableHeight / baseViewport.height;
        const baseFitScale = Math.min(scaleX, scaleY);
        const finalScale = baseFitScale * (currentZoom / 100);

        const viewport = page.getViewport({ scale: finalScale });

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const offscreen = document.createElement("canvas");
        offscreen.width = Math.floor(viewport.width * dpr);
        offscreen.height = Math.floor(viewport.height * dpr);

        const ctx = offscreen.getContext("2d", { alpha: false });
        if (!ctx) return null;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        activeRenderTasksRef.current.set(pageNum, renderTask);
        await renderTask.promise;
        activeRenderTasksRef.current.delete(pageNum);

        return {
          canvas: offscreen,
          width: Math.floor(viewport.width),
          height: Math.floor(viewport.height),
          zoom: currentZoom,
        };
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error(`Error rendering page ${pageNum}:`, err);
        }
        return null;
      }
    },
    []
  );

  // 3. Double-Buffer Seamless Swap (0 ms blank frame, zero flicker!)
  const swapToPage = useCallback(
    (cached: CachedPage) => {
      const currentActive = activeCanvasSlotRef.current;
      // Draw onto the inactive buffer canvas while it is completely hidden
      const bufferCanvas = currentActive === "A" ? canvasBRef.current : canvasARef.current;
      if (!bufferCanvas) return;

      bufferCanvas.width = cached.canvas.width;
      bufferCanvas.height = cached.canvas.height;
      bufferCanvas.style.width = `${cached.width}px`;
      bufferCanvas.style.height = `${cached.height}px`;

      const ctx = bufferCanvas.getContext("2d", { alpha: false });
      if (ctx) {
        ctx.drawImage(cached.canvas, 0, 0);
      }

      setContainerDimensions({
        width: cached.width,
        height: cached.height,
      });

      // Atomically swap visibility in next animation frame
      requestAnimationFrame(() => {
        setActiveCanvasSlot(currentActive === "A" ? "B" : "A");
      });
    },
    []
  );

  // 4. Background Pre-loader: Pre-renders upcoming and previous pages silently
  const triggerBackgroundPrefetch = useCallback(
    (doc: any, current: number, currentZoom: number) => {
      if (!doc) return;

      const pagesToPrefetch: number[] = [];
      if (current + 1 <= doc.numPages) pagesToPrefetch.push(current + 1);
      if (current + 2 <= doc.numPages) pagesToPrefetch.push(current + 2);
      if (current - 1 >= 1) pagesToPrefetch.push(current - 1);

      // Prune distant pages to keep memory lean
      for (const cachedPageNum of pageCacheRef.current.keys()) {
        if (Math.abs(cachedPageNum - current) > 3) {
          pageCacheRef.current.delete(cachedPageNum);
        }
      }

      const prefetchNext = async () => {
        for (const pNum of pagesToPrefetch) {
          const existing = pageCacheRef.current.get(pNum);
          if (!existing || existing.zoom !== currentZoom) {
            const cached = await renderPageToOffscreen(doc, pNum, currentZoom);
            if (cached) {
              pageCacheRef.current.set(pNum, cached);
            }
          }
        }
      };

      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(prefetchNext);
      } else {
        setTimeout(prefetchNext, 30);
      }
    },
    [renderPageToOffscreen]
  );

  // 5. Main Page Controller
  useEffect(() => {
    if (!pdfDoc || !currentPage) return;

    let isCancelled = false;

    async function displayCurrentPage() {
      const cached = pageCacheRef.current.get(currentPage);

      // Instant Swap if page is already cached in memory
      if (cached && cached.zoom === zoom) {
        swapToPage(cached);
        triggerBackgroundPrefetch(pdfDoc, currentPage, zoom);
        return;
      }

      // If not yet cached, render offscreen while current visible canvas stays 100% visible
      const freshlyRendered = await renderPageToOffscreen(pdfDoc, currentPage, zoom);
      if (!isCancelled && freshlyRendered) {
        pageCacheRef.current.set(currentPage, freshlyRendered);
        swapToPage(freshlyRendered);
        triggerBackgroundPrefetch(pdfDoc, currentPage, zoom);
      }
    }

    displayCurrentPage();

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage, zoom, resizeVersion, swapToPage, renderPageToOffscreen, triggerBackgroundPrefetch]);

  // Invalidate cache and re-render if zoom changes or window resizes
  useEffect(() => {
    pageCacheRef.current.clear();
  }, [zoom]);

  useEffect(() => {
    let timeout: any;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        pageCacheRef.current.clear();
        setResizeVersion((v) => v + 1);
      }, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeout);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!pdfDoc) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        if (currentPage < pdfDoc.numPages) {
          onPageChangeRef.current(currentPage + 1);
        }
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        if (currentPage > 1) {
          onPageChangeRef.current(currentPage - 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pdfDoc, currentPage]);

  if (error) {
    return (
      <div className="card-ceria p-8 max-w-md mx-auto text-center bg-white space-y-3">
        <p className="text-sm font-bold text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-orange-500 text-white font-bold text-xs"
        >
          Muat Ulang Halaman
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full max-h-full my-auto flex-1">
      {/* Initial Loading (Only once when the file is first downloaded) */}
      {initialLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-xs rounded-2xl">
          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mb-2" />
          <span className="text-xs font-bold text-white bg-slate-800 px-3 py-1 rounded-full shadow-md">
            Membuka Buku Digital...
          </span>
        </div>
      )}

      {/* Main Double-Buffered Canvas Container */}
      <div
        className="relative shadow-2xl rounded-2xl overflow-hidden bg-white ring-4 ring-slate-800/40 select-none"
        style={{
          width: containerDimensions.width,
          height: containerDimensions.height,
        }}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Canvas Slot A */}
        <canvas
          ref={canvasARef}
          className={`absolute inset-0 block transition-opacity duration-100 ease-out ${
            activeCanvasSlot === "A" ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
          }`}
        />

        {/* Canvas Slot B */}
        <canvas
          ref={canvasBRef}
          className={`absolute inset-0 block transition-opacity duration-100 ease-out ${
            activeCanvasSlot === "B" ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
          }`}
        />

        {/* Clickable Page-Turn Zones */}
        {pdfDoc && (
          <div className="absolute inset-0 z-20 pointer-events-auto">
            {/* Left zone: Prev */}
            {currentPage > 1 && (
              <button
                type="button"
                onClick={() => onPageChangeRef.current(currentPage - 1)}
                className="absolute left-0 top-0 bottom-0 w-1/4 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-r from-black/25 to-transparent flex items-center justify-start pl-3 cursor-pointer group"
                title="Halaman Sebelumnya (Klik atau Tekan Panah Kiri)"
              >
                <div className="p-2.5 rounded-full bg-white/90 shadow-lg text-slate-800 group-hover:scale-110 transition-transform">
                  <ChevronLeft className="w-6 h-6" />
                </div>
              </button>
            )}

            {/* Right zone: Next */}
            {currentPage < pdfDoc.numPages && (
              <button
                type="button"
                onClick={() => onPageChangeRef.current(currentPage + 1)}
                className="absolute right-0 top-0 bottom-0 w-1/4 opacity-0 hover:opacity-100 transition-opacity bg-gradient-to-l from-black/25 to-transparent flex items-center justify-end pr-3 cursor-pointer group"
                title="Halaman Selanjutnya (Klik atau Tekan Panah Kanan)"
              >
                <div className="p-2.5 rounded-full bg-white/90 shadow-lg text-slate-800 group-hover:scale-110 transition-transform">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const PdfCanvasReader = memo(PdfCanvasReaderComponent);
export default PdfCanvasReader;
