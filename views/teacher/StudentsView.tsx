import React, { useState, useEffect } from 'react';
import { MOCK_USERS, api } from '../../services/mockData';
import { Search, MoreVertical, ChevronDown, Plus, Edit2, Trash2, X, Save, AlertCircle, Loader2 } from 'lucide-react';
import { User } from '../../types';

const StudentsView: React.FC = () => {
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [studentStats, setStudentStats] = useState<Record<string, number>>({});
  
  // CRUD State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: '', nis: '', class: '' });
  const [formError, setFormError] = useState('');

  const refreshData = async () => {
      // Reload MOCK_USERS from storage via API call logic in component
      // In this app structure, MOCK_USERS is exported but api updates it.
      // We need to re-read MOCK_USERS. Since it's an exported variable, we might need a force update 
      // or just re-filter from the object.
      // Better way: Re-fetch list
      
      // Since MOCK_USERS is imported directly, let's just re-derive the list
      // In a real app this would be `await api.getStudents()`
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

  useEffect(() => {
      refreshData();
  }, [isModalOpen]); // Refresh when modal closes (after save)

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
      setFormError('');
      setIsModalOpen(true);
  };

  const handleEdit = (student: User) => {
      setEditingStudent(student);
      setFormData({ name: student.name, nis: student.nis, class: student.class || '' });
      setFormError('');
      setIsModalOpen(true);
  };

  const handleDelete = async (uid: string) => {
      if (window.confirm('Yakin ingin menghapus siswa ini? Data tidak bisa dikembalikan.')) {
          await api.deleteStudent(uid);
          refreshData();
      }
  };

  const handleSave = async (e: React.FormEvent) => {
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 relative">
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
                            <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors truncate">{student.name}</h3>
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
        
        {filtered.length > 50 && (
            <div className="text-center py-4">
                <p className="text-sm text-slate-400 italic">Menampilkan 50 dari {filtered.length} siswa. Gunakan filter untuk mencari.</p>
            </div>
        )}

        {/* MODAL FORM */}
        {isModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in duration-200">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-900">
                            {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                        </h3>
                        <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-bold text-slate-700">Nama Lengkap</label>
                            <input 
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({...formData, name: e.target.value})}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                placeholder="Contoh: Budi Santoso"
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">NIS / NISN</label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.nis}
                                    onChange={e => setFormData({...formData, nis: e.target.value})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                    placeholder="123456"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">Kelas</label>
                                <input 
                                    type="text"
                                    required
                                    value={formData.class}
                                    onChange={e => setFormData({...formData, class: e.target.value.toUpperCase()})}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 font-medium"
                                    placeholder="7A"
                                />
                            </div>
                        </div>

                        {formError && (
                            <div className="p-3 bg-rose-50 text-rose-600 text-sm font-bold rounded-xl flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> {formError}
                            </div>
                        )}

                        <div className="pt-4 flex gap-3">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="flex-[2] py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                Simpan Data
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default StudentsView;