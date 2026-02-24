import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api, MOCK_USERS } from '../../services/mockData';
import { UserX, UserCheck, Clock, TrendingUp, Award } from 'lucide-react';
import { AttendanceRecord } from '../../types';

import AspirationDashboard from '../osis/AspirationDashboard';

const DashboardView: React.FC = () => {
  const [todaysRecords, setTodaysRecords] = useState<AttendanceRecord[]>([]);

  const loadData = async () => {
      const allRecords = await api.getAttendance();
      
      // Filter records for TODAY (Real-time Local)
      const todayStr = new Date().toLocaleDateString('en-CA');
      const todayData = allRecords.filter(r => r.date === todayStr);

      setTodaysRecords(todayData);
  };

  useEffect(() => {
      loadData();
      const interval = setInterval(loadData, 3000); // Faster polling for real-time feel
      return () => clearInterval(interval);
  }, []);

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
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Absensi</h2>
            <p className="text-slate-500 mt-2 font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Data • {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        
        {/* Left Column: Aspiration Dashboard (Replaces Approval Queue) */}
        <div className="xl:col-span-2 space-y-8">
            <AspirationDashboard embedded={true} />
            
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