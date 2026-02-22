import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CATEGORIES, Category } from "../lib/utils";
import { storage } from "../lib/storage";
import { toast } from "sonner";
import { Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function SubmitAspiration() {
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | "">("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !content.trim()) {
      toast.error("Mohon lengkapi semua kolom.");
      return;
    }

    setIsSubmitting(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    try {
      storage.addAspiration(category, content);
      setIsSuccess(true);
      toast.success("Aspirasi berhasil dikirim!");
      setContent("");
      setCategory("");
    } catch (error) {
      toast.error("Gagal mengirim aspirasi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle2 size={40} />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Terima Kasih!</h2>
        <p className="text-slate-600 mb-8">
          Aspirasi kamu telah kami terima dan akan segera ditinjau oleh tim OSIS.
          Pantau terus perkembangan sekolah kita.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="px-6 py-2 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors"
        >
          Kirim Aspirasi Lain
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Kirim Aspirasi</h1>
        <p className="text-slate-600">
          Silakan sampaikan pendapatmu. Identitasmu akan tetap rahasia.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="category" className="block text-sm font-medium text-slate-700">
              Kategori
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
              required
            >
              <option value="" disabled>Pilih kategori aspirasi...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-slate-700">
              Isi Pesan
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan aspirasimu di sini dengan bahasa yang sopan..."
              className="w-full h-40 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none resize-none"
              required
            />
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <AlertCircle size={12} />
              Kata-kata kasar akan otomatis disensor oleh sistem.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Mengirim...</span>
            ) : (
              <>
                <Send size={18} />
                Kirim Aspirasi
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800 flex gap-3">
        <AlertCircle className="shrink-0 mt-0.5" size={18} />
        <p>
          <strong>Ingat:</strong> Gunakan fitur ini dengan bijak. Laporan palsu atau fitnah dapat merugikan pihak lain dan tidak mencerminkan sikap siswa yang baik.
        </p>
      </div>
    </div>
  );
}
