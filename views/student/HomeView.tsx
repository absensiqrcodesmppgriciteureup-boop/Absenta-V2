import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../App';
import { MOCK_ANNOUNCEMENTS, MOCK_SCHEDULE, api, calculateLevel, getNextLevelProgress } from '../../services/mockData';
import { Clock, Trophy, AlertCircle, BookOpen, CalendarDays, RefreshCw, Sparkles, MapPin, CheckCircle2, XCircle, Info, Loader2, Star, Timer } from 'lucide-react';
import { AttendanceRecord, AttendanceStatus } from '../../types';

const HomeView: React.FC<{onChangeTab?: (tab: any) => void}> = ({onChangeTab}) => {
  const { user, refreshUser } = useAuth(); 
  // === REAL TIME MODE ===
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [todayStatus, setTodayStatus] = useState<AttendanceStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  
  // STATS
  const [realtimeXP, setRealtimeXP] = useState(user?.xp || 0);
  const [realtimeLevel, setRealtimeLevel] = useState(user?.level || 1);
  const [levelProgress, setLevelProgress] = useState({ percent: 0, needed: 0, nextXp: 0 });
  
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Normal Clock Tick
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    const processData = (records: AttendanceRecord[]) => {
        const myRecords = records.filter(r => r.userId === user?.uid && r.status !== 'Pending');
        
        // Calculate Stats & XP Locally
        const total = myRecords.length;
        const present = myRecords.filter(r => r.status === 'Hadir').length;
        const calculatedPercentage = total > 0 ? Math.round((present / total) * 100) : 0;
        
        let xp = 0;
        myRecords.forEach(r => {
            if (r.status === 'Hadir') xp += 10;
            else if (r.status === 'Sakit' || r.status === 'Izin') xp += 5;
        });

        // Calculate Level Dynamic
        const level = calculateLevel(xp);
        const progress = getNextLevelProgress(xp);

        setAttendancePercentage(calculatedPercentage);
        setRealtimeXP(xp);
        setRealtimeLevel(level);
        setLevelProgress(progress);

        // Today Status
        const todayStr = new Date().toLocaleDateString('en-CA');
        // Find any record for today, including Pending if exists in merged data
        const todayRecord = records.find(r => r.userId === user?.uid && r.date === todayStr);
        setTodayStatus(todayRecord ? todayRecord.status : null);
        
        // Sync context if needed (and if not loading)
        if (user && (xp !== user.xp || level !== user.level)) {
             refreshUser();
        }
    };

    // LOAD DATA STRATEGY: LOCAL FIRST (INSTANT), THEN SYNC
    const loadData = async () => {
        if (user?.uid) {
            // 1. INSTANT: Load Local Data
            const localRecords = api.getLocalAttendance();
            if (localRecords.length > 0) {
                 processData(localRecords);
                 setIsLoadingStatus(false); 
            }

            // 2. BACKGROUND: Sync with Cloud
            // If local was empty, we are still loading. If local had data, we are just refreshing.
            const allRecords = await api.getAttendance();
            processData(allRecords);
            setIsLoadingStatus(false);
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
    <div className="p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header with Greeting */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-slate-500 font-bold text-sm mb-1 tracking-wide uppercase">Student Dashboard</p>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
            Halo, <span className="text-primary-600">{user?.name?.split(' ')[0]}</span>!
          </h1>
        </div>
        <div className="bg-white border border-slate-200 pl-2 pr-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
           <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2 rounded-xl text-white shadow-lg shadow-amber-200">
             <Trophy className="w-5 h-5" />
           </div>
           <div className="flex flex-col items-start">
               <span className="text-xs font-bold text-slate-400">Total XP</span>
               <span className="text-lg font-black text-slate-800 leading-none">{realtimeXP}</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column (Desktop: 2/3) */}
        <div className="lg:col-span-2 space-y-8">
             {/* Enhanced Time Card */}
            <div className="relative w-full overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-primary-900/20 group">
                {/* Animated Background Mesh */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#3b82f6,transparent_70%)] opacity-40 group-hover:opacity-60 transition-opacity duration-700"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <div className="flex items-baseline justify-center md:justify-start gap-1 font-sans">
                            <h2 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300 drop-shadow-sm">
                                {formatTime(currentTime)}
                            </h2>
                            <span className="text-xl md:text-2xl font-bold text-slate-400 w-8">{formatSeconds(currentTime)}</span>
                        </div>
                        <p className="text-indigo-200 text-lg font-medium tracking-wide mt-2 flex items-center justify-center md:justify-start gap-2">
                            <CalendarDays className="w-5 h-5" /> {formatDate(currentTime)}
                        </p>
                    </div>

                    {/* DYNAMIC STATUS CARD */}
                    <div className={`p-6 rounded-2xl border max-w-xs transition-all duration-500 ${statusConfig.bg}`}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                                {statusConfig.icon}
                            </div>
                            <span className={`font-bold text-sm ${statusConfig.titleColor}`}>{statusConfig.title}</span>
                        </div>
                        <p className={`text-xs leading-relaxed ${statusConfig.descColor}`}>
                            {statusConfig.desc}
                        </p>
                    </div>
                </div>
            </div>

             {/* Timeline Schedule */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-primary-600" />
                        Timeline Jadwal
                    </h3>
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full">Hari Ini</span>
                </div>
                <div className="space-y-0 relative">
                    {/* Vertical Line - Centered at 2rem (left-8) */}
                    <div className="absolute left-8 top-6 bottom-6 w-0.5 bg-slate-100 -translate-x-1/2"></div>

                    {MOCK_SCHEDULE.map((item, idx) => {
                        const now = new Date();
                        const currentMinutes = now.getHours() * 60 + now.getMinutes();
                        const [endH, endM] = item.time.split(' - ')[1].split(':').map(Number);
                        const endMinutes = endH * 60 + endM;
                        
                        const isPast = currentMinutes > endMinutes;
                        const active = isNow(item.time);
                        
                        return (
                            <div key={item.id} className="relative pl-20 py-3 group">
                                {/* Bullet Point - Centered at 2rem (left-8) */}
                                <div className={`absolute left-8 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-[3px] z-10 transition-all duration-300 flex items-center justify-center
                                    ${active 
                                        ? 'border-primary-600 bg-white ring-4 ring-primary-100 scale-125' 
                                        : isPast 
                                            ? 'border-emerald-500 bg-emerald-500 scale-100' 
                                            : 'border-slate-200 bg-slate-50'
                                    }`}>
                                    {isPast && <CheckCircle2 className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                                </div>
                                
                                <div className={`p-4 rounded-2xl border transition-all duration-300 
                                    ${active 
                                        ? 'bg-primary-50 border-primary-200 translate-x-2 shadow-sm' 
                                        : isPast 
                                            ? 'bg-slate-50/50 border-slate-100 opacity-70 hover:opacity-100' 
                                            : 'bg-white border-slate-100 hover:border-slate-300'
                                    }`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`font-bold text-lg ${active ? 'text-primary-700' : isPast ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-800'}`}>{item.subject}</h4>
                                            <p className="text-sm text-slate-500 font-medium mt-1 flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" /> {item.time}
                                            </p>
                                        </div>
                                        <div className="px-3 py-1 rounded-lg bg-white border border-slate-100 text-xs font-bold text-slate-500 flex items-center gap-1 shadow-sm">
                                            <MapPin className="w-3 h-3" /> {item.room}
                                        </div>
                                    </div>
                                    {active && (
                                        <div className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-primary-600 animate-pulse">
                                            <span className="w-2 h-2 rounded-full bg-primary-600"></span> Sedang Berlangsung
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
            {/* Stats Grid */}
            <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CalendarDays className="w-5 h-5 text-primary-600" />
                    Statistik Bulan Ini
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-primary-600 mb-4 group-hover:scale-110 transition-transform">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-4xl font-black text-slate-900 tracking-tight">{attendancePercentage}<span className="text-lg text-slate-400 ml-1">%</span></p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">Kehadiran</p>
                        </div>
                    </div>
                    {/* LEVEL CARD - UPDATED */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-lg transition-all group relative overflow-hidden">
                        <div className="relative z-10">
                             <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                    <Star className="w-6 h-6" fill="currentColor" />
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-indigo-400 font-bold tracking-wider uppercase block">Next Level</span>
                                    <span className="text-lg font-black text-slate-300">-{levelProgress.needed} XP</span>
                                </div>
                             </div>
                            <div>
                                <p className="text-4xl font-black text-slate-900 tracking-tight">{realtimeLevel}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Level Siswa</p>
                                
                                {/* Progress Bar */}
                                <div className="mt-4 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                                        style={{ width: `${levelProgress.percent}%` }}
                                    ></div>
                                </div>
                                <div className="mt-1 flex justify-between text-[10px] font-bold text-slate-400">
                                    <span>{realtimeXP} XP</span>
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
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-primary-600" />
                        Pengumuman
                    </h3>
                </div>
                
                <div className="relative overflow-hidden rounded-3xl shadow-xl shadow-slate-200/50 bg-white border border-slate-100 h-[280px]">
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
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-indigo-500"></div>
                                <span className={`self-start inline-block px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase mb-4 ${
                                    item.priority === 'high' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                                }`}>
                                    {item.priority === 'high' ? 'Penting' : 'Info'}
                                </span>
                                
                                <h4 className="font-bold text-slate-900 text-xl mb-3 leading-snug">
                                    {item.title}
                                </h4>
                                <p className="text-sm text-slate-500 leading-relaxed line-clamp-4">
                                    {item.content}
                                </p>

                                <div className="mt-auto flex items-center gap-2 text-xs font-bold text-slate-400">
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
                                className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? 'w-6 bg-primary-600' : 'w-1.5 bg-slate-200'}`}
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