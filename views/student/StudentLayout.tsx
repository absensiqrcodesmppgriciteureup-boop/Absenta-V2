import React, { useState } from 'react';
import { Home, Calendar, PlusCircle, LogOut, Award, School, LayoutDashboard, ShoppingBag, Settings, Crown, Gem, MessageSquare } from 'lucide-react';
import { useAuth } from '../../App';
import HomeView from './HomeView';
import PermitView from './PermitView';
import HistoryView from './HistoryView';
import LeaderboardView from './LeaderboardView';
import RewardShopView from './RewardShopView';
import SettingsView from './SettingsView';
import AspirationView from './AspirationView';
import AvatarFrame from '../../components/AvatarFrame';

type Tab = 'home' | 'permit' | 'history' | 'leaderboard' | 'shop' | 'settings' | 'aspiration';

const StudentLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const { logout, user } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeView onChangeTab={setActiveTab} />;
      case 'permit': return <PermitView onBack={() => setActiveTab('home')} />;
      case 'history': return <HistoryView />;
      case 'leaderboard': return <LeaderboardView />;
      case 'shop': return <RewardShopView />;
      case 'settings': return <SettingsView />;
      case 'aspiration': return <AspirationView />;
      default: return <HomeView onChangeTab={setActiveTab} />;
    }
  };

  // Theme Logic
  const activeTheme = user?.theme || 'blue';
  
  // Mapping for Sidebar colors based on theme
  const themeColors: Record<string, string> = {
      blue: 'bg-primary-600 shadow-primary-200',
      emerald: 'bg-emerald-600 shadow-emerald-200',
      rose: 'bg-rose-600 shadow-rose-200',
      amber: 'bg-amber-600 shadow-amber-200',
      violet: 'bg-violet-600 shadow-violet-200'
  };

  const activeColorClass = themeColors[activeTheme] || themeColors['blue'];
  const activeTextClass = activeTheme === 'blue' ? 'text-primary-600' : 
                          activeTheme === 'emerald' ? 'text-emerald-600' :
                          activeTheme === 'rose' ? 'text-rose-600' :
                          activeTheme === 'amber' ? 'text-amber-600' : 'text-violet-600';

  const activeBgClass = activeTheme === 'blue' ? 'bg-primary-50' : 
                        activeTheme === 'emerald' ? 'bg-emerald-50' :
                        activeTheme === 'rose' ? 'bg-rose-50' :
                        activeTheme === 'amber' ? 'bg-amber-50' : 'bg-violet-50';

  return (
    <div className="h-screen w-full flex flex-col md:flex-row relative overflow-hidden transition-colors duration-500 bg-slate-50">
      
      {/* --- DESKTOP SIDEBAR (Visible on md+) --- */}
      <aside className="hidden md:flex flex-col w-72 border-r h-full z-20 bg-white border-slate-200">
        <div className="p-8 border-b flex items-center gap-3 border-slate-100">
          <div className={`p-2.5 rounded-xl text-white shadow-lg transition-colors duration-500 ${activeColorClass}`}>
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight leading-tight text-slate-900">SMP PGRI<br/>Citeureup</h1>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            <SidebarButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<LayoutDashboard size={20} />} label="Dashboard" activeClass={activeColorClass} />
            <SidebarButton active={activeTab === 'aspiration'} onClick={() => setActiveTab('aspiration')} icon={<MessageSquare size={20} />} label="Aspirasi Digital" activeClass={activeColorClass} />
            <SidebarButton active={activeTab === 'shop'} onClick={() => setActiveTab('shop')} icon={<ShoppingBag size={20} />} label="Reward Shop" activeClass={activeColorClass} />
            <SidebarButton active={activeTab === 'permit'} onClick={() => setActiveTab('permit')} icon={<PlusCircle size={20} />} label="Ajukan Izin" activeClass={activeColorClass} />
            <SidebarButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={<Calendar size={20} />} label="Riwayat Absen" activeClass={activeColorClass} />
            <SidebarButton active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} icon={<Award size={20} />} label="Peringkat" activeClass={activeColorClass} />
            <SidebarButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings size={20} />} label="Pengaturan" activeClass={activeColorClass} />
        </nav>

        <div className="p-6 border-t mt-auto border-slate-100 bg-slate-50/50">
             <div className="flex items-center gap-3 mb-4 px-2">
                <div className="relative flex-shrink-0">
                    <AvatarFrame src={user?.photo || ''} borderId={user?.border} size="sm" />
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-bold truncate text-slate-900">{user?.name}</p>
                    <p className="text-xs font-medium text-slate-500">{user?.nis}</p>
                </div>
            </div>
            <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border rounded-xl text-sm font-bold transition-colors border-rose-200 text-rose-600 hover:bg-rose-50">
                <LogOut className="w-4 h-4" /> Keluar
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 h-full overflow-y-auto pb-24 md:pb-0 w-full relative custom-scrollbar">
        {renderContent()}
      </main>

      {/* --- MOBILE BOTTOM NAVIGATION (Hidden on md+) --- */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 backdrop-blur-xl border rounded-2xl p-2 flex justify-between items-center z-50 max-w-md mx-auto shadow-2xl bg-white/90 border-white/50 shadow-slate-200/50">
        <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={<Home className="w-6 h-6" />} 
            label="Home"
            activeTextClass={activeTextClass}
            activeBgClass={activeBgClass}
        />
        <NavButton 
            active={activeTab === 'aspiration'} 
            onClick={() => setActiveTab('aspiration')} 
            icon={<MessageSquare className="w-6 h-6" />} 
            label="Aspirasi" 
            activeTextClass={activeTextClass}
            activeBgClass={activeBgClass}
        />
        <NavButton 
            active={activeTab === 'shop'} 
            onClick={() => setActiveTab('shop')} 
            icon={<ShoppingBag className="w-6 h-6" />} 
            label="Shop" 
            activeTextClass={activeTextClass}
            activeBgClass={activeBgClass}
        />
        <NavButton 
            active={activeTab === 'permit'} 
            onClick={() => setActiveTab('permit')} 
            icon={<PlusCircle className="w-6 h-6" />} 
            label="Izin" 
            activeTextClass={activeTextClass}
            activeBgClass={activeBgClass}
        />
        <NavButton 
            active={activeTab === 'leaderboard'} 
            onClick={() => setActiveTab('leaderboard')} 
            icon={<Award className="w-6 h-6" />} 
            label="Rank" 
            activeTextClass={activeTextClass}
            activeBgClass={activeBgClass}
        />
        <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            icon={<Settings className="w-6 h-6" />} 
            label="Set" 
            activeTextClass={activeTextClass}
            activeBgClass={activeBgClass}
        />
      </div>
    </div>
  );
};

// Components

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string, activeTextClass: string, activeBgClass: string }> = ({ active, onClick, icon, label, activeTextClass, activeBgClass }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${active ? `${activeTextClass} ${activeBgClass} scale-105 shadow-inner` : 'text-slate-400 hover:text-slate-600'}`}
  >
    {icon}
    <span className={`text-[10px] font-bold mt-1 ${active ? 'opacity-100' : 'opacity-0 hidden'}`}>{label}</span>
  </button>
);

const SidebarButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string, activeClass: string }> = ({ active, onClick, icon, label, activeClass }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 ${active ? `${activeClass} text-white shadow-lg` : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
    >
        {icon}
        {label}
    </button>
);

export default StudentLayout;