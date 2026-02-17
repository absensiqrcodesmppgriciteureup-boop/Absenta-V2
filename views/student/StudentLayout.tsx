import React, { useState } from 'react';
import { Home, Calendar, PlusCircle, LogOut, Award, School, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../App';
import HomeView from './HomeView';
import PermitView from './PermitView';
import HistoryView from './HistoryView';
import LeaderboardView from './LeaderboardView';

type Tab = 'home' | 'permit' | 'history' | 'leaderboard';

const StudentLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { logout, user } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeView onChangeTab={setActiveTab} />;
      case 'permit': return <PermitView onBack={() => setActiveTab('home')} />;
      case 'history': return <HistoryView />;
      case 'leaderboard': return <LeaderboardView />;
      default: return <HomeView onChangeTab={setActiveTab} />;
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col md:flex-row relative overflow-hidden">
      
      {/* --- DESKTOP SIDEBAR (Visible on md+) --- */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-full z-20">
        <div className="p-8 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-primary-600 p-2.5 rounded-xl text-white shadow-lg shadow-primary-200">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-slate-900 text-lg tracking-tight leading-tight">SMP PGRI<br/>Citeureup</h1>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            <SidebarButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <SidebarButton active={activeTab === 'permit'} onClick={() => setActiveTab('permit')} icon={<PlusCircle size={20} />} label="Ajukan Izin" />
            <SidebarButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Calendar size={20} />} label="Riwayat Absen" />
            <SidebarButton active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={<Award size={20} />} label="Peringkat" />
        </nav>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50 mt-auto">
             <div className="flex items-center gap-3 mb-4 px-2">
                <img src={user?.photo} className="w-10 h-10 rounded-full bg-slate-200 object-cover ring-2 ring-white shadow-sm" alt="Profile" />
                <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 font-medium">{user?.nis}</p>
                </div>
            </div>
            <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 text-sm font-bold transition-colors">
                <LogOut className="w-4 h-4" /> Keluar
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 h-full overflow-y-auto pb-24 md:pb-0 w-full relative">
        {renderContent()}
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION (Hidden on md+) --- */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 bg-white/90 backdrop-blur-xl border border-white/50 shadow-xl shadow-slate-200/50 rounded-2xl p-2 flex justify-between items-center z-50 max-w-md mx-auto">
        <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={<Home className="w-6 h-6" />} 
            label="Home" 
        />
        <NavButton 
            active={activeTab === 'permit'} 
            onClick={() => setActiveTab('permit')} 
            icon={<PlusCircle className="w-6 h-6" />} 
            label="Izin" 
        />
        <NavButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={<Calendar className="w-6 h-6" />} 
            label="Riwayat" 
        />
        <NavButton 
            active={activeTab === 'leaderboard'} 
            onClick={() => setActiveTab('leaderboard')} 
            icon={<Award className="w-6 h-6" />} 
            label="Peringkat" 
        />
        <button 
            onClick={logout}
            className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 text-rose-400 hover:text-rose-600"
        >
            <LogOut className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// Components
const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${active ? 'text-primary-600 bg-primary-50 scale-105 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon}
    <span className={`text-[10px] font-bold mt-1 ${active ? 'opacity-100' : 'opacity-0 hidden'}`}>{label}</span>
  </button>
);

const SidebarButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${active ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
    >
        {icon}
        {label}
    </button>
);

export default StudentLayout;