import React, { useState } from 'react';
import { MOCK_ATTENDANCE } from '../../services/mockData';
import { useAuth } from '../../App';
import { ChevronLeft, ChevronRight, X, Clock, Info, CheckCircle2, FileText, Calendar } from 'lucide-react';

const HistoryView: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date()); // DEFAULT REAL TIME
  const [selectedDateDetails, setSelectedDateDetails] = useState<any | null>(null);

  const history = MOCK_ATTENDANCE.filter(a => a.userId === user?.uid);

  // Helper functions for calendar
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Padding for empty days
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 md:h-12" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const record = history.find(h => h.date === dateStr);
        
        let bgColor = 'bg-slate-50 text-slate-700';
        let borderColor = 'border-slate-100';

        if (record) {
            switch(record.status) {
                case 'Hadir':
                    bgColor = 'bg-emerald-500 text-white shadow-emerald-200';
                    borderColor = 'border-emerald-600';
                    break;
                case 'Sakit':
                    bgColor = 'bg-blue-500 text-white shadow-blue-200';
                    borderColor = 'border-blue-600';
                    break;
                case 'Izin':
                    bgColor = 'bg-amber-500 text-white shadow-amber-200';
                    borderColor = 'border-amber-600';
                    break;
                case 'Alpa':
                    bgColor = 'bg-rose-500 text-white shadow-rose-200';
                    borderColor = 'border-rose-600';
                    break;
            }
        }

        days.push(
            <div 
                key={day} 
                onClick={() => record ? setSelectedDateDetails(record) : null}
                className={`h-12 w-10 md:w-full md:h-16 mx-auto rounded-xl flex items-center justify-center text-sm md:text-base font-bold cursor-pointer transition-all border ${borderColor} ${record ? 'shadow-lg hover:scale-105 z-10' : 'hover:bg-slate-100'} ${bgColor}`}
            >
                {day}
            </div>
        );
    }
    return days;
  };

  return (
    <div className="p-6 md:p-10 min-h-full max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-10">
        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
            <Calendar className="w-7 h-7" />
        </div>
        <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">Kalender Kehadiran</h1>
            <p className="text-sm font-medium text-slate-500">Pantau riwayat absensi harian kamu.</p>
        </div>
      </div>

      <div className="rounded-[2.5rem] p-6 md:p-10 shadow-2xl mb-10 border bg-white border-slate-100 shadow-slate-200/40 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50"></div>
        
        <div className="relative z-10">
            <div className="flex justify-between items-center mb-10">
                <button onClick={prevMonth} className="p-3 rounded-2xl transition-all hover:bg-slate-50 text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-100">
                    <ChevronLeft className="w-7 h-7" />
                </button>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">
                    {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </h2>
                <button onClick={nextMonth} className="p-3 rounded-2xl transition-all hover:bg-slate-50 text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-100">
                    <ChevronRight className="w-7 h-7" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-y-6 text-center mb-8">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                    <div key={d} className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">{d}</div>
                ))}
            </div>
            
            <div className="grid grid-cols-7 gap-y-4 gap-x-3 md:gap-6">
                {renderCalendarDays()}
            </div>
            
            <div className="mt-12 flex justify-center gap-8 text-xs font-black uppercase tracking-widest text-slate-400 flex-wrap">
                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-lg bg-emerald-500 shadow-lg shadow-emerald-200"></div> Hadir</div>
                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-lg bg-blue-500 shadow-lg shadow-blue-200"></div> Sakit</div>
                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-lg bg-amber-500 shadow-lg shadow-amber-200"></div> Izin</div>
                <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-lg bg-rose-500 shadow-lg shadow-rose-200"></div> Alpa</div>
            </div>
        </div>
      </div>
      
      {/* Detail Modal (Recipe 7: Atmospheric) */}
      {selectedDateDetails && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-end md:items-center justify-center md:p-6 animate-in fade-in duration-300">
              <div className="w-full md:max-w-md rounded-t-[3rem] md:rounded-[3rem] p-2 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 overflow-hidden bg-white">
                   <div className="p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black tracking-tighter text-slate-900">Detail Absensi</h3>
                            <button onClick={() => setSelectedDateDetails(null)} className="p-3 rounded-2xl transition-all bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-rose-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        {/* Status Card (Recipe 7: Atmospheric) */}
                        <div className={`p-10 rounded-[2.5rem] mb-8 text-center text-white shadow-2xl relative overflow-hidden group
                            ${selectedDateDetails.status === 'Hadir' ? 'bg-emerald-600 shadow-emerald-200' : 
                            selectedDateDetails.status === 'Sakit' ? 'bg-blue-600 shadow-blue-200' : 
                            selectedDateDetails.status === 'Izin' ? 'bg-amber-600 shadow-amber-200' : 'bg-rose-600 shadow-rose-200'
                            }
                        `}>
                            {/* Animated Background Mesh */}
                            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_50%_0%,white,transparent_70%)]"></div>
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mb-6 ring-4 ring-white/10 shadow-xl">
                                    {selectedDateDetails.status === 'Hadir' ? <CheckCircle2 className="w-10 h-10" strokeWidth={3} /> : 
                                    selectedDateDetails.status === 'Sakit' ? <Info className="w-10 h-10" strokeWidth={3} /> :
                                    selectedDateDetails.status === 'Izin' ? <FileText className="w-10 h-10" strokeWidth={3} /> :
                                    <X className="w-10 h-10" strokeWidth={3} />}
                                </div>
                                <h4 className="text-4xl font-black uppercase tracking-tighter mb-2">{selectedDateDetails.status}</h4>
                                <p className="text-white/80 font-bold text-sm uppercase tracking-widest">
                                    {new Date(selectedDateDetails.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Details Grid (Bento Style) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-6 rounded-[2rem] border-2 bg-slate-50/50 border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="p-3.5 rounded-2xl shadow-lg bg-white text-indigo-600">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Waktu Masuk</p>
                                        <p className="font-black text-xl text-slate-900 tracking-tight">
                                            {selectedDateDetails.time} <span className="text-xs text-slate-400 font-bold ml-1">WIB</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-[2rem] border-2 bg-slate-50/50 border-slate-100">
                                <div className="flex items-start gap-4">
                                    <div className="p-3.5 rounded-2xl shadow-lg bg-white text-indigo-600">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Keterangan</p>
                                        <p className="font-bold leading-relaxed text-sm text-slate-900">
                                            {selectedDateDetails.details || 'Tidak ada keterangan tambahan.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <button onClick={() => setSelectedDateDetails(null)} className="w-full mt-10 py-5 font-black rounded-[2rem] text-xs uppercase tracking-[0.2em] transition-all shadow-2xl bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-indigo-200">
                            Tutup Detail
                        </button>
                   </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default HistoryView;