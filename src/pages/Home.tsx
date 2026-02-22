import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageSquarePlus, ShieldCheck, Users, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-20">
      <div className="text-center max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium border border-indigo-100"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Portal Aspirasi Digital Resmi
        </motion.div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900">
          Suara Kamu,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Perubahan Kita.
          </span>
        </h1>

        <p className="text-lg text-slate-600 leading-relaxed">
          Sampaikan kritik, saran, dan aspirasi untuk kemajuan sekolah kita.
          Identitasmu aman, suaramu didengar. Mari bangun lingkungan sekolah yang lebih baik bersama-sama.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/submit"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 flex items-center justify-center gap-2 group"
          >
            <MessageSquarePlus size={20} />
            Kirim Aspirasi Sekarang
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck size={20} />
            Login Pengurus
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 w-full">
        <FeatureCard
          icon={<ShieldCheck className="text-emerald-600" size={32} />}
          title="100% Anonim"
          description="Identitas pengirim tidak direkam. Kamu bebas berekspresi tanpa rasa takut, selama sopan dan bertanggung jawab."
        />
        <FeatureCard
          icon={<Users className="text-blue-600" size={32} />}
          title="Dikelola OSIS"
          description="Aspirasi akan dibaca langsung oleh pengurus OSIS dan diteruskan ke pihak sekolah jika relevan."
        />
        <FeatureCard
          icon={<MessageSquarePlus className="text-purple-600" size={32} />}
          title="Transparan"
          description="Pantau status aspirasimu. Apakah sudah diterima, diproses, atau diajukan ke kepala sekolah."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
