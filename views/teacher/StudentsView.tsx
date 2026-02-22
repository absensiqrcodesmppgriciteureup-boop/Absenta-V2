import React, { useState, useEffect } from 'react';
import { MOCK_USERS, api } from '../../services/mockData';
import { Search, ChevronDown, Plus, Edit2, Trash2, X, Save, AlertCircle, Loader2, Trophy, Calendar, User as UserIcon, History, PlusCircle, Crown } from 'lucide-react';
import { User, AttendanceRecord } from '../../types';

const StudentsView: React.FC = () => {
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [studentStats, setStudentStats] = useState<Record<string, number>>({});
  
  // MODAL STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'xp' | 'attendance'>('profile');
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  
  // FORM STATES
  const [formData, setFormData] = useState({ name: '', nis: '', class: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  // XP Management
  const [xpAmount, setXpAmount] = useState<number>(0);
  const [xpReason, setXpReason] = useState('');

  // Attendance Management
  const [studentLogs, setStudentLogs] = useState<AttendanceRecord[]>([]);
  const [newAttDate, setNewAttDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [newAttStatus, setNewAttStatus] = useState('Hadir');

  const refreshData = async () => {
      // Re-fetch list
      const students = Object.values(MOCK_USERS).filter(u => u.role === 'student');
      setAllStudents(students);

      // Refresh stats
      const records = await api.getAttendance();
      const stats: Record<string, number> = {};
      students.forEach(s => {
          const sRecords = records.filter(r => r.userId === s.uid && r.status !== 'Pending');
          const total = sRecords.length;
          const present = sRecords.filter(r => r.status === 'Hadir').length;
          stats[s.uid] = total > 0 ? Math.round((present / total) * 100) : 0;
      });
      setStudentStats(stats);
  };

  const loadStudentLogs = async (uid: string) => {
      const allRecords = await api.getAttendance();
      const logs = allRecords.filter(r => r.userId === uid).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setStudentLogs(logs);
  }

  useEffect(() => {
      refreshData();
  }, [isModalOpen]); 

  // Filter Logic
  const classes = ['All', ...Array.from(new Set(allStudents.map(s => s.class || ''))).filter(Boolean).sort()];

  const filtered = allStudents.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search);
      const matchClass = selectedClass === 'All' || s.class === selectedClass;
      return matchSearch && matchClass;
  });

  // Handlers
  const handleAdd = () => {
      setEditingStudent(null);
      setFormData({ name: '', nis: '', class: '' });
      setActiveTab('profile');
      setFormError('');
      setIsModalOpen(true);
  };

  const handleEdit = (student: User) => {
      setEditingStudent(student);
      setFormData({ name: student.name, nis: student.nis, class: student.class || '' });
      setActiveTab('profile');
      setFormError('');
      setIsModalOpen(true);
      if(student.uid) loadStudentLogs(student.uid);
  };

  const handleDelete = async (uid: string) => {
      if (window.confirm('Yakin ingin menghapus siswa ini? Data tidak bisa dikembalikan.')) {
          await api.deleteStudent(uid);
          refreshData();
      }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setFormError('');

      try {
          let success = false;
          if (editingStudent) {
              success = await api.updateStudent(editingStudent.uid, formData);
          } else {
              success = await api.addStudent(formData);
          }

          if (success) {
              setIsModalOpen(false);
              refreshData();
          } else {
              setFormError('Gagal menyimpan. NIS mungkin sudah digunakan.');
          }
      } catch (err) {
          setFormError('Terjadi kesalahan sistem.');
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleAdjustXP = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingStudent) return;
      setIsSubmitting(true);
      await api.updateStudentXP(editingStudent.uid, xpAmount);
      // Refresh local state
      const updatedUser = await api.getUser(editingStudent.nis);
      if(updatedUser) setEditingStudent(updatedUser);
      setXpAmount(0);
      setXpReason('');
      alert("Poin XP Berhasil Diupdate!");
      setIsSubmitting(false);
  };

  const handleDeleteLog = async (recordId: string) => {
      if(!editingStudent) return;
      if(window.confirm("Hapus log absensi ini? Poin XP siswa akan dikurangi otomatis.")) {
          await api.deleteAttendanceRecord(recordId, editingStudent.uid);
          loadStudentLogs(editingStudent.uid);
          // Refresh user XP visual
          const updatedUser = await api.getUser(editingStudent.nis);
          if(updatedUser) setEditingStudent(updatedUser);
      }
  }

  const handleAddLog = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!editingStudent) return;
      setIsSubmitting(true);
      await api.addManualAttendance({
          userId: editingStudent.uid,
          status: newAttStatus as any,
          date: newAttDate,
          time: '07:00',
          details: 'Input Manual Guru'
      });
      loadStudentLogs(editingStudent.uid);
      const updatedUser = await api.getUser(editingStudent.nis);
      if(updatedUser) setEditingStudent(updatedUser);
      setIsSubmitting(false);
      alert("Absen manual berhasil ditambahkan.");
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 relative pb-20">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">Database Siswa</h2>
                <p className="text-slate-500 mt-1 text-sm font-medium">Total {allStudents.length} Siswa Terdaftar</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
                <button 
                    onClick={handleAdd}
                    className="flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" /> Tambah Siswa
                </button>
            </div>
        </header>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Cari nama atau NIS..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 w-full font-medium text-slate-900 shadow-sm"
                />
            </div>
            <div className="relative sm:w-48">
                <select 
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer w-full shadow-sm"
                >
                    {classes.map(c => (
                        <option key={c} value={c}>{c === 'All' ? 'Semua Kelas' : c}</option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-4 text-slate-400 pointer-events-none" />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.slice(0, 50).map(student => ( 
                <div key={student.uid} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                            onClick={() => handleEdit(student)}
                            className="p-2 bg-slate-100 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                            title="Edit"
                         >
                            <Edit2 className="w-4 h-4" />
                         </button>
                         <button 
                            onClick={() => handleDelete(student.uid)}
                            className="p-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors"
                            title="Hapus"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <img src={student.photo} alt={student.name} className="w-16 h-16 rounded-full bg-slate-100 object-cover ring-4 ring-slate-50" />
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold transition-colors truncate text-slate-900 group-hover:text-primary-600">{student.name}</h3>
                            <p className="text-sm text-slate-500 font-mono">{student.nis}</p>
                            <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">{student.class}</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-bold mb-0.5 uppercase">LEVEL</p>
                            <span className="text-lg font-bold text-primary-600">{student.level}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-bold mb-0.5 uppercase">XP</p>
                            <span className="text-lg font-bold text-amber-500">{student.xp}</span>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                         <div className="text-center">
                            <p className="text-[10px] text-slate-400 font-bold mb-0.5 uppercase">HADIR</p>
                            <span className="text-lg font-bold text-emerald-600">
                                {studentStats[student.uid] !== undefined ? `${studentStats[student.uid]}%` : '0%'}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {filtered.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                <p className="text-slate-500 font-medium">Tidak ada siswa ditemukan.</p>
            </div>
        )}

        {/* --- STUDENT MANAGER MODAL --- */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-2xl h-[90vh] md:h-auto md:max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-200">
                    {/* Modal Header */}
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                             <h3 className="text-xl font-bold text-slate-900">
                                {editingStudent ? editingStudent.name : 'Tambah Siswa Baru'}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {editingStudent ? `Mengelola data untuk ${editingStudent.nis}` : 'Lengkapi formulir di bawah'}
                            </p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Tabs */}
                    {editingStudent && (
                        <div className="flex border-b border-slate-100 px-6 gap-6">
                            <button onClick={() => setActiveTab('profile')} className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                                <UserIcon className="w-4 h-4" /> Profil
                            </button>
                            <button onClick={() => setActiveTab('xp')} className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'xp' ? 'border-amber-500 text-amber-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                                <Trophy className="w-4 h-4" /> Poin XP
                            </button>
                            <button onClick={() => setActiveTab('attendance')} className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'attendance' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                                <History className="w-4 h-4" /> Riwayat Absen
                            </button>
                        </div>
                    )}

                    {/* Modal Content */}
                    <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                        
                        {/* TAB 1: PROFILE */}
                        {activeTab === 'profile' && (
                            <form onSubmit={handleSaveProfile} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">Nama Lengkap</label>
                                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium" placeholder="Nama Siswa" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700">NIS</label>
                                        <input type="text" required value={formData.nis} onChange={e => setFormData({...formData, nis: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium" placeholder="123456" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700">Kelas</label>
                                        <input type="text" required value={formData.class} onChange={e => setFormData({...formData, class: e.target.value.toUpperCase()})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium" placeholder="7A" />
                                    </div>
                                </div>
                                
                                {formError && <div className="p-3 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {formError}</div>}
                                <div className="pt-4"><button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg transition-all">{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Simpan Perubahan'}</button></div>
                            </form>
                        )}

                        {/* TAB 2: XP MANAGEMENT */}
                        {activeTab === 'xp' && editingStudent && (
                            <div className="space-y-6">
                                <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-amber-600 uppercase">XP Saat Ini</p>
                                        <p className="text-3xl font-black text-amber-500">{editingStudent.xp}</p>
                                    </div>
                                    <div>
                                         <p className="text-xs font-bold text-slate-400 uppercase text-right">Level</p>
                                         <p className="text-3xl font-black text-slate-700 text-right">{editingStudent.level}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleAdjustXP} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700">Tambah / Kurangi Poin</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number" 
                                                value={xpAmount} 
                                                onChange={e => setXpAmount(parseInt(e.target.value))} 
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-lg" 
                                                placeholder="0"
                                            />
                                        </div>
                                        <p className="text-xs text-slate-400">*Gunakan angka negatif (misal -50) untuk mengurangi poin.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-bold text-slate-700">Alasan (Opsional)</label>
                                        <input type="text" value={xpReason} onChange={e => setXpReason(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium" placeholder="Contoh: Juara Lomba Kelas" />
                                    </div>
                                    <button type="submit" disabled={isSubmitting || xpAmount === 0} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg transition-all flex items-center justify-center gap-2">
                                        <Save className="w-4 h-4" /> Update Poin
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* TAB 3: ATTENDANCE HISTORY */}
                        {activeTab === 'attendance' && editingStudent && (
                            <div className="space-y-6">
                                {/* Add Manual Log */}
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Tambah Manual</h4>
                                    <form onSubmit={handleAddLog} className="flex gap-2 flex-col sm:flex-row">
                                        <input type="date" value={newAttDate} onChange={e => setNewAttDate(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium" required />
                                        <select value={newAttStatus} onChange={e => setNewAttStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium bg-white">
                                            <option value="Hadir">Hadir</option>
                                            <option value="Sakit">Sakit</option>
                                            <option value="Izin">Izin</option>
                                            <option value="Alpa">Alpa</option>
                                        </select>
                                        <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700">Simpan</button>
                                    </form>
                                </div>

                                <div className="space-y-2">
                                    {studentLogs.length === 0 ? (
                                        <p className="text-center text-slate-400 text-sm py-4">Belum ada riwayat absen.</p>
                                    ) : (
                                        studentLogs.map(log => (
                                            <div key={log.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:bg-slate-50">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${log.status === 'Hadir' ? 'bg-emerald-100 text-emerald-600' : log.status === 'Sakit' ? 'bg-blue-100 text-blue-600' : log.status === 'Izin' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                                                        {log.status[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">{new Date(log.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'})}</p>
                                                        <p className="text-xs text-slate-400">{log.time} • {log.details}</p>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteLog(log.id)} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus Log">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default StudentsView;