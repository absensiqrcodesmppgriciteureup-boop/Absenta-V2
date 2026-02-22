import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Users, LogOut, School, ChevronRight, Bell, Database, Trash2, Download, UserX, Loader2, Filter, Check, AlertTriangle, X, Terminal, CheckCircle2, Globe } from 'lucide-react';
import { useAuth } from '../../App';
import DashboardView from './DashboardView';
import StudentsView from './StudentsView';
import { api } from '../../services/mockData';
import { submitToGoogleFormBackground } from '../../services/sheetService';
import { User } from '../../types';

// Tipe untuk Log Proses
interface ProcessLog {
    id: string;
    text: string;
    status: 'pending' | 'success' | 'error';
    time: string;
}

const TeacherLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students'>('dashboard');
  const { logout, user } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef(0);

  // === GLOBAL ACTIONS STATE ===
  const [locking, setLocking] = useState(false);
  const [resetting, setResetting] = useState(false);
  
  // === ALPHA MODAL STATE ===
  const [isAlphaModalOpen, setIsAlphaModalOpen] = useState(false);
  const [missingStudents, setMissingStudents] = useState<User[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState('All');
  const [isLoadingAlphaList, setIsLoadingAlphaList] = useState(false);

  // === NEW: PROCESS TERMINAL STATE ===
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [processLogs, setProcessLogs] = useState<ProcessLog[]>([]);
  const [processProgress, setProcessProgress] = useState(0);
  const [isProcessingDone, setIsProcessingDone] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto scroll terminal ke bawah
    if (logsEndRef.current) {
        logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [processLogs]);

  useEffect(() => {
    // Poll for notifications
    const checkNotifs = async () => {
        const notifs = await api.getNotifications();
        const currentCount = notifs.filter(n => !n.isRead).length;

        if (currentCount > prevCountRef.current) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 1500); 
        }

        setNotifCount(currentCount);
        prevCountRef.current = currentCount;
    };
    checkNotifs();
    const interval = setInterval(checkNotifs, 5000);
    return () => clearInterval(interval);
  }, []);

  // === ACTION HANDLERS ===

  const handleLockData = async () => {
      if (!window.confirm("Simpan Semua Data ke Database?\n\nTindakan ini akan mengamankan data dari Spreadsheet ke sistem lokal.")) {
          return;
      }
      setLocking(true);
      try {
          const count = await api.lockAttendanceData();
          alert(`Berhasil mengamankan ${count} data presensi baru!`);
      } catch (e) {
          alert("Gagal menyimpan data.");
      } finally {
          setLocking(false);
      }
  };

  const handleResetData = async () => {
      if (!window.confirm("HAPUS CACHE & RELOAD DATA?\n\nData lokal akan dihapus dan aplikasi akan mengambil ulang kondisi terbaru dari Spreadsheet.")) {
          return;
      }
      setResetting(true);
      await api.resetLocalData();
      alert("Cache berhasil dibersihkan. Data akan dimuat ulang.");
      setResetting(false);
  };

  const handleExport = async () => {
      const allRecords = await api.getAttendance();
      const todayStr = new Date().toLocaleDateString('en-CA');
      const todaysRecords = allRecords.filter(r => r.date === todayStr);

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

  const openAlphaModal = async () => {
      setIsAlphaModalOpen(true);
      setIsLoadingAlphaList(true); 
      setMissingStudents([]); 

      try {
          const allRecords = await api.getAttendance(true); // Force sync
          const allStudents = await api.getAllStudents(); 
          
          const todayStr = new Date().toLocaleDateString('en-CA');
          const todaysRecords = allRecords.filter(r => r.date === todayStr);
          
          const presentIds = todaysRecords.map(r => r.userId);
          const missing = allStudents.filter(s => !presentIds.includes(s.uid));
          
          setMissingStudents(missing);
      } catch (e) {
          alert("Gagal memuat data terbaru.");
          setIsAlphaModalOpen(false);
      } finally {
          setIsLoadingAlphaList(false);
      }
  };

  // === NEW LOGIC: LIVE PROCESS (UI THREAD SAFE) ===
  const handleMarkAlpha = (studentsToProcess: User[]) => {
      if (studentsToProcess.length === 0) return;
      
      const confirmMsg = studentsToProcess.length === 1
        ? `Tandai ${studentsToProcess[0].name} sebagai Alpa?`
        : `Proses ${studentsToProcess.length} siswa sebagai ALPA?\n\nSistem akan mengirim data ke Google Form satu per satu.`;

      if (!window.confirm(confirmMsg)) return;

      // 1. Trigger Open Modal IMMEDIATELY
      setIsProcessModalOpen(true);
      setProcessLogs([]);
      setProcessProgress(0);
      setIsProcessingDone(false);

      // 2. Use setTimeout to defer the heavy lifting 
      setTimeout(async () => {
          const todayStr = new Date().toLocaleDateString('en-CA');
          let successCount = 0;
          
          for (let i = 0; i < studentsToProcess.length; i++) {
              const student = studentsToProcess[i];
              const progress = Math.round(((i + 1) / studentsToProcess.length) * 100);
              
              setProcessProgress(progress);

              try {
                  // A. Tembak Link Google Form (GET Request)
                  await submitToGoogleFormBackground(student.name, 'A');
                  
                  // B. Simpan ke Lokal (Tanpa network call lagi)
                  await api.markBulkAlpha([student.uid], todayStr, true); // true = skip network in API
                  
                  successCount++;
                  
                  // Add dummy log for counting if needed, or just rely on successCount
                  setProcessLogs(prev => [...prev, { id: Math.random().toString(), text: 'Success', status: 'success', time: '' }]);

                  // Delay buatan agar user melihat progress bar bergerak (UX)
                  await new Promise(r => setTimeout(r, 500)); 

              } catch (error) {
                  console.error(error);
              }
          }

          setIsProcessingDone(true);
          setProcessProgress(100);
          
          // Update data di modal utama (hilangkan yang sudah sukses)
          if (successCount > 0) {
              const processedIds = studentsToProcess.map(s => s.uid);
              setMissingStudents(prev => prev.filter(s => !processedIds.includes(s.uid)));
          }
      }, 100); // 100ms delay to ensure DOM paint
  };

  const filteredMissing = missingStudents.filter(s => selectedClassFilter === 'All' || s.class === selectedClassFilter);
  const classes = ['All', ...Array.from(new Set(missingStudents.map(s => s.class || ''))).filter(Boolean).sort()];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col shadow-sm z-10 h-full">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3 shrink-0">
          <div className="bg-primary-600 p-2.5 rounded-xl text-white shadow-lg shadow-primary-200">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-lg tracking-tight leading-tight">SMP PGRI<br/>Citeureup</h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            {/* Menu Utama */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Menu Utama</p>
                <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                    <div className="relative">
                        <LayoutDashboard className="w-5 h-5" />
                        {notifCount > 0 && activeTab !== 'dashboard' && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
                        )}
                    </div>
                    Dashboard
                    {activeTab === 'dashboard' && <ChevronRight className="w-4 h-4 ml-auto" />}
                    {notifCount > 0 && activeTab === 'dashboard' && (
                        <span className={`ml-auto bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full text-xs transition-transform ${isAnimating ? 'scale-110 font-black' : ''}`}>{notifCount}</span>
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('students')}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'students' ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                    <Users className="w-5 h-5" />
                    Data Siswa
                    {activeTab === 'students' && <ChevronRight className="w-4 h-4 ml-auto" />}
                </button>
            </div>

            {/* Aksi Cepat */}
            <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Aksi Cepat</p>
                
                <button 
                    onClick={openAlphaModal}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-rose-600 bg-rose-50 hover:bg-rose-100 hover:shadow-sm transition-all border border-rose-100"
                >
                    <UserX className="w-5 h-5" /> Cek Alpa Harian
                </button>

                <button 
                    onClick={handleLockData}
                    disabled={locking}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:shadow-sm transition-all border border-indigo-100 disabled:opacity-50"
                >
                    {locking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />} 
                    Sync Database
                </button>

                <button 
                    onClick={handleExport}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:shadow-sm transition-all border border-emerald-100"
                >
                    <Download className="w-5 h-5" /> Export Excel
                </button>

                <button 
                    onClick={handleResetData}
                    disabled={resetting}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
                >
                    <Trash2 className={`w-5 h-5 ${resetting ? 'animate-spin' : ''}`} /> 
                    Reset Cache
                </button>
            </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user?.photo} className="w-10 h-10 rounded-full bg-slate-200 object-cover ring-2 ring-white shadow-sm" alt="Profile" />
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 font-medium">Administrator</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 text-sm font-bold transition-colors">
            <LogOut className="w-4 h-4" /> Keluar Aplikasi
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center z-20 shadow-sm shrink-0">
             <div className="flex items-center gap-2">
                <div className="bg-primary-600 p-1.5 rounded text-white">
                    <School className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900">SMP PGRI</span>
             </div>
             <div className="flex items-center gap-3">
                 <div className={`relative ${isAnimating ? 'animate-bounce' : ''}`}>
                    <Bell className={`w-5 h-5 transition-colors duration-300 ${isAnimating ? 'text-rose-600' : 'text-slate-600'}`} />
                    {notifCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full"></span>}
                 </div>
                 <button onClick={logout} className="text-slate-500">
                    <LogOut className="w-5 h-5" />
                 </button>
             </div>
        </header>

        {/* Mobile Tab & Quick Actions */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 shrink-0 overflow-x-auto no-scrollbar">
            <div className="flex gap-4 min-w-max pb-2">
                <button 
                    onClick={() => setActiveTab('dashboard')} 
                    className={`pb-2 text-sm font-bold border-b-2 ${activeTab === 'dashboard' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'}`}
                >
                    Dashboard {notifCount > 0 && `(${notifCount})`}
                </button>
                <button 
                    onClick={() => setActiveTab('students')} 
                    className={`pb-2 text-sm font-bold border-b-2 ${activeTab === 'students' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'}`}
                >
                    Data Siswa
                </button>
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <button onClick={openAlphaModal} className="text-rose-600 text-sm font-bold flex items-center gap-1">
                    <UserX className="w-4 h-4" /> Alpa
                </button>
                <button onClick={handleLockData} className="text-indigo-600 text-sm font-bold flex items-center gap-1">
                    <Database className="w-4 h-4" /> Sync
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          {activeTab === 'dashboard' ? <DashboardView /> : <StudentsView />}
        </div>
      </main>

      {/* --- STANDARD LOADING MODAL --- */}
      {isProcessModalOpen && (
          <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center animate-in zoom-in duration-300">
                  
                  {!isProcessingDone ? (
                      <>
                          <div className="relative mb-6">
                              <Loader2 className="w-16 h-16 text-primary-200 animate-spin" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-xs font-bold text-primary-600">{processProgress}%</span>
                              </div>
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">Memproses Data...</h3>
                          <p className="text-slate-500 text-sm">Sedang mengirim data ke server sekolah.</p>
                          <p className="text-xs text-slate-400 mt-4">Mohon jangan tutup halaman ini.</p>
                      </>
                  ) : (
                      <>
                          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
                              <CheckCircle2 className="w-8 h-8" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 mb-2">Selesai!</h3>
                          <p className="text-slate-500 text-sm mb-6">
                              Berhasil memproses data kehadiran siswa.
                          </p>
                          <button 
                              onClick={() => setIsProcessModalOpen(false)}
                              className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-200"
                          >
                              Tutup
                          </button>
                      </>
                  )}
              </div>
          </div>
      )}

      {/* --- ALPHA MANAGER MODAL (Z-INDEX 50) --- */}
      {isAlphaModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-50 shrink-0">
                      <div>
                          <h3 className="text-xl font-bold text-rose-800 flex items-center gap-2">
                              <UserX className="w-6 h-6" />
                              Manajemen Alpa Otomatis
                          </h3>
                          <p className="text-sm text-rose-600/80">Siswa yang belum melakukan presensi hari ini.</p>
                      </div>
                      <button onClick={() => setIsAlphaModalOpen(false)} className="p-2 hover:bg-rose-200 rounded-full transition-colors text-rose-700">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <div className="p-4 border-b border-slate-100 flex gap-4 bg-white items-center shrink-0">
                      <div className="relative">
                          <Filter className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                          <select 
                              value={selectedClassFilter} 
                              onChange={e => setSelectedClassFilter(e.target.value)}
                              className="pl-10 pr-8 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                          >
                              {classes.map(c => <option key={c} value={c}>{c === 'All' ? 'Semua Kelas' : `Kelas ${c}`}</option>)}
                          </select>
                      </div>
                      <div className="text-sm font-medium text-slate-500 ml-auto">
                          {isLoadingAlphaList ? (
                              <span className="flex items-center gap-2 text-slate-400"><Loader2 className="w-3 h-3 animate-spin"/> Sinkronisasi...</span>
                          ) : (
                              <>Total: <span className="font-bold text-slate-900">{filteredMissing.length}</span> Siswa Belum Absen</>
                          )}
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50">
                      {isLoadingAlphaList ? (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                              <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
                              <p className="font-medium animate-pulse">Mengambil data terbaru dari server...</p>
                          </div>
                      ) : filteredMissing.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-slate-400">
                              <Check className="w-16 h-16 mb-4 text-emerald-400" />
                              <p className="font-bold text-lg">Semua Siswa Sudah Absen!</p>
                              <p className="text-sm">Tidak ada siswa tanpa keterangan di kategori ini.</p>
                          </div>
                      ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {filteredMissing.map(student => (
                                  <div key={student.uid} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-rose-300 transition-colors relative z-0">
                                      <div className="flex items-center gap-3 overflow-hidden">
                                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs flex-shrink-0">
                                              {student.class}
                                          </div>
                                          <div className="min-w-0">
                                              <p className="font-bold text-slate-900 text-sm truncate">{student.name}</p>
                                              <p className="text-xs text-slate-400">{student.nis}</p>
                                          </div>
                                      </div>
                                      <button 
                                          type="button"
                                          onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              handleMarkAlpha([student]);
                                          }}
                                          className="p-2 rounded-lg transition-colors z-[40] relative cursor-pointer active:scale-95 shadow-sm border bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-600 hover:text-white hover:border-rose-600"
                                          title="Tandai Alpa"
                                      >
                                          <UserX className="w-4 h-4" />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  <div className="p-6 border-t border-slate-200 bg-white flex justify-between items-center gap-4 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-20 relative">
                        <div className="flex items-center gap-2 text-rose-600 text-xs font-bold bg-rose-50 px-3 py-2 rounded-lg">
                            <AlertTriangle className="w-4 h-4" />
                            Aksi ini akan mencatat 'Alpa' di database.
                        </div>
                        <div className="flex gap-2">
                            {selectedClassFilter !== 'All' && (
                                <button 
                                    type="button"
                                    onClick={() => handleMarkAlpha(filteredMissing)}
                                    disabled={filteredMissing.length === 0 || isLoadingAlphaList}
                                    className="px-4 py-3 bg-rose-100 text-rose-700 font-bold rounded-xl hover:bg-rose-200 transition-colors text-sm flex items-center gap-2 disabled:opacity-50 active:scale-95 z-50"
                                >
                                    Alpa Satu Kelas ({filteredMissing.length})
                                </button>
                            )}
                            <button 
                                type="button"
                                onClick={() => handleMarkAlpha(missingStudents)}
                                disabled={missingStudents.length === 0 || isLoadingAlphaList}
                                className="px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 text-sm flex items-center gap-2 disabled:opacity-50 active:scale-95 z-50"
                            >
                                <UserX className="w-4 h-4" />
                                Tandai Semua Alpa ({missingStudents.length})
                            </button>
                        </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default TeacherLayout;