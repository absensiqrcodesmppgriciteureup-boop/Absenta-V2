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
  const isPremium = user?.isPremium;

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
            bg: isPremium ? 'bg-black/40 border-white/10' : 'bg-slate-900/40 backdrop-blur-md border-white/10',
            icon: <Loader2 className="w-5 h-5 text-white/50 animate-spin" />,
            title: 'Memuat Status...',
            titleColor: 'text-white/70',
            desc: 'Sedang menyinkronkan data...',
            descColor: 'text-white/50'
        };
    }

    if (todayStatus === 'Hadir') {
        return {
            bg: isPremium ? 'bg-emerald-950/50 border-emerald-500/30' : 'bg-emerald-600/20 backdrop-blur-md border-emerald-500/30',
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
            title: 'Hadir Tepat Waktu',
            titleColor: 'text-emerald-100',
            desc: 'Kehadiranmu sudah tercatat di server sekolah hari ini.',
            descColor: 'text-emerald-200/80'
        };
    }
    if (todayStatus === 'Sakit' || todayStatus === 'Izin') {
        return {
            bg: isPremium ? 'bg-blue-950/50 border-blue-500/30' : 'bg-blue-600/20 backdrop-blur-md border-blue-500/30',
            icon: <Info className="w-5 h-5 text-blue-400" />,
            title: `Status: ${todayStatus}`,
            titleColor: 'text-blue-100',
            desc: 'Izinmu telah diverifikasi dan dicatat oleh sistem.',
            descColor: 'text-blue-200/80'
        };
    }
    if (todayStatus === 'Alpa') {
         return {
            bg: isPremium ? 'bg-rose-950/50 border-rose-500/30' : 'bg-rose-600/20 backdrop-blur-md border-rose-500/30',
            icon: <XCircle className="w-5 h-5 text-rose-400" />,
            title: 'Alpa / Tanpa Keterangan',
            titleColor: 'text-rose-100',
            desc: 'Segera hubungi wali kelas jika ada kesalahan.',
            descColor: 'text-rose-200/80'
        };
    }
    if (todayStatus === 'Pending') {
         return {
            bg: isPremium ? 'bg-slate-800/50 border-slate-500/30' : 'bg-slate-700/60 backdrop-blur-md border-slate-500/30',
            icon: <Timer className="w-5 h-5 text-slate-300" />,
            title: 'Menunggu Verifikasi',
            titleColor: 'text-slate-100',
            desc: 'Pengajuan izinmu sedang diperiksa oleh guru.',
            descColor: 'text-slate-300/80'
        };
    }
    // Default: Belum Absen
    return {
        bg: isPremium ? 'bg-amber-950/50 border-amber-500/30' : 'bg-amber-600/20 backdrop-blur-md border-amber-500/30',
        icon: <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />,
        title: 'Belum Absen Hari Ini',
        titleColor: 'text-amber-100',
        desc: 'Silakan tempel kartu atau lapor ke piket sekarang.',
        descColor: 'text-amber-200/80'
    };
  };

  const statusConfig = renderStatusCard();

  return (
    <div className={`p-6 md:p-10 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto min-h-full ${isPremium ? 'bg-slate-950 text-white' : ''}`}>
      {/* Header with Greeting */}
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
              {isPremium && (
                  <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 shadow-lg shadow-amber-500/20 tracking-wider uppercase">
                      <Crown className="w-3 h-3" fill="currentColor" /> Premium Member
                  </span>
              )}
              {!isPremium && <p className="text-slate-500 font-bold text-sm tracking-wide uppercase">Student Dashboard</p>}
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
                 {isPremium && (
                     <div className="absolute -top-2 -right-2 bg-gradient-to-br from-amber-300 to-yellow-600 text-white p-1 rounded-full border-2 border-slate-900 shadow-xl z-10 animate-pulse">
                         <Gem className="w-3 h-3" fill="white" />
                     </div>
                 )}
             </div>
             <div>
                <h1 className={`text-2xl md:text-4xl font-black tracking-tight ${isPremium ? 'bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400' : 'text-slate-900'}`}>
                    Halo, <span className={isPremium ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' : themeTextClass}>{user?.name?.split(' ')[0]}</span>!
                </h1>
                <p className={`${isPremium ? 'text-slate-400' : 'text-slate-400'} text-xs font-bold uppercase tracking-wider mt-1`}>
                    Level {user?.level} {isPremium ? '• VIP Scholar' : 'Scholar'}
                </p>
             </div>
          </div>
        </div>
        
        {/* XP CARD */}
        <div className={`hidden md:flex pl-2 pr-4 py-2 rounded-2xl items-center gap-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${isPremium ? 'bg-white/5 border border-white/10 backdrop-blur-md' : 'bg-white border border-slate-200'}`}>
           <div className={`p-2 rounded-xl text-white shadow-lg ${isPremium ? 'bg-gradient-to-br from-amber-400 to-yellow-600 shadow-amber-500/30' : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-200'}`}>
             <Trophy className="w-5 h-5" />
           </div>
           <div className="flex flex-col items-start">
               <span className={`text-xs font-bold ${isPremium ? 'text-slate-400' : 'text-slate-400'}`}>Sisa Poin</span>
               <span className={`text-lg font-black leading-none ${isPremium ? 'text-white' : 'text-slate-800'}`}>{netXp} XP</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Column (Desktop: 2/3) */}
        <div className="lg:col-span-2 space-y-8">
             {/* Enhanced Time Card */}
            <div className={`relative w-full overflow-hidden rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl group ${isPremium ? 'bg-slate-900 border border-amber-500/20' : 'bg-slate-900 shadow-primary-900/20'}`}>
                {/* Animated Background Mesh */}
                <div className={`absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700 ${isPremium ? 'bg-[radial-gradient(circle_at_50%_120%,#fbbf24,transparent_70%)]' : 'bg-[radial-gradient(circle_at_50%_120%,#3b82f6,transparent_70%)]'}`}></div>
                <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse ${isPremium ? 'bg-amber-500/10' : 'bg-indigo-500/20'}`}></div>
                
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <div className="flex items-baseline justify-center md:justify-start gap-1 font-sans">
                            <h2 className="text-6xl md:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-300 drop-shadow-sm">
                                {formatTime(currentTime)}
                            </h2>
                            <span className="text-xl md:text-2xl font-bold text-slate-400 w-8">{formatSeconds(currentTime)}</span>
                        </div>
                        <p className={`text-lg font-medium tracking-wide mt-2 flex items-center justify-center md:justify-start gap-2 ${isPremium ? 'text-amber-100/70' : 'text-indigo-200'}`}>
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
            <div className={`rounded-3xl p-6 md:p-8 border shadow-xl ${isPremium ? 'bg-slate-900 border-slate-800 shadow-black/50' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className={`text-xl font-bold flex items-center gap-2 ${isPremium ? 'text-white' : 'text-slate-900'}`}>
                        <BookOpen className={`w-6 h-6 ${isPremium ? 'text-amber-500' : themeTextClass}`} />
                        Timeline Jadwal
                    </h3>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${isPremium ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>Hari Ini</span>
                </div>
                <div className="space-y-0 relative">
                    {/* Vertical Line */}
                    <div className={`absolute left-8 top-6 bottom-6 w-0.5 -translate-x-1/2 ${isPremium ? 'bg-slate-800' : 'bg-slate-100'}`}></div>

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
                                        ? `${isPremium ? 'bg-amber-500 border-amber-300 ring-amber-900' : themeBgClass} bg-white ring-4 ${isPremium ? 'ring-slate-800' : 'ring-slate-200'} scale-125` 
                                        : isPast 
                                            ? 'border-emerald-500 bg-emerald-500 scale-100' 
                                            : isPremium ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'
                                    }`}>
                                    {isPast && <CheckCircle2 className="w-2.5 h-2.5 text-white" strokeWidth={4} />}
                                </div>
                                
                                <div className={`p-4 rounded-2xl border transition-all duration-300 
                                    ${active 
                                        ? isPremium ? 'bg-slate-800 border-amber-500/50 translate-x-2 shadow-lg shadow-amber-900/10' : 'bg-slate-50 border-slate-300 translate-x-2 shadow-sm' 
                                        : isPast 
                                            ? isPremium ? 'bg-slate-900/50 border-slate-800 opacity-60 hover:opacity-100' : 'bg-slate-50/50 border-slate-100 opacity-70 hover:opacity-100' 
                                            : isPremium ? 'bg-slate-900 border-slate-800 hover:border-slate-600' : 'bg-white border-slate-100 hover:border-slate-300'
                                    }`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className={`font-bold text-lg ${active ? (isPremium ? 'text-amber-400' : themeTextClass) : isPast ? 'text-slate-500 line-through decoration-slate-600' : (isPremium ? 'text-white' : 'text-slate-800')}`}>{item.subject}</h4>
                                            <p className={`text-sm font-medium mt-1 flex items-center gap-1 ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>
                                                <Clock className="w-3.5 h-3.5" /> {item.time}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm ${isPremium ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border border-slate-100 text-slate-500'}`}>
                                            <MapPin className="w-3 h-3" /> {item.room}
                                        </div>
                                    </div>
                                    {active && (
                                        <div className={`mt-3 inline-flex items-center gap-2 text-xs font-bold ${isPremium ? 'text-amber-400' : themeTextClass} animate-pulse`}>
                                            <span className={`w-2 h-2 rounded-full ${isPremium ? 'bg-amber-500' : themeBgClass}`}></span> Sedang Berlangsung
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
                <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${isPremium ? 'text-white' : 'text-slate-900'}`}>
                    <CalendarDays className={`w-5 h-5 ${isPremium ? 'text-amber-500' : themeTextClass}`} />
                    Statistik Bulan Ini
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between hover:shadow-lg transition-all group ${isPremium ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${isPremium ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 ' + themeTextClass}`}>
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className={`text-4xl font-black tracking-tight ${isPremium ? 'text-white' : 'text-slate-900'}`}>{attendancePercentage}<span className="text-lg text-slate-400 ml-1">%</span></p>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-2">Kehadiran</p>
                        </div>
                    </div>
                    {/* LEVEL CARD - PREMIUM EDITION */}
                    <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between hover:shadow-lg transition-all group relative overflow-hidden ${isPremium ? 'bg-gradient-to-br from-slate-900 to-slate-800 border-amber-500/30' : 'bg-white border-slate-100'}`}>
                        {isPremium && (
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent"></div>
                        )}
                        
                        {isPremium && (
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Crown className="w-24 h-24 text-amber-400" />
                            </div>
                        )}

                        <div className="relative z-10">
                             <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${isPremium ? 'bg-gradient-to-br from-amber-300 to-yellow-600 text-white shadow-lg shadow-amber-900/50' : 'bg-indigo-50 text-indigo-600'}`}>
                                    {isPremium ? <Crown className="w-6 h-6" fill="currentColor" /> : <Star className="w-6 h-6" fill="currentColor" />}
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-bold tracking-wider uppercase block ${isPremium ? 'text-amber-400' : 'text-indigo-400'}`}>Next Level</span>
                                    <span className="text-lg font-black text-slate-400">-{levelProgress.needed} XP</span>
                                </div>
                             </div>
                            <div>
                                <p className={`text-4xl font-black tracking-tight ${isPremium ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500' : 'text-slate-900'}`}>{user?.level || 1}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                                    {isPremium ? 'Premium Level' : 'Level Siswa'}
                                </p>
                                
                                {isPremium && (
                                    <div className="mt-2 text-[10px] font-bold text-amber-400 flex items-center gap-1 animate-pulse">
                                        <Zap className="w-3 h-3" fill="currentColor" /> 2x XP Booster Active
                                    </div>
                                )}

                                {/* Progress Bar */}
                                <div className={`mt-4 w-full h-2 rounded-full overflow-hidden ${isPremium ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <div 
                                        className={`h-full transition-all duration-1000 ease-out ${isPremium ? 'bg-gradient-to-r from-amber-400 to-yellow-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-indigo-500'}`} 
                                        style={{ width: `${levelProgress.percent}%` }}
                                    ></div>
                                </div>
                                <div className="mt-1 flex justify-between text-[10px] font-bold text-slate-500">
                                    <span>{user?.xp || 0} XP (Gross)</span>
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
                    <h3 className={`text-lg font-bold flex items-center gap-2 ${isPremium ? 'text-white' : 'text-slate-900'}`}>
                        <AlertCircle className={`w-5 h-5 ${isPremium ? 'text-amber-500' : themeTextClass}`} />
                        Pengumuman
                    </h3>
                </div>
                
                <div className={`relative overflow-hidden rounded-3xl shadow-xl h-[280px] ${isPremium ? 'bg-slate-900 border border-slate-800 shadow-black/50' : 'bg-white border border-slate-100 shadow-slate-200/50'}`}>
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
                                <div className={`absolute top-0 left-0 w-full h-1 ${isPremium ? 'bg-gradient-to-r from-amber-500 to-yellow-300' : themeBgClass}`}></div>
                                <span className={`self-start inline-block px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider uppercase mb-4 ${
                                    item.priority === 'high' 
                                    ? (isPremium ? 'bg-rose-900/50 text-rose-400 border border-rose-800' : 'bg-rose-50 text-rose-600 border border-rose-100')
                                    : (isPremium ? 'bg-blue-900/50 text-blue-400 border border-blue-800' : 'bg-blue-50 text-blue-600 border border-blue-100')
                                }`}>
                                    {item.priority === 'high' ? 'Penting' : 'Info'}
                                </span>
                                
                                <h4 className={`font-bold text-xl mb-3 leading-snug ${isPremium ? 'text-white' : 'text-slate-900'}`}>
                                    {item.title}
                                </h4>
                                <p className={`text-sm leading-relaxed line-clamp-4 ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>
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
                                className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx ? `w-6 ${isPremium ? 'bg-amber-500' : themeBgClass}` : 'w-1.5 bg-slate-600'}`}
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