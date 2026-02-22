import React, { useState, useEffect } from 'react';
import { MessageSquare, CheckCircle, XCircle, Clock, AlertCircle, Search, Filter, ChevronDown, ChevronUp, BarChart3, PieChart, Trash2 } from 'lucide-react';
import { api } from '../../services/mockData';
import { Aspiration } from '../../types';
import { useAuth } from '../../App';

const AspirationDashboard: React.FC = () => {
  const { user } = useAuth();
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [filterStatus, setFilterStatus] = useState<Aspiration['status'] | 'All'>('All');
  const [filterCategory, setFilterCategory] = useState<Aspiration['category'] | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAspirations();
  }, []);

  const loadAspirations = async () => {
    const data = await api.getAspirations();
    setAspirations(data);
  };

  const handleStatusUpdate = async (id: string, newStatus: Aspiration['status']) => {
    setLoading(true);
    await api.updateAspirationStatus(id, newStatus, feedback);
    setFeedback('');
    setExpandedId(null);
    await loadAspirations();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus aspirasi ini?')) {
        try {
            setLoading(true);
            const success = await api.deleteAspiration(id);
            if (success) {
                setExpandedId(null);
                await loadAspirations();
                // alert("Aspirasi berhasil dihapus."); // Optional: Feedback
            } else {
                alert("Gagal menghapus: Data tidak ditemukan.");
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Terjadi kesalahan saat menghapus.");
        } finally {
            setLoading(false);
        }
    }
  };

  const filteredAspirations = aspirations.filter(asp => {
    const matchesStatus = filterStatus === 'All' || asp.status === filterStatus;
    const matchesCategory = filterCategory === 'All' || asp.category === filterCategory;
    const matchesSearch = asp.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asp.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asp.userName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: Aspiration['status']) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Reviewed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Stats
  const totalAspirations = aspirations.length;
  const pendingCount = aspirations.filter(a => a.status === 'Pending').length;
  const resolvedCount = aspirations.filter(a => a.status === 'Resolved').length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Dashboard Aspirasi
        </h1>
        <p className="text-slate-500 font-medium">Pantau dan tindak lanjuti aspirasi siswa.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full mb-2">
                <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900">{totalAspirations}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-full mb-2">
                <Clock className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900">{pendingCount}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full mb-2">
                <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-900">{resolvedCount}</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Selesai</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6 space-y-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari aspirasi..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none text-sm font-medium transition-all"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 w-full flex-nowrap">
            {['All', 'Pending', 'Reviewed', 'Resolved', 'Rejected'].map((status) => (
                <button
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        filterStatus === status 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                >
                    {status === 'All' ? 'Semua Status' : status}
                </button>
            ))}
        </div>
         <div className="flex gap-2 overflow-x-auto pb-2 w-full flex-nowrap">
            {['All', 'Fasilitas', 'KBM', 'Eskul', 'Lainnya'].map((cat) => (
                <button
                    key={cat}
                    onClick={() => setFilterCategory(cat as any)}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        filterCategory === cat 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                    }`}
                >
                    {cat === 'All' ? 'Semua Kategori' : cat}
                </button>
            ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredAspirations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-900 font-bold">Tidak ada aspirasi ditemukan</p>
            <p className="text-slate-500 text-sm">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          filteredAspirations.map((asp) => (
            <div key={asp.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
              <div 
                className="p-5 cursor-pointer"
                onClick={() => setExpandedId(expandedId === asp.id ? null : asp.id)}
              >
                <div className="flex justify-between items-start mb-3">
                    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        asp.category === 'Fasilitas' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        asp.category === 'KBM' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        asp.category === 'Eskul' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-orange-50 text-orange-600 border-orange-100'
                    }`}>
                        {asp.category}
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusColor(asp.status)}`}>
                      {asp.status}
                    </span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-2 leading-snug">{asp.title}</h3>
                
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                    <span className="font-semibold text-slate-600">
                      {asp.isAnonymous ? 'Anonim' : asp.userName}
                    </span>
                    <span>•</span>
                    <span>{asp.date}</span>
                </div>
                
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{asp.content}</p>

                <div className="mt-4 flex items-center justify-center pt-2 border-t border-slate-50">
                  {expandedId === asp.id ? <ChevronUp className="w-5 h-5 text-slate-300" /> : <ChevronDown className="w-5 h-5 text-slate-300" />}
                </div>
              </div>

              {/* Expanded Content */}
              {expandedId === asp.id && (
                <div className="px-5 pb-6 pt-0 bg-slate-50/50 border-t border-slate-100">
                  <div className="mt-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Detail Lengkap</h4>
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {asp.content}
                    </p>
                  </div>

                  {asp.feedback && (
                    <div className="mt-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Tanggapan OSIS</h4>
                      <p className="text-sm text-indigo-900 italic">
                        "{asp.feedback}"
                      </p>
                    </div>
                  )}

                  <div className="mt-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Update Status & Tanggapan</label>
                    <textarea 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Tulis tanggapan untuk siswa..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none text-sm font-medium resize-none h-24 bg-white mb-4"
                    />
                    
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(asp.id, 'Reviewed')}
                        disabled={loading}
                        className="py-3 px-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Tinjau
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(asp.id, 'Resolved')}
                        disabled={loading}
                        className="py-3 px-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Selesai
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(asp.id, 'Rejected')}
                        disabled={loading}
                        className="py-3 px-2 bg-rose-100 text-rose-700 hover:bg-rose-200 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        Tolak
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <button
                            onClick={() => handleDelete(asp.id)}
                            disabled={loading}
                            className="w-full py-3 flex items-center justify-center gap-2 text-rose-500 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            <Trash2 className="w-4 h-4" /> Hapus Aspirasi
                        </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AspirationDashboard;
