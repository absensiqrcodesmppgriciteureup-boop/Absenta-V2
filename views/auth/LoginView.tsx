import React, { useState } from 'react';
import { School, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { api } from '../../services/mockData';
import { useAuth } from '../../App';

const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [nis, setNis] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const user = await api.login(nis);
      if (user) {
        login(user);
      } else {
        setError('NIS/ID tidak ditemukan. Cek kembali nomor Anda.');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

      {/* Left Panel - Hero */}
      <div className="hidden lg:flex lg:w-5/12 relative bg-primary-600 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-indigo-900 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" 
          alt="School" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
        />
        <div className="relative z-20 text-white max-w-lg">
          <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
            <School className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black mb-6 leading-tight tracking-tight">
            SMP PGRI <br/><span className="text-primary-200">Citeureup</span>
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed font-medium max-w-sm">
            Platform absensi digital terintegrasi untuk siswa dan guru. Mudah, Cepat, dan Akurat.
          </p>
          
          <div className="mt-12 flex items-center gap-4 text-sm font-bold text-indigo-200">
             <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-400 border-2 border-primary-600"></div>
                <div className="w-10 h-10 rounded-full bg-indigo-300 border-2 border-primary-600"></div>
                <div className="w-10 h-10 rounded-full bg-indigo-200 border-2 border-primary-600 flex items-center justify-center text-primary-800 text-xs">+1k</div>
             </div>
             <p>Siswa Terdaftar</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-6 lg:p-24 relative z-10">
        <div className="w-full max-w-[420px] animate-in slide-in-from-bottom-8 duration-700">
          <div className="mb-10">
             <div className="lg:hidden inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-600 text-white mb-6 shadow-xl shadow-primary-200">
                <School className="w-8 h-8" />
             </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Selamat Datang 👋</h2>
            <p className="text-slate-500 text-lg">Masuk untuk melihat jadwal & absen.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="nis" className="text-sm font-bold text-slate-700 ml-1">NISN / NIP</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-600 transition-colors">
                    <KeyRound className="w-5 h-5" />
                </div>
                <input
                  id="nis"
                  type="text"
                  value={nis}
                  onChange={(e) => setNis(e.target.value)}
                  placeholder="Masukkan Nomor Induk..."
                  className="w-full pl-14 pr-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all text-slate-900 font-bold placeholder:text-slate-300 shadow-sm group-hover:border-slate-300"
                  required
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 text-rose-600 text-sm font-bold border border-rose-100 flex items-center gap-3 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-rose-500" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-primary-200 hover:shadow-2xl hover:shadow-primary-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group transform active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Masuk Sekarang
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-slate-400 font-medium">
             &copy; {new Date().getFullYear()} SMP PGRI Citeureup. <br/>Absenta Next System v2.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;