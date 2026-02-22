import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, User, Lock, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../App';
import { api } from '../../services/mockData';
import { Aspiration } from '../../types';

const AspirationView: React.FC = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Aspiration['category']>('Fasilitas');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [myAspirations, setMyAspirations] = useState<Aspiration[]>([]);

  useEffect(() => {
    loadMyAspirations();
  }, [user]);

  const loadMyAspirations = async () => {
    if (!user) return;
    const all = await api.getAspirations();
    // Filter aspirations made by this user
    const mine = all.filter(a => a.userId === user.uid);
    setMyAspirations(mine);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await api.submitAspiration({
        userId: user.uid,
        userName: user.name,
        userClass: user.class || '',
        title,
        content,
        category,
        isAnonymous,
      });
      setSuccess(true);
      setTitle('');
      setContent('');
      setCategory('Fasilitas');
      setIsAnonymous(false);
      loadMyAspirations();
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to submit aspiration", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Aspiration['status']) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Reviewed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: Aspiration['status']) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'Reviewed': return <CheckCircle className="w-4 h-4" />;
      case 'Resolved': return <CheckCircle className="w-4 h-4" />;
      case 'Rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Aspirasi Digital</h1>
        <p className="text-slate-500 font-medium">Sampaikan keluh kesah dan saranmu untuk sekolah yang lebih baik.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              Buat Aspirasi Baru
            </h2>
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Aspirasi berhasil dikirim! OSIS akan segera meninjaunya.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Judul Aspirasi</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Contoh: AC di Lab Komputer Rusak"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kategori</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(['Fasilitas', 'KBM', 'Eskul', 'Lainnya'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                        category === cat 
                          ? 'bg-primary-50 border-primary-200 text-primary-700 ring-2 ring-primary-500/20' 
                          : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Isi Pesan</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={5}
                  placeholder="Jelaskan detail aspirasimu di sini..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none font-medium resize-none"
                />
              </div>

              <div className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer" onClick={() => setIsAnonymous(!isAnonymous)}>
                <div className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${isAnonymous ? 'bg-primary-600' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${isAnonymous ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {isAnonymous ? <Lock className="w-4 h-4 text-primary-600" /> : <User className="w-4 h-4 text-slate-400" />}
                    Kirim sebagai Anonim
                  </p>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {isAnonymous ? 'Identitasmu akan disembunyikan dari OSIS.' : 'Nama dan kelasmu akan terlihat.'}
                  </p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold shadow-lg shadow-primary-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="animate-pulse">Mengirim...</span>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Kirim Aspirasi
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* History Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Riwayat Aspirasi
          </h2>

          <div className="space-y-4">
            {myAspirations.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="text-slate-400 font-medium text-sm">Belum ada aspirasi yang dikirim.</p>
              </div>
            ) : (
              myAspirations.map((asp) => (
                <div key={asp.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${getStatusColor(asp.status)}`}>
                      {getStatusIcon(asp.status)}
                      {asp.status}
                    </span>
                    <span className="text-xs font-medium text-slate-400">{asp.date}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{asp.title}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">{asp.content}</p>
                  
                  {asp.feedback && (
                    <div className="mt-3 pt-3 border-t border-slate-50">
                      <p className="text-xs font-bold text-slate-700 mb-1">Tanggapan:</p>
                      <p className="text-xs text-slate-600 italic">"{asp.feedback}"</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AspirationView;
