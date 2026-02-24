import React, { useState, useEffect, useRef } from 'react';
import { Printer, FileText, User as UserIcon, List, School } from 'lucide-react';
import { api, MOCK_USERS, MOCK_ATTENDANCE } from '../../services/mockData';
import { User, AttendanceRecord } from '../../types';

const ReportGenerator: React.FC = () => {
    const [students, setStudents] = useState<User[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('All');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('All');
    const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [reportMode, setReportMode] = useState<'summary' | 'individual'>('individual');
    const [loading, setLoading] = useState(false);
    
    // Signature Names
    const [principalName, setPrincipalName] = useState('Drs. H. Adang Suhendar, M.M.');
    const [vicePrincipalName, setVicePrincipalName] = useState('Hj. Yayah Rokayah, S.Pd.');
    const [operatorName, setOperatorName] = useState('Admin Operator');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const allStudents = await api.getAllStudents();
        const allAttendance = api.getLocalAttendance(); // Using sync for now
        setStudents(allStudents);
        setAttendance(allAttendance);
        setLoading(false);
    };

    // Filter Logic
    const filteredStudents = students.filter(s => 
        (selectedClass === 'All' || s.class === selectedClass) &&
        (selectedStudentId === 'All' || s.uid === selectedStudentId)
    ).sort((a, b) => a.name.localeCompare(b.name));

    const uniqueClasses = Array.from(new Set(students.map(s => s.class))).sort();

    // Calculate Stats per Student
    const getStudentStats = (uid: string) => {
        const studentRecords = attendance.filter(r => 
            r.userId === uid && 
            r.date.startsWith(month)
        );
        
        return {
            present: studentRecords.filter(r => r.status === 'Hadir').length,
            sick: studentRecords.filter(r => r.status === 'Sakit').length,
            permit: studentRecords.filter(r => r.status === 'Izin').length,
            alpha: studentRecords.filter(r => r.status === 'Alpa').length,
            total: studentRecords.length,
            records: studentRecords.sort((a, b) => a.date.localeCompare(b.date))
        };
    };

    const handlePrint = () => {
        window.print();
    };

    // Professional Letterhead Component
    const KopSurat = () => (
        <div className="border-b-4 border-double border-black pb-4 mb-6 flex items-center gap-6">
            <div className="w-24 h-24 flex items-center justify-center border-2 border-black rounded-full p-2">
                 <School className="w-16 h-16 text-black" />
            </div>
            <div className="flex-1 text-center">
                <h3 className="text-lg font-bold uppercase tracking-widest text-black mb-1">YAYASAN PEMBINA LEMBAGA PENDIDIKAN</h3>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-black mb-2">SMP PGRI CITEUREUP</h1>
                <p className="text-sm font-serif italic text-black">
                    Jl. Terusan Mayor Oking Jaya Atmaja No. 27, Citeureup, Bogor, Jawa Barat 16810
                </p>
                <p className="text-xs font-medium text-black mt-1">
                    Telp: (021) 8794xxxx • Email: info@smppgriciteureup.sch.id • Website: smppgriciteureup.sch.id
                </p>
            </div>
        </div>
    );

    const renderIndividualReport = (student: User) => {
        const stats = getStudentStats(student.uid);
        const monthName = new Date(month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

        return (
            <div key={student.uid} className="bg-white p-8 md:p-12 rounded-none md:rounded-3xl shadow-none md:shadow-2xl print:shadow-none print:p-0 print:w-full print:max-w-none print:break-after-page mb-8 print:mb-0 h-full flex flex-col font-serif">
                {/* Kop Surat */}
                <div className="hidden print:block">
                    <KopSurat />
                </div>
                
                {/* Screen Header (Simplified) */}
                <div className="print:hidden text-center border-b-4 border-double border-slate-800 pb-6 mb-8">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-widest mb-2">SMP PGRI CITEUREUP</h2>
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-1">Laporan Kehadiran Siswa</p>
                    <p className="text-xs font-medium text-slate-500">Periode: {monthName}</p>
                </div>

                {/* Title for Print */}
                <div className="hidden print:block text-center mb-8">
                    <h2 className="text-xl font-bold uppercase underline underline-offset-4">LAPORAN KEHADIRAN SISWA</h2>
                    <p className="text-sm mt-2">Periode: {monthName}</p>
                </div>

                {/* Student Info */}
                <div className="grid grid-cols-2 gap-4 mb-8 text-sm border border-black p-4 print:border-none print:p-0">
                    <div>
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td className="font-bold text-slate-500 print:text-black w-24 py-1">Nama</td>
                                    <td className="font-bold text-slate-900 print:text-black uppercase">: {student.name}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-slate-500 print:text-black w-24 py-1">NIS</td>
                                    <td className="font-bold text-slate-900 print:text-black">: {student.nis}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td className="font-bold text-slate-500 print:text-black w-24 py-1">Kelas</td>
                                    <td className="font-bold text-slate-900 print:text-black">: {student.class}</td>
                                </tr>
                                <tr>
                                    <td className="font-bold text-slate-500 print:text-black w-24 py-1">Semester</td>
                                    <td className="font-bold text-slate-900 print:text-black">: Ganjil 2024/2025</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-4 mb-8 print:mb-6">
                    <div className="bg-emerald-50 print:bg-transparent border border-emerald-100 print:border-black p-3 rounded-xl print:rounded-none text-center">
                        <span className="block text-2xl font-black text-emerald-600 print:text-black">{stats.present}</span>
                        <span className="text-xs font-bold text-emerald-700 print:text-black uppercase">Hadir</span>
                    </div>
                    <div className="bg-blue-50 print:bg-transparent border border-blue-100 print:border-black p-3 rounded-xl print:rounded-none text-center">
                        <span className="block text-2xl font-black text-blue-600 print:text-black">{stats.sick}</span>
                        <span className="text-xs font-bold text-blue-700 print:text-black uppercase">Sakit</span>
                    </div>
                    <div className="bg-amber-50 print:bg-transparent border border-amber-100 print:border-black p-3 rounded-xl print:rounded-none text-center">
                        <span className="block text-2xl font-black text-amber-600 print:text-black">{stats.permit}</span>
                        <span className="text-xs font-bold text-amber-700 print:text-black uppercase">Izin</span>
                    </div>
                    <div className="bg-rose-50 print:bg-transparent border border-rose-100 print:border-black p-3 rounded-xl print:rounded-none text-center">
                        <span className="block text-2xl font-black text-rose-600 print:text-black">{stats.alpha}</span>
                        <span className="text-xs font-bold text-rose-700 print:text-black uppercase">Alpa</span>
                    </div>
                </div>

                {/* Detailed Log Table */}
                <div className="mb-8 flex-1">
                    <h3 className="text-xs font-bold text-slate-500 print:text-black uppercase tracking-wider mb-3 print:mb-2">Riwayat Kehadiran</h3>
                    <div className="border border-slate-300 print:border-black rounded-lg print:rounded-none overflow-hidden">
                        <table className="w-full text-sm border-collapse">
                            <thead className="bg-slate-100 print:bg-transparent text-slate-900 print:text-black font-bold">
                                <tr>
                                    <td className="px-4 py-2 border-b border-slate-300 print:border-black w-32 border-r print:border-r-black">Tanggal</td>
                                    <td className="px-4 py-2 border-b border-slate-300 print:border-black w-24 border-r print:border-r-black">Waktu</td>
                                    <td className="px-4 py-2 border-b border-slate-300 print:border-black w-24 border-r print:border-r-black">Status</td>
                                    <td className="px-4 py-2 border-b border-slate-300 print:border-black">Keterangan</td>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 print:divide-black">
                                {stats.records.length > 0 ? (
                                    stats.records.map((record) => (
                                        <tr key={record.id} className="print:border-b print:border-black">
                                            <td className="px-4 py-2 text-slate-600 print:text-black border-r border-slate-200 print:border-black">
                                                {new Date(record.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                                            </td>
                                            <td className="px-4 py-2 text-slate-600 print:text-black font-mono text-xs border-r border-slate-200 print:border-black">{record.time}</td>
                                            <td className="px-4 py-2 border-r border-slate-200 print:border-black">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border print:border-black print:text-black print:bg-transparent ${
                                                    record.status === 'Hadir' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    record.status === 'Sakit' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    record.status === 'Izin' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                    'bg-rose-50 text-rose-700 border-rose-200'
                                                }`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 text-slate-600 print:text-black italic">{record.details || '-'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400 print:text-black italic border-t border-black">
                                            Belum ada data kehadiran bulan ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Signature Block */}
                <div className="mt-auto grid grid-cols-3 gap-8 break-inside-avoid page-break-inside-avoid pt-8">
                    <div className="text-center">
                        <p className="text-xs font-medium text-slate-500 print:text-black mb-20">Mengetahui,</p>
                        <p className="font-bold text-slate-900 print:text-black underline underline-offset-4">{principalName}</p>
                        <p className="text-xs font-medium text-slate-500 print:text-black mt-1">Kepala Sekolah</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-medium text-slate-500 print:text-black mb-20">Diperiksa Oleh,</p>
                        <p className="font-bold text-slate-900 print:text-black underline underline-offset-4">{vicePrincipalName}</p>
                        <p className="text-xs font-medium text-slate-500 print:text-black mt-1">Waka Kesiswaan</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs font-medium text-slate-500 print:text-black mb-20">
                            Citeureup, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="font-bold text-slate-900 print:text-black underline underline-offset-4">{operatorName}</p>
                        <p className="text-xs font-medium text-slate-500 print:text-black mt-1">Operator / Admin</p>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen pb-24">
            {/* Header - Hidden on Print */}
            <div className="mb-8 print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200">
                            <FileText className="w-6 h-6" />
                        </div>
                        Laporan Kehadiran
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Cetak laporan bulanan dengan tanda tangan resmi.</p>
                </div>
                <button 
                    onClick={handlePrint}
                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-200 transition-all flex items-center gap-2"
                >
                    <Printer className="w-5 h-5" /> Cetak Laporan (PDF)
                </button>
            </div>

            {/* Controls - Hidden on Print */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 print:hidden bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="md:col-span-4 flex gap-4 border-b border-slate-100 pb-4 mb-2">
                    <button 
                        onClick={() => setReportMode('individual')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${reportMode === 'individual' ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <UserIcon className="w-4 h-4" /> Laporan Individu
                    </button>
                    <button 
                        onClick={() => setReportMode('summary')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${reportMode === 'summary' ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <List className="w-4 h-4" /> Rekap Kelas (Tabel)
                    </button>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Kelas</label>
                    <select 
                        value={selectedClass}
                        onChange={(e) => {
                            setSelectedClass(e.target.value);
                            setSelectedStudentId('All'); // Reset student selection
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    >
                        <option value="All">Semua Kelas</option>
                        {uniqueClasses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {reportMode === 'individual' && (
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pilih Siswa</label>
                        <select 
                            value={selectedStudentId}
                            onChange={(e) => setSelectedStudentId(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        >
                            <option value="All">Semua Siswa (Cetak Bulk)</option>
                            {students
                                .filter(s => selectedClass === 'All' || s.class === selectedClass)
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map(s => <option key={s.uid} value={s.uid}>{s.name}</option>)
                            }
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bulan Laporan</label>
                    <input 
                        type="month" 
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                </div>
                
                <div className={reportMode === 'individual' ? "md:col-span-1" : "md:col-span-2"}>
                     <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pejabat Penanda Tangan</label>
                     <div className="flex flex-col gap-2">
                        <input 
                            type="text" 
                            placeholder="Nama Kepala Sekolah"
                            value={principalName}
                            onChange={(e) => setPrincipalName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium"
                        />
                         <input 
                            type="text" 
                            placeholder="Nama Waka Kesiswaan"
                            value={vicePrincipalName}
                            onChange={(e) => setVicePrincipalName(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium"
                        />
                     </div>
                </div>
            </div>

            {/* REPORT RENDER AREA */}
            {reportMode === 'individual' ? (
                <div>
                    {filteredStudents.map(student => renderIndividualReport(student))}
                    {filteredStudents.length === 0 && (
                        <div className="text-center py-12 text-slate-400">Tidak ada data siswa ditemukan.</div>
                    )}
                </div>
            ) : (
                <div className="bg-white p-8 md:p-12 rounded-none md:rounded-3xl shadow-none md:shadow-2xl print:shadow-none print:p-0 print:w-full print:max-w-none font-serif">
                    {/* Kop Surat */}
                    <div className="hidden print:block">
                        <KopSurat />
                    </div>

                    {/* Screen Header */}
                    <div className="print:hidden text-center border-b-4 border-double border-slate-800 pb-6 mb-8">
                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-widest mb-2">SMP PGRI CITEUREUP</h2>
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mb-1">Rekapitulasi Kehadiran Kelas</p>
                        <p className="text-xs font-medium text-slate-500">
                            Periode: {new Date(month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} • 
                            Kelas: {selectedClass === 'All' ? 'Semua Kelas' : selectedClass}
                        </p>
                    </div>

                    {/* Print Title */}
                    <div className="hidden print:block text-center mb-8">
                        <h2 className="text-xl font-bold uppercase underline underline-offset-4">REKAPITULASI KEHADIRAN KELAS</h2>
                        <p className="text-sm mt-2 font-bold">
                            Periode: {new Date(month).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })} • 
                            Kelas: {selectedClass === 'All' ? 'Semua Kelas' : selectedClass}
                        </p>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-slate-300 print:border-black text-sm">
                            <thead>
                                <tr className="bg-slate-100 print:bg-transparent text-slate-900 print:text-black">
                                    <th className="border border-slate-300 print:border-black px-3 py-2 text-center w-12">No</th>
                                    <th className="border border-slate-300 print:border-black px-3 py-2 text-left">Nama Siswa</th>
                                    <th className="border border-slate-300 print:border-black px-3 py-2 text-center w-20">Kelas</th>
                                    <th className="border border-slate-300 print:border-black px-3 py-2 text-center w-16 bg-emerald-50 print:bg-transparent text-emerald-700 print:text-black">Hadir</th>
                                    <th className="border border-slate-300 print:border-black px-3 py-2 text-center w-16 bg-blue-50 print:bg-transparent text-blue-700 print:text-black">Sakit</th>
                                    <th className="border border-slate-300 print:border-black px-3 py-2 text-center w-16 bg-amber-50 print:bg-transparent text-amber-700 print:text-black">Izin</th>
                                    <th className="border border-slate-300 print:border-black px-3 py-2 text-center w-16 bg-rose-50 print:bg-transparent text-rose-700 print:text-black">Alpa</th>
                                    <th className="border border-slate-300 print:border-black px-3 py-2 text-center w-16 font-black text-slate-900 print:text-black">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudents.map((student, index) => {
                                    const stats = getStudentStats(student.uid);
                                    return (
                                        <tr key={student.uid} className="hover:bg-slate-50 print:hover:bg-transparent">
                                            <td className="border border-slate-300 print:border-black px-3 py-2 text-center font-medium text-slate-500 print:text-black">{index + 1}</td>
                                            <td className="border border-slate-300 print:border-black px-3 py-2 font-bold text-slate-800 print:text-black">{student.name}</td>
                                            <td className="border border-slate-300 print:border-black px-3 py-2 text-center font-medium text-slate-600 print:text-black">{student.class}</td>
                                            <td className="border border-slate-300 print:border-black px-3 py-2 text-center font-bold text-emerald-600 print:text-black">{stats.present}</td>
                                            <td className="border border-slate-300 print:border-black px-3 py-2 text-center font-bold text-blue-600 print:text-black">{stats.sick}</td>
                                            <td className="border border-slate-300 print:border-black px-3 py-2 text-center font-bold text-amber-600 print:text-black">{stats.permit}</td>
                                            <td className="border border-slate-300 print:border-black px-3 py-2 text-center font-bold text-rose-600 print:text-black">{stats.alpha}</td>
                                            <td className="border border-slate-300 print:border-black px-3 py-2 text-center font-black text-slate-900 print:text-black bg-slate-50 print:bg-transparent">{stats.total}</td>
                                        </tr>
                                    );
                                })}
                                {filteredStudents.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="border border-slate-300 print:border-black px-6 py-8 text-center text-slate-400 print:text-black italic">
                                            Tidak ada data siswa untuk filter ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Signature Block */}
                    <div className="mt-16 grid grid-cols-3 gap-8 break-inside-avoid page-break-inside-avoid">
                        <div className="text-center">
                            <p className="text-xs font-medium text-slate-500 print:text-black mb-20">Mengetahui,</p>
                            <p className="font-bold text-slate-900 print:text-black underline underline-offset-4">{principalName}</p>
                            <p className="text-xs font-medium text-slate-500 print:text-black mt-1">Kepala Sekolah</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-medium text-slate-500 print:text-black mb-20">Diperiksa Oleh,</p>
                            <p className="font-bold text-slate-900 print:text-black underline underline-offset-4">{vicePrincipalName}</p>
                            <p className="text-xs font-medium text-slate-500 print:text-black mt-1">Waka Kesiswaan</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs font-medium text-slate-500 print:text-black mb-20">
                                Citeureup, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <p className="font-bold text-slate-900 print:text-black underline underline-offset-4">{operatorName}</p>
                            <p className="text-xs font-medium text-slate-500 print:text-black mt-1">Operator / Admin</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 pt-4 border-t border-slate-200 print:border-black flex justify-between items-center text-[10px] text-slate-400 print:text-black">
                        <p>Dicetak melalui Sistem Absenta SMP PGRI Citeureup</p>
                        <p>{new Date().toLocaleString('id-ID')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportGenerator;
