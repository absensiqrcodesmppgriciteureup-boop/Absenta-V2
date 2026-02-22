import React, { useState } from 'react';
import { LayoutDashboard, LogOut, MessageSquare, School, Users, Settings } from 'lucide-react';
import { useAuth } from '../../App';
import AspirationDashboard from '../osis/AspirationDashboard'; // Reuse for now

const OperatorLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users'>('dashboard');
  const { logout, user } = useAuth();

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 text-white flex flex-col z-20 shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/50">
            <School className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white leading-tight">
              Operator<br/>
              <span className="text-slate-400 text-sm font-medium">System Admin</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            Pantau Aspirasi
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'users' 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            Data Pengguna
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img 
              src={user?.photo} 
              alt={user?.name} 
              className="w-10 h-10 rounded-full border-2 border-indigo-500 shadow-sm object-cover"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-white">{user?.name}</p>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Administrator</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-700 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" /> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto bg-slate-100 relative custom-scrollbar">
        {activeTab === 'dashboard' && (
          <div className="p-6">
             <AspirationDashboard />
          </div>
        )}
        {activeTab === 'users' && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Settings className="w-16 h-16 mb-4 opacity-20" />
            <p className="font-bold text-lg">Manajemen Pengguna</p>
            <p className="text-sm">Fitur ini akan segera hadir.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default OperatorLayout;
