import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api, MOCK_USERS } from '../../services/mockData';
import { Users, UserX, UserCheck, Clock, BellRing, Check, X, Eye, Download, TrendingUp, Award, Database, Loader2 } from 'lucide-react';
import { AttendanceRecord, TeacherNotification } from '../../types';

const DashboardView: React.FC = () => {
  const [notifications, setNotifications] = useState<TeacherNotification[]>([]);
  const [pendingRecords, setPendingRecords] = useState<AttendanceRecord[]>([]);
  const [todaysRecords, setTodaysRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [locking, setLocking] = useState(false); // State for lock button
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const loadData = async () => {
      const notifs = await api.getNotifications();
      const allRecords = await api.getAttendance();
      
      // Filter records for TODAY (Real-time Local)
      const todayStr = new Date().toLocaleDateString('en-CA');
      const todayData = allRecords.filter(r => r.date === todayStr);

      setNotifications(notifs);
      setTodaysRecords(todayData);
      setPendingRecords(allRecords.filter(r => r.status === 'Pending'));
  };

  useEffect(() => {
      loadData();
      const interval = setInterval(loadData, 3000); // Faster polling for real-time feel
      return () => clearInterval(interval);
  }, []);

  const handleVerify = async (id: string, status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa') => {
      setLoading(true);
      await api.verifyPermit(id, status);
      await loadData();
      setLoading(false);
  };

  const handleExport = () => {
      const todayStr = new Date().toLocaleDateString('en-CA');
      const headers = "Nama,Kelas,Status,Waktu,Keterangan\n";
      const rows = todaysRecords.map(r => `${r.userName},${r.userClass},${r.status},${r.time},${r.details || '-'}`).join("\n");
      const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Absensi_${todayStr}.csv`);
      document.body.appendChild(link);
      link.click();
  };

  const handleLockData = async () => {
      if (!window.confirm("Simpan Semua Data ke Database?\n\nTindakan ini akan mengamankan data dari Spreadsheet ke sistem lokal.\nJika spreadsheet di-reset (ganti bulan), data di akun siswa akan TETAP ADA.")) {
          return;
      }
      
      setLocking(true);
      try {
          const count = await api.lockAttendanceData();
          alert(`Berhasil mengamankan ${count} data presensi baru!`);
          await loadData(); // Refresh to ensure UI shows stable state
      } catch (e) {
          alert("Gagal menyimpan data. Coba lagi.");
      } finally {
          setLocking(false);
      }
  };

  // REAL CALCULATION (Starts at 0)
  const totalStudents = Object.values(MOCK_USERS).filter(u => u.role === 'student').length;
  const stats = {
    totalStudents: totalStudents,
    present: todaysRecords.filter(r => r.status === 'Hadir').length,
    sick: todaysRecords.filter(r => r.status === 'Sakit').length,
    permit: todaysRecords.filter(r => r.status === 'Izin').length,
    alpha: todaysRecords.filter(r => r.status === 'Alpa').length
  };

  // Get Top XP Students for Leaderboard
  const topStudents = Object.values(MOCK_USERS)
    .filter(u => u.role === 'student')
    .sort((a, b) => (b.xp || 0) - (a.xp || 0))
    .slice(0, 5);

  const chartData = [
    { name: 'Hadir', value: stats.present, color: '#10b981' },
    { name: 'Sakit', value: stats.sick, color: '#3b82f6' },
    { name: 'Izin', value: stats.permit, color: '#f59e0b' },
    { name: 'Alpa', value: stats.alpha, color: '#f43f5e' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Image Modal */}
      {selectedImage && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
              <div className="max-w-3xl w-full max-h-[90vh] overflow-hidden rounded-2xl relative animate-in zoom-in duration-300">
                  <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 p-2 rounded-full text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                  <img src={selectedImage} alt="Bukti" className="w-full h-full object-contain" />
              </div>
          </div>
      )}

      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Absensi</h2>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Data • {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
        </div>
        <div className="flex items-center gap-3">
            {/* SAVE BUTTON */}
            <button 
                onClick={handleLockData} 
                disabled={locking}
                className="flex items-center gap-2 bg-indigo-600 text-white border border-indigo-700 px-5 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {locking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                {locking ? 'Menyimpan...' : 'Simpan Semua Data'}
            </button>
            
            <button onClick={handleExport} className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-3 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all hover:shadow-md active:scale-95">
                <Download className="w-4 h-4" /> Export Data
            </button>
            <div className="hidden md:flex flex-col items-end px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Siswa</span>
                <span className="text-xl font-black text-slate-700">{totalStudents}</span>
            </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
            title="Hadir" 
            value={stats.present} 
            total={totalStudents}
            icon={<UserCheck className="w-6 h-6 text-white" />} 
            gradient="from-emerald-400 to-emerald-600"
            shadow="shadow-emerald-200"
        />
        <StatCard 
            title="Sakit" 
            value={stats.sick} 
            total={totalStudents}
            icon={<Clock className="w-6 h-6 text-white" />} 
            gradient="from-blue-400 to-blue-600"
            shadow="shadow-blue-200"
        />
        <StatCard 
            title="Izin" 
            value={stats.permit} 
            total={totalStudents}
            icon={<Clock className="w-6 h-6 text-white" />} 
            gradient="from-amber-400 to-amber-600"
            shadow="shadow-amber-200"
        />
         <StatCard 
            title="Alpa" 
            value={stats.alpha} 
            total={totalStudents}
            icon={<UserX className="w-6 h-6 text-white" />} 
            gradient="from-rose-400 to-rose-600"
            shadow="shadow-rose-200"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Approvals */}
        <div className="xl:col-span-2 space-y-8">
            {/* Approval Queue */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-white p-2.5 rounded-xl text-primary-600 shadow-sm border border-slate-100 relative">
                            <BellRing className="w-5 h-5" />
                            {pendingRecords.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full"></span>}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Permintaan Izin Masuk</h3>
                            <p className="text-xs text-slate-500 font-medium">Perlu verifikasi wali kelas</p>
                        </div>
                    </div>
                    {pendingRecords.length > 0 && (
                        <span className="bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-xs font-bold animate-pulse">
                            {pendingRecords.length} Menunggu
                        </span>
                    )}
                </div>
                
                <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {pendingRecords.length === 0 ? (
                        <div className="py-16 px-6 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-10 h-10 text-slate-300" />
                            </div>
                            <h4 className="text-slate-900 font-bold">Semua Bersih!</h4>
                            <p className="text-slate-400 text-sm mt-1">Tidak ada pengajuan izin yang menunggu.</p>
                        </div>
                    ) : (
                        pendingRecords.map((record) => {
                            const requestType = record.type || 'Izin';
                            return (
                                <div key={record.id} className="p-6 hover:bg-slate-50/80 transition-colors">
                                    <div className="flex flex-col md:flex-row gap-6">
                                        {/* Photo Preview */}
                                        <div className="w-full md:w-40 h-40 bg-slate-100 rounded-2xl overflow-hidden flex-shrink-0 relative group cursor-pointer border border-slate-200 shadow-sm" onClick={() => record.attachmentUrl && setSelectedImage(record.attachmentUrl)}>
                                            {record.attachmentUrl ? (
                                                <>
                                                    <img src={record.attachmentUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt="Bukti" />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                        <Eye className="text-white w-8 h-8 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300" />
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-2 gap-2">
                                                    <X className="w-8 h-8 opacity-20" />
                                                    <span className="text-xs text-center font-medium">Tidak ada lampiran</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Details */}
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-extrabold text-slate-900 text-xl">{record.userName}</h4>
                                                    <p className="text-sm text-slate-500 font-bold mt-0.5">{record.userClass}</p>
                                                </div>
                                                <span className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm ${requestType === 'Sakit' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {requestType}
                                                </span>
                                            </div>
                                            
                                            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 flex-1 shadow-sm">
                                                <p className="text-sm text-slate-600 leading-relaxed">"{record.details}"</p>
                                                <p className="text-xs text-slate-400 mt-3 font-medium flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> Diajukan pada {record.date}
                                                </p>
                                            </div>
                                            
                                            {/* Actions */}
                                            <div className="flex flex-wrap gap-3 mt-auto">
                                                <button 
                                                    disabled={loading}
                                                    onClick={() => handleVerify(record.id, requestType)}
                                                    className="flex-1 px-4 py-3 bg-primary-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <Check className="w-4 h-4" /> 
                                                    Setujui ({requestType})
                                                </button>
                                                <button 
                                                    disabled={loading}
                                                    onClick={() => handleVerify(record.id, 'Alpa')}
                                                    className="px-6 py-3 bg-white text-rose-600 font-bold text-sm rounded-xl border border-rose-100 hover:bg-rose-50 hover:border-rose-200 transition-all flex items-center justify-center gap-2"
                                                >
                                                    <X className="w-4 h-4" /> Tolak
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            
            {/* Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg shadow-slate-200/50">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-600" />
                    Statistik Hari Ini
                </h3>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 30 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={60} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                            <Bar dataKey="value" barSize={32} radius={[0, 8, 8, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Right Column: Leaderboard & Extra */}
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Top Siswa Rajin (XP)
                </h3>
                <div className="space-y-4">
                    {topStudents.map((student, i) => (
                        <div key={student.uid} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shadow-inner ${
                                i === 0 ? 'bg-amber-100 text-amber-600' : 
                                i === 1 ? 'bg-slate-200 text-slate-600' :
                                i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-50 text-slate-400'
                            }`}>
                                #{i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate group-hover:text-primary-600 transition-colors">{student.name}</p>
                                <p className="text-xs text-slate-400 font-medium">{student.class}</p>
                            </div>
                            <div className="text-right">
                                <span className="block text-sm font-black text-slate-800">{student.xp}</span>
                                <span className="text-[10px] text-slate-400 font-bold">XP</span>
                            </div>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-6 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-colors">
                    Lihat Semua Peringkat
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{title: string, value: number, total: number, icon: React.ReactNode, gradient: string, shadow: string}> = ({ title, value, total, icon, gradient, shadow }) => (
    <div className={`p-6 rounded-3xl bg-gradient-to-br ${gradient} ${shadow} shadow-lg text-white relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            {icon}
        </div>
        <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                    {icon}
                </div>
                <p className="text-sm font-bold opacity-90 uppercase tracking-wide">{title}</p>
            </div>
            <h3 className="text-4xl font-black tracking-tight mb-1">{value}</h3>
            <p className="text-xs font-medium opacity-80">
                {total > 0 ? Math.round((value / total) * 100) : 0}% dari Total Siswa
            </p>
        </div>
    </div>
);

export default DashboardView;