import React, { useState } from 'react';
import { LayoutDashboard, LogOut, MessageSquare, School, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../App';
import AspirationDashboard from './AspirationDashboard';

const OsisLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard'>('dashboard');
  const { logout, user } = useAuth();

  return (
    <div className="h-screen w-full flex bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col z-20 shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-slate-900 leading-tight">
              OSIS Panel<br/>
              <span className="text-indigo-600 text-sm font-medium">SMP PGRI Citeureup</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Aspirasi Siswa
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
              src={user?.photo || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
              alt={user?.name} 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-slate-900">{user?.name}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pengurus OSIS</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-rose-200 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-30 flex items-center justify-between px-4 shadow-sm">
         <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
              <School className="w-5 h-5" />
            </div>
            <span className="font-bold text-slate-900">OSIS Panel</span>
         </div>
         <div className="flex items-center gap-2">
            <img 
              src={user?.photo || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
              alt={user?.name} 
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
            />
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-50 relative custom-scrollbar pt-16 pb-20 md:pt-0 md:pb-0">
        {activeTab === 'dashboard' && <AspirationDashboard />}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 px-6 py-3 flex items-center justify-around shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${
            activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'
          }`}
        >
          <MessageSquare className={`w-6 h-6 ${activeTab === 'dashboard' ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-bold">Aspirasi</span>
        </button>
        
        <button 
          onClick={logout}
          className="flex flex-col items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] font-bold">Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default OsisLayout;
