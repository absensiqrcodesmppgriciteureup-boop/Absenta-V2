import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../App';
import { MOCK_ANNOUNCEMENTS, MOCK_SCHEDULE, api, calculateLevel, getNextLevelProgress } from '../../services/mockData';
import { Clock, Trophy, AlertCircle, BookOpen, CalendarDays, MapPin, CheckCircle2, XCircle, Info, Loader2, Star, Timer, Crown, Zap, Gem } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '../../types';
import AvatarFrame from '../../components/AvatarFrame';

const HomeView: React.FC<{onChangeTab?: (tab: any) => void}> = ({onChangeTab}) => {
  const { user, refreshUser } = useAuth(); 
  // === REAL TIME MODE ===
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [todayStatus, setTodayStatus] = useState<AttendanceStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  
  // STATS
  const [levelProgress, setLevelProgress] = useState({ percent: 0, needed: 0, nextXp: 0 });
  
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // NET XP CALCULATION
  const netXp = (user?.xp || 0) - (user?.spentXp || 0);

  // Theme Logic for Accents
  const activeTheme = user?.theme || 'blue';
  
  // Standard Classes
  const themeTextClass = activeTheme === 'blue' ? 'text-primary-600' : 
                         activeTheme === 'emerald' ? 'text-emerald-600' :
                         activeTheme === 'rose' ? 'text-rose-600' :
                         activeTheme === 'amber' ? 'text-amber-600' : 'text-violet-600';
  
  const themeBgClass = activeTheme === 'blue' ? 'bg-primary-600' : 
                       activeTheme === 'emerald' ? 'bg-emerald-600' :
                       activeTheme === 'rose' ? 'bg-rose-600' :
                       activeTheme === 'amber' ? 'bg-amber-600' : 'bg-violet-600';

  useEffect(() => {
    // Normal Clock Tick
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const processData = (records: AttendanceRecord[]) => {
        const myRecords = records.filter(r => r.userId === user?.uid && r.status !== 'Pending');
        
        // Calculate Stats
        const total = myRecords.length;
        const present = myRecords.filter(r => r.status === 'Hadir').length;
        const calculatedPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        // Progress bar uses GROSS XP
        const totalEarnedXp = user?.xp || 0; 
        const progress = getNextLevelProgress(totalEarnedXp);

        setAttendancePercentage(calculatedPercentage);
        setLevelProgress(progress);

        // Today Status
        const todayStr = new Date().toLocaleDateString('en-CA');
        const todayRecord = records.find(r => r.userId === user?.uid && r.date === todayStr);
        setTodayStatus(todayRecord ? todayRecord.status : null);
    };

    const loadData = async () => {
        if (user?.uid) {
            const localRecords = api.getLocalAttendance();
            if (localRecords.length > 0) {
                 processData(localRecords);
                 setIsLoadingStatus(false); 
            }
            const allRecords = await api.getAttendance();
            processData(allRecords);
            setIsLoadingStatus(false);
            
            // Refresh full user object
            await refreshUser();
        }
    };
    
    loadData();

    return () => clearInterval(timer);
  }, [user?.uid]);

  const isNow = (timeRange: string) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [start, end] = timeRange.split(' - ');
    if (!start || !end) return false;
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  };

  const nextSlide = () => setCurrentSlide(prev => (prev === MOCK_ANNOUNCEMENTS.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide(prev => (prev === 0 ? MOCK_ANNOUNCEMENTS.length - 1 : prev - 1));

  useEffect(() => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(nextSlide, 5000);
      return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [currentSlide]);

  const formatTime = (date: Date) => date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  const formatSeconds = (date: Date) => date.toLocaleTimeString('id-ID', { second: '2-digit' });
  const formatDate = (date: Date) => date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Status Card Config
  const renderStatusCard = () => {
    if (isLoadingStatus) {
        return {
            bg: 'bg-slate-900/40 backdrop-blur-md border-white/10',
            icon: <Loader2 className="w-5 h-5 text-white/50 animate-spin" />,
            title: 'Memuat Status...',
            titleColor: 'text-white/70',
            desc: 'Sedang menyinkronkan data...',
            descColor: 'text-white/50'
        };
    }

    if (todayStatus === 'Hadir') {
        return {
            bg: 'bg-emerald-600/20 backdrop-blur-md border-emerald-500/30',
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
            title: 'Hadir Tepat Waktu',
            titleColor: 'text-emerald-100',
            desc: 'Kehadiranmu sudah tercatat di server sekolah hari ini.',
            descColor: 'text-emerald-200/80'
        };
    }
    if (todayStatus === 'Sakit' || todayStatus === 'Izin') {
        return {
            bg: 'bg-blue-600/20 backdrop-blur-md border-blue-500/30',
            icon: <Info className="w-5 h-5 text-blue-400" />,
            title: `Status: ${todayStatus}`,
            titleColor: 'text-blue-100',
            desc: 'Izinmu telah diverifikasi dan dicatat oleh sistem.',
            descColor: 'text-blue-200/80'
        };
    }
    if (todayStatus === 'Alpa') {
        return {
            bg: 'bg-rose-600/20 backdrop-blur-md border-rose-500/30',
            icon: <XCircle className="w-5 h-5 text-rose-400" />,
            title: 'Alpa / Tanpa Keterangan',
            titleColor: 'text-rose-100',
            desc: 'Segera hubungi wali kelas jika ada kesalahan.',
            descColor: 'text-rose-200/80'
        };
    }
    if (todayStatus === 'Pending') {
        return {
            bg: 'bg-slate-700/60 backdrop-blur-md border-slate-500/30',
            icon: <Timer className="w-5 h-5 text-slate-300" />,
            title: 'Menunggu Verifikasi',
            titleColor: 'text-slate-100',
            desc: 'Pengajuan izinmu sedang diperiksa oleh guru.',
            descColor: 'text-slate-300/80'
        };
    }
    // Default: Belum Absen
    return {
        bg: 'bg-amber-600/20 backdrop-blur-md border-amber-500/30',
        icon: <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />,
        title: 'Belum Absen Hari Ini',
        titleColor: 'text-amber-100',
        desc: 'Silakan tempel kartu atau lapor ke piket sekarang.',
        descColor: 'text-amber-200/80'
    };
  };

  const statusConfig = renderStatusCard();

  return (
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto min-h-full">
      {/* Header with Greeting */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
              <p className="text-slate-500 font-bold text-sm tracking-wide uppercase">Student Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
             {/* Profile Pic with Custom Border */}
             <div className="pt-2 relative">
                 <AvatarFrame 
                    src={user?.photo || ''} 
                    borderId={user?.border} 
                    size="md" 
                    level={user?.level}
                 />
             </div>
             <div>
                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900">
                    Halo, <span className={themeTextClass}>{user?.name?.split(' ')[0]}</span>!
                </h1>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mt-1">
                    Level {user?.level} Scholar
                </p>
             </div>
          </div>
        </div>
        
        {/* XP CARD */}
        <div className="hidden md:flex pl-2 pr-4 py-2 rounded-2xl items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white border border-slate-200">
           <div className="p-2 rounded-xl text-white shadow-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200">
             <Trophy className="w-5 h-5" />
           </div>
           <div className="flex flex-col items-start">
               <span className="text-xs font-bold text-slate-400">Sisa Poin</span>
               <span className="text-lg font-black leading-none text-slate-800">{netXp} XP</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column (Desktop: 2/3) */}
        <div className="lg:col-span-2 space-y-8">
            {/* Enhanced Time Card */}
            <div className="relative w-full overflow-hidden rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl group bg-slate-900 shadow-primary-900/20 card-hover">
                {/* Animated Background Mesh (Recipe 7: Atmospheric) */}
                <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700 bg-[radial-gradient(circle_at_50%_30%,#3b82f6,transparent_60%),radial-gradient(circle_at_10%_80%,#6366f1,transparent_50%)]"></div>
                <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse bg-indigo-500/20"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <div className="flex items-baseline justify-center md:justify-start font-sans">
                            <h2 className="text-7xl md:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 drop-shadow-2xl">
                                {formatTime(currentTime)}
                            </h2>
                            <div className="w-0 overflow-visible flex items-baseline">
                                <span className="ml-3 md:ml-4 text-2xl md:text-3xl font-bold text-slate-500 w-12 tabular-nums">
                                    {formatSeconds(currentTime)}
                                </span>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center justify-center md:justify-start gap-2 text-indigo-200/80">
                            <CalendarDays className="w-5 h-5" />
                            <p className="text-lg font-medium tracking-wide">
                                {formatDate(currentTime)}
                            </p>
                        </div>
                    </div>

                    {/* DYNAMIC STATUS CARD (Glassmorphism) */}
                    <div className={`p-8 rounded-[2rem] border transition-all duration-500 glass-dark max-w-sm ${statusConfig.bg.replace('bg-', 'bg-opacity-20 bg-')}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                {statusConfig.icon}
                            </div>
                            <span className={`font-black text-lg tracking-tight ${statusConfig.titleColor}`}>{statusConfig.title}</span>
                        </div>
                        <p className={`text-sm leading-relaxed font-medium ${statusConfig.descColor}`}>
                            {statusConfig.desc}
                        </p>
                    </div>
                </div>
            </div>

             {/* Timeline Schedule */}
            <div className="rounded-3xl p-6 md:p-8 border shadow-xl bg-white border-slate-100 shadow-slate-200/50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900">
                        <BookOpen className={`w-6 h-6 ${themeTextClass}`} />
                        Timeline Jadwal
                    </h3>
                    <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-500">Hari Ini</span>
                </div>
                <div className="space-y-0 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-8 top-6 bottom-6 w-0.5 -translate-x-1/2 bg-slate-100"></div>

                    {MOCK_SCHEDULE.map((item, idx) => {
                        const now = new Date();
                        const currentMinutes = now.getHours() * 60 + now.getMinutes();
                        const [endH, endM] = item.time.split(' - ')[1].split(':').map(Number);
                        const endMinutes = endH * 60 + endM;
                        
                        const isPast = currentMinutes > endMinutes;
                        const active = isNow(item.time);
                        
                        return (
                            <div key={item.id} className="relative pl-20 py-3 group">
                                <div className={`absolute left-8 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-[3px] z-10 transition-all duration-300 flex items-center justify-center
                                    ${active 
                                        ? `${themeBgClass} bg-white ring-4 ring-slate-200 scale-125` 
                                        : isPast 
                                            ? 'border-emerald-500 bg-emerald-500 scale-100' 
                                            : 'border-slate-200 bg-slate-50'
                                    }`}>
                                    {isPast && <CheckCircle2 className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                                </div>
                                
                                <div className={`p-4 rounded-2xl border transition-all duration-300 
                                    ${active 
                                        ? 'bg-slate-50 border-slate-300 translate-x-2 shadow-sm' 
                                        : isPast 
                                            ? 'bg-slate-50/50 border-slate-100 opacity-70 hover:opacity-100' 
                                            : 'bg-white border-slate-100 hover:border-slate-300'
                                    }`}>
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                        <div>
                                            <h4 className={`font-bold text-lg leading-snug ${active ? themeTextClass : isPast ? 'text-slate-500 line-through decoration-slate-600' : 'text-slate-800'}`}>{item.subject}</h4>
                                            <p className="text-sm font-medium mt-1 flex items-center gap-1 text-slate-500">
                                                <Clock className="w-3.5 h-3.5" /> {item.time}
                                            </p>
                                        </div>
                                        <div className="self-start sm:self-auto px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm bg-white border border-slate-100 text-slate-500 whitespace-nowrap">
                                            <MapPin className="w-3 h-3" /> {item.room}
                                        </div>
                                    </div>
                                    {active && (
                                        <div className={`mt-3 inline-flex items-center gap-2 text-xs font-bold ${themeTextClass} animate-pulse`}>
                                            <span className={`w-2 h-2 rounded-full ${themeBgClass}`}></span> Sedang Berlangsung
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>

        {/* Right Column (Desktop: 1/3) */}
        <div className="lg:col-span-1 space-y-8">
            {/* Stats Grid (Bento Style) */}
            <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
                    <CalendarDays className={`w-5 h-5 ${themeTextClass}`} />
                    Statistik & Level
                </h3>
                <div className="grid grid-cols-1 gap-6">
                    <div className="p-8 rounded-[2rem] border shadow-sm flex flex-col justify-between hover:shadow-xl transition-all group bg-white border-slate-100 card-hover">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-blue-50 ${themeTextClass}`}>
                            <Clock className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-5xl font-black tracking-tighter text-slate-900">{attendancePercentage}<span className="text-xl text-slate-400 ml-1">%</span></p>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-3">Kehadiran Bulan Ini</p>
                        </div>
                    </div>
                    {/* LEVEL CARD */}
                    <div className="p-8 rounded-[2rem] border shadow-sm flex flex-col justify-between hover:shadow-xl transition-all group relative overflow-hidden bg-white border-slate-100 card-hover">
                        <div className="relative z-10">
                             <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform bg-indigo-50 text-indigo-600">
                                    <Star className="w-7 h-7" fill="currentColor" />
                                </div>
                                <div className="text-right">
                                    <span className="text-xs font-bold tracking-widest uppercase block text-indigo-400">Next Level</span>
                                    <span className="text-xl font-black text-slate-400">-{levelProgress.needed} XP</span>
                                </div>
                             </div>
                            <div>
                                <p className="text-5xl font-black tracking-tighter text-slate-900">Level {user?.level || 1}</p>
                                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-2">
                                    Pangkat Siswa
                                </p>
                                
                                {/* Progress Bar */}
                                <div className="mt-6 w-full h-3 rounded-full overflow-hidden bg-indigo-50">
                                    <div 
                                        className="h-full transition-all duration-1000 ease-out bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.5)]" 
                                        style={{ width: `${levelProgress.percent}%` }}
                                    ></div>
                                </div>
                                <div className="mt-2 flex justify-between text-xs font-bold text-slate-500">
                                    <span>{user?.xp || 0} XP</span>
                                    <span>{levelProgress.nextXp} XP</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

             {/* Enhanced Announcements */}
            <div className="pb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                        <AlertCircle className={`w-5 h-5 ${themeTextClass}`} />
                        Pengumuman
                    </h3>
                </div>
                
                <div className="relative overflow-hidden rounded-3xl shadow-xl h-[280px] bg-white border border-slate-100 shadow-slate-200/50">
                    <div 
                        className="flex transition-transform duration-500 ease-out h-full"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        onTouchStart={(e) => setTouchStart(e.targetTouches[0].clientX)}
                        onTouchMove={(e) => setTouchEnd(e.targetTouches[0].clientX)}
                        onTouchEnd={() => {
                            if (!touchStart || !touchEnd) return;
                            const distance = touchStart - touchEnd;
                            if (distance > 50) nextSlide();
                            if (distance < -50) prevSlide();
                            setTouchStart(0); setTouchEnd(0);
                        }}
                    >
                        {MOCK_ANNOUNCEMENTS.map((item) => (
                            <div key={item.id} className="w-full flex-shrink-0 p-8 flex flex-col relative">
                                <div className={`absolute top-0 left-0 w-full h-1 ${themeBgClass}`}></div>
                                <span className={`self-start inline-block px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase mb-4 ${
                                    item.priority === 'high' 
                                    ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                    : 'bg-blue-50 text-blue-600 border border-blue-100'
                                }`}>
                                    {item.priority === 'high' ? 'Penting' : 'Info'}
                                </span>
                                
                                <h4 className="font-bold text-xl mb-3 leading-snug text-slate-900">
                                    {item.title}
                                </h4>
                                <p className="text-sm leading-relaxed line-clamp-4 text-slate-500">
                                    {item.content}
                                </p>

                                <div className="mt-auto flex items-center gap-2 text-xs font-bold text-slate-500">
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    {new Date(item.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Indicators */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                        {MOCK_ANNOUNCEMENTS.map((_, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? `w-6 ${themeBgClass}` : 'w-1.5 bg-slate-600'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default HomeView;