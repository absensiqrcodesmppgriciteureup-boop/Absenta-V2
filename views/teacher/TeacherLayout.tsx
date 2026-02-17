import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Users, LogOut, School, ChevronRight, Bell } from 'lucide-react';
import { useAuth } from '../../App';
import DashboardView from './DashboardView';
import StudentsView from './StudentsView';
import { api } from '../../services/mockData';

const TeacherLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students'>('dashboard');
  const { logout, user } = useAuth();
  const [notifCount, setNotifCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevCountRef = useRef(0);

  useEffect(() => {
    // Poll for notifications
    const checkNotifs = async () => {
        const notifs = await api.getNotifications();
        const currentCount = notifs.filter(n => !n.isRead).length;

        // Trigger animation if count increases
        if (currentCount > prevCountRef.current) {
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 1500); // Animate for 1.5s
        }

        setNotifCount(currentCount);
        prevCountRef.current = currentCount;
    };
    checkNotifs();
    const interval = setInterval(checkNotifs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col shadow-sm z-10">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-primary-600 p-2.5 rounded-xl text-white shadow-lg shadow-primary-200">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-lg tracking-tight leading-tight">SMP PGRI<br/>Citeureup</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
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
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user?.photo} className="w-10 h-10 rounded-full bg-slate-200 object-cover ring-2 ring-white shadow-sm" alt="Profile" />
            <div className="overflow-hidden">
                <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 font-medium">Administrator / Operator</p>
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
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center z-20 shadow-sm">
             <div className="flex items-center gap-2">
                <div className="bg-primary-600 p-1.5 rounded text-white">
                    <School className="w-4 h-4" />
                </div>
                <span className="font-bold text-slate-900">SMP PGRI Citeureup</span>
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

        {/* Mobile Tab Switcher */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2">
            <div className="flex gap-4">
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
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 scroll-smooth">
          {activeTab === 'dashboard' ? <DashboardView /> : <StudentsView />}
        </div>
      </main>
    </div>
  );
};

export default TeacherLayout;