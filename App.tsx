import React, { useState, useEffect, createContext, useContext } from 'react';
import { User } from './types';
import LoginView from './views/auth/LoginView';
import StudentLayout from './views/student/StudentLayout';
import TeacherLayout from './views/teacher/TeacherLayout';
import { Loader2, School } from 'lucide-react';
import { api } from './services/mockData';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

// --- SOUND EFFECT UTILITY (Web Audio API) ---
const playWelcomeSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        
        // Play a pleasant "Success" chord (C Major 7: C5, E5, G5, B5)
        const notes = [523.25, 659.25, 783.99, 987.77]; 
        const start = ctx.currentTime;
        
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            // Envelope for a bell-like sound
            gain.gain.setValueAtTime(0, start + (i * 0.05));
            gain.gain.linearRampToValueAtTime(0.1, start + (i * 0.05) + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, start + (i * 0.05) + 1.5);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(start + (i * 0.05));
            osc.stop(start + (i * 0.05) + 1.5);
        });
    } catch (e) {
        console.error("Audio play failed", e);
    }
};

// --- INTRO COMPONENT ---
const IntroOverlay: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    useEffect(() => {
        playWelcomeSound();
        const timer = setTimeout(onComplete, 2200); // 2.2 seconds duration
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center animate-out fade-out duration-500 fill-mode-forwards" style={{ animationDelay: '2s' }}>
            <div className="relative flex flex-col items-center">
                {/* Logo Animation */}
                <div className="w-24 h-24 bg-primary-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary-300 mb-6 animate-in zoom-in duration-700 ease-out">
                    <School className="w-12 h-12" />
                </div>
                
                {/* Text Animation */}
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300 fill-mode-backwards">
                    SMP PGRI <span className="text-primary-600">Citeureup</span>
                </h1>
                
                <p className="text-slate-400 font-medium tracking-wide animate-in slide-in-from-bottom-2 fade-in duration-700 delay-500 fill-mode-backwards">
                    Mempersiapkan Dashboard...
                </p>

                {/* Loading Spinner */}
                <div className="mt-8 animate-in fade-in duration-700 delay-700 fill-mode-backwards">
                     <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(false);

  // Check for saved session on mount
  useEffect(() => {
    const checkSession = () => {
        const savedUser = localStorage.getItem('absenta_session_user');
        if (savedUser) {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
            } catch (e) {
                console.error("Failed to parse session", e);
                localStorage.removeItem('absenta_session_user');
            }
        }
        setLoading(false);
    };
    
    checkSession();
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('absenta_session_user', JSON.stringify(newUser));
    // Trigger intro only on manual login
    setShowIntro(true);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('absenta_session_user');
    setShowIntro(false);
  };

  const refreshUser = async () => {
      if (!user) return;
      // Fetch fresh user data (XP, etc)
      const latestUser = await api.getUser(user.nis);
      if (latestUser) {
          // Preserve photo if it was set in session but maybe not in storage default?
          // Actually api.getUser returns full object.
          setUser(latestUser);
          localStorage.setItem('absenta_session_user', JSON.stringify(latestUser));
      }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 text-primary-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Memuat SMP PGRI Citeureup...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {showIntro && <IntroOverlay onComplete={() => setShowIntro(false)} />}
      
      {!user ? (
        <LoginView />
      ) : user.role === 'teacher' ? (
        <TeacherLayout />
      ) : (
        <StudentLayout />
      )}
    </AuthContext.Provider>
  );
};

export default App;