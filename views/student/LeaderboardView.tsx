import React, { useEffect, useState } from 'react';
import { api } from '../../services/mockData';
import { User } from '../../types';
import { useAuth } from '../../App';
import { Trophy, Medal, Crown, Star } from 'lucide-react';
import AvatarFrame from '../../components/AvatarFrame';

const LeaderboardView: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const data = await api.getLeaderboard();
            setStudents(data);
            setLoading(false);
        };
        load();
    }, []);

    const calculateNetXp = (u: User) => (u.xp || 0) - (u.spentXp || 0);

    if (loading) return <div className="p-10 text-center text-slate-400">Memuat peringkat...</div>;

    return (
        <div className="p-6 md:p-10 h-full flex flex-col max-w-5xl mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 text-slate-900">
                    <Trophy className="w-7 h-7 text-amber-500" />
                    Peringkat Sekolah
                </h1>
                <p className="text-slate-500 text-sm">Siswa paling rajin (Berdasarkan sisa poin aktif).</p>
            </header>

            <div className="rounded-[2.5rem] border shadow-2xl overflow-hidden flex-1 flex flex-col bg-white border-slate-200 shadow-slate-200/40">
                <div className="overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-3">
                    {students.length === 0 ? (
                        <div className="p-20 text-center text-slate-400">Belum ada data peringkat.</div>
                    ) : (
                        students.map((student, index) => {
                            const isMe = student.uid === currentUser?.uid;
                            const rank = index + 1;
                            const netPoints = calculateNetXp(student);
                            
                            let rankIcon;
                            let rankClass = "bg-slate-50 text-slate-500";
                            
                            if (rank === 1) {
                                rankClass = "bg-amber-100 text-amber-600 ring-4 ring-amber-50";
                                rankIcon = <Crown className="w-5 h-5" />;
                            } else if (rank === 2) {
                                rankClass = "bg-slate-100 text-slate-500 ring-4 ring-slate-50";
                                rankIcon = <Medal className="w-5 h-5" />;
                            } else if (rank === 3) {
                                rankClass = "bg-orange-50 text-orange-600 ring-4 ring-orange-50/50";
                                rankIcon = <Medal className="w-5 h-5" />;
                            }

                            const cardClass = isMe 
                                ? 'bg-indigo-50/50 border-indigo-200 shadow-sm ring-2 ring-indigo-50' 
                                : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50 hover:shadow-md';

                            return (
                                <div 
                                    key={student.uid} 
                                    className={`flex items-center gap-3 md:gap-5 p-3 md:p-4 rounded-3xl transition-all duration-300 border card-hover ${cardClass}`}
                                >
                                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0 transition-transform duration-500 ${rankClass}`}>
                                        {rankIcon || <span>{rank}</span>}
                                    </div>
                                    
                                    <div className="flex-shrink-0 relative">
                                        <AvatarFrame src={student.photo} borderId={student.border} size="sm" />
                                        {rank <= 3 && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                                                <Star size={10} className="text-amber-500" fill="currentColor" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div>
                                            <h3 className={`font-bold text-sm md:text-lg leading-tight truncate ${isMe ? 'text-indigo-900' : 'text-slate-900'}`}>
                                                {student.name}
                                                {isMe && <span className="ml-2 inline-block px-2 py-0.5 bg-indigo-600 text-white text-[10px] rounded-full uppercase tracking-widest align-middle">Saya</span>}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-3 mt-1 whitespace-nowrap">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{student.class}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Level {student.level}</span>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <span className={`block text-2xl font-black tracking-tighter ${isMe ? 'text-indigo-600' : 'text-slate-900'}`}>
                                            {netPoints.toLocaleString()}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Poin Aktif</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            
            {/* My Rank Footer (Recipe 3: Hardware style) */}
            {currentUser && (
                <div className="mt-8 p-6 rounded-[2.5rem] text-white flex items-center justify-between shadow-2xl glass-dark border-indigo-500/20 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl bg-indigo-600 shadow-lg shadow-indigo-500/30 ring-4 ring-white/10">
                            #{students.findIndex(s => s.uid === currentUser.uid) + 1 || '-'}
                        </div>
                        <div>
                            <p className="font-black text-lg tracking-tight flex items-center gap-2">
                                Peringkat Kamu
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            </p>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Terus kumpulkan XP untuk naik!</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-3xl font-black tracking-tighter text-amber-400">{calculateNetXp(currentUser).toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Sisa XP</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaderboardView;