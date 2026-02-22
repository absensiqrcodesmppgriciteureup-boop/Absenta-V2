import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { motion } from "framer-motion";
import { LogOut, LayoutDashboard, Send, ShieldCheck, School } from "lucide-react";
import { Toaster } from "sonner";

export default function Layout() {
  const { role, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-800 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <School size={20} />
            </div>
            <span>Suara<span className="text-indigo-600">Siswa</span></span>
          </Link>

          <nav className="flex items-center gap-4">
            {role === "guest" ? (
              <>
                <Link
                  to="/submit"
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    location.pathname === "/submit"
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Send size={16} />
                  <span className="hidden sm:inline">Kirim Aspirasi</span>
                </Link>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Masuk (OSIS)
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    location.pathname === "/dashboard"
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <LayoutDashboard size={16} />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <div className="h-6 w-px bg-slate-200 mx-2" />
                <div className="flex items-center gap-2 mr-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="hidden sm:block text-xs text-right">
                    <p className="font-semibold text-slate-900 capitalize">{role}</p>
                    <p className="text-slate-500">Logged in</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Keluar"
                >
                  <LogOut size={18} />
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} OSIS SMA Negeri 1 Harapan Bangsa.</p>
          <p className="mt-1">Dibuat untuk menyalurkan aspirasi siswa secara aman dan bertanggung jawab.</p>
        </div>
      </footer>
      <Toaster position="top-center" />
    </div>
  );
}
