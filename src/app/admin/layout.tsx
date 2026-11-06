"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileSpreadsheet,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/siswa", label: "Manajemen Siswa", icon: Users },
    { href: "/admin/buku", label: "Katalog & Klasifikasi", icon: BookOpen },
    { href: "/admin/laporan", label: "Laporan & Ekspor", icon: FileSpreadsheet },
  ];

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari akun admin?")) {
      await signOut(auth);
      router.push("/login");
    }
  };

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname.startsWith("/admin/siswa")) return "Manajemen Siswa";
    if (pathname.startsWith("/admin/buku")) return "Katalog Buku";
    if (pathname.startsWith("/admin/laporan")) return "Laporan & Ekspor";
    return "Admin";
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* ============================================================== */}
      {/* 1. DESKTOP SIDEBAR (Sticky, Fixed Height, Never Stretches)     */}
      {/* ============================================================== */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col shrink-0 border-r border-slate-800 sticky top-0 h-screen z-20">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3 shrink-0">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-orange-500/50 shrink-0">
            <Image src="/logo.png" alt="Logo" fill className="object-cover" priority />
          </div>
          <div className="truncate">
            <h2 className="font-black text-sm text-white tracking-tight flex items-center gap-1">
              E-Library <span className="text-orange-500">Admin</span>
            </h2>
            <p className="text-[10px] font-semibold text-slate-400 truncate">SDN Kaliwungu 05</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions (Always pinned at the bottom of the viewport) */}
        <div className="p-3 border-t border-slate-800 space-y-1.5 shrink-0 bg-slate-900/95">
          <Link
            href="/dashboard"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span>Lihat Portal Siswa</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-100 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Keluar Akun Admin</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. MOBILE DRAWER OVERLAY & SLIDING SIDEBAR                     */}
      {/* ============================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Menu */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-slate-900 text-white flex flex-col z-50 shadow-2xl border-r border-slate-800">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden ring-2 ring-orange-500/50">
                  <Image src="/logo.png" alt="Logo" fill className="object-cover" />
                </div>
                <div>
                  <h2 className="font-black text-xs text-white">E-Library Admin</h2>
                  <p className="text-[10px] text-slate-400">SDN Kaliwungu 05</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-slate-800 space-y-1.5">
              <Link
                href="/dashboard"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <span>Lihat Portal Siswa</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-300 bg-rose-500/20 border border-rose-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Akun Admin</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MAIN CONTENT AREA                                           */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-xs">
          {/* Left: Mobile hamburger & breadcrumbs */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Buka menu navigasi"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-1.5 text-xs truncate">
              <span className="hidden sm:inline font-bold text-slate-400">Admin</span>
              <span className="hidden sm:inline text-slate-300">/</span>
              <span className="font-extrabold text-slate-900 truncate">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Right: Status badge & Instant Logout Button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="hidden xs:flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Super Admin Aktif</span>
              <span className="sm:hidden">Admin</span>
            </div>

            {/* Instant Logout Button in Top Header */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 font-extrabold text-xs transition-all border border-rose-200/80 shadow-xs cursor-pointer"
              title="Keluar dari akun admin"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
