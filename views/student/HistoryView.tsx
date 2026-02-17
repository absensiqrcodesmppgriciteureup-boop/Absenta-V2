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
    <div className="p-6 md:p-10 min-h-full max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Kalender Kehadiran</h1>

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 mb-6">
        <div className="flex justify-between items-center mb-8">
            <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                <ChevronRight className="w-6 h-6 text-slate-600" />
            </button>
        </div>

        <div className="grid grid-cols-7 gap-y-4 text-center mb-4 md:mb-6">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
                <div key={d} className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider">{d}</div>
            ))}
        </div>
        
        <div className="grid grid-cols-7 gap-y-3 gap-x-2 md:gap-4">
            {renderCalendarDays()}
        </div>
        
        <div className="mt-8 md:mt-12 flex justify-center gap-6 text-xs md:text-sm font-bold text-slate-500 flex-wrap">
            <div className="flex items-center gap-2"><div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-emerald-500"></div> Hadir</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-blue-500"></div> Sakit</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-amber-500"></div> Izin</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-rose-500"></div> Alpa</div>
        </div>
      </div>
      
      {/* Spacer to ensure scroll area exists if content is close to bottom nav */}
      <div className="h-10 md:hidden"></div>

      {/* Detail Modal */}
      {selectedDateDetails && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4 animate-in fade-in duration-200">
              <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-1 shadow-2xl animate-in slide-in-from-bottom duration-300 overflow-hidden">
                   <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900">Detail Kehadiran</h3>
                            <button onClick={() => setSelectedDateDetails(null)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        
                        {/* Status Card */}
                        <div className={`p-8 rounded-2xl mb-8 text-center text-white shadow-xl relative overflow-hidden group
                            ${selectedDateDetails.status === 'Hadir' ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-200' : 
                            selectedDateDetails.status === 'Sakit' ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-200' : 
                            selectedDateDetails.status === 'Izin' ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-amber-200' : 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-200'
                            }
                        `}>
                            {/* Decorative Circles */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-10 -mb-10 blur-xl"></div>

                            <div className="relative z-10 flex flex-col items-center">
                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 ring-4 ring-white/10">
                                    {selectedDateDetails.status === 'Hadir' ? <CheckCircle2 className="w-8 h-8" strokeWidth={3} /> : 
                                    selectedDateDetails.status === 'Sakit' ? <Info className="w-8 h-8" strokeWidth={3} /> :
                                    selectedDateDetails.status === 'Izin' ? <FileText className="w-8 h-8" strokeWidth={3} /> :
                                    <X className="w-8 h-8" strokeWidth={3} />}
                                </div>
                                <h4 className="text-3xl font-black uppercase tracking-tight mb-1">{selectedDateDetails.status}</h4>
                                <p className="opacity-90 font-medium text-sm">
                                    {new Date(selectedDateDetails.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-primary-600">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Waktu Masuk</p>
                                        <p className="font-bold text-slate-900 text-lg">
                                            {selectedDateDetails.time} <span className="text-xs text-slate-400 font-medium">WIB</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="flex items-start gap-3">
                                    <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100 text-primary-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Keterangan</p>
                                        <p className="font-bold text-slate-900 leading-relaxed text-sm">
                                            {selectedDateDetails.details || 'Tidak ada keterangan tambahan.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <button onClick={() => setSelectedDateDetails(null)} className="w-full mt-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-xl shadow-slate-200">
                            Tutup
                        </button>
                   </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default HistoryView;