import React, { useEffect, useState } from 'react';
import { api } from '../../services/mockData';
import { User } from '../../types';
import { useAuth } from '../../App';
import { Trophy, Medal, Crown } from 'lucide-react';

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

    if (loading) return <div className="p-10 text-center text-slate-400">Memuat peringkat...</div>;

    return (
        <div className="p-6 md:p-10 h-full flex flex-col max-w-5xl mx-auto">
            <header className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                    <Trophy className="w-7 h-7 text-amber-500" />
                    Peringkat Sekolah
                </h1>
                <p className="text-slate-500 text-sm">Siswa paling rajin dan aktif.</p>
            </header>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden flex-1 flex flex-col">
                <div className="overflow-y-auto custom-scrollbar p-2 md:p-4 space-y-2 md:grid md:grid-cols-2 md:space-y-0 md:gap-3">
                    {students.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 col-span-2">Belum ada data peringkat.</div>
                    ) : (
                        students.map((student, index) => {
                            const isMe = student.uid === currentUser?.uid;
                            const rank = index + 1;
                            
                            let rankIcon;
                            let rankClass = "bg-slate-50 text-slate-500";
                            
                            if (rank === 1) {
                                rankClass = "bg-amber-100 text-amber-600 ring-2 ring-amber-100";
                                rankIcon = <Crown className="w-5 h-5" />;
                            } else if (rank === 2) {
                                rankClass = "bg-slate-200 text-slate-600";
                                rankIcon = <Medal className="w-5 h-5" />;
                            } else if (rank === 3) {
                                rankClass = "bg-orange-100 text-orange-700";
                                rankIcon = <Medal className="w-5 h-5" />;
                            }

                            return (
                                <div 
                                    key={student.uid} 
                                    className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${isMe ? 'bg-primary-50 border border-primary-200 shadow-sm' : 'border border-transparent hover:bg-slate-50'}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${rankClass}`}>
                                        {rankIcon || <span>#{rank}</span>}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className={`font-bold truncate ${isMe ? 'text-primary-700' : 'text-slate-900'}`}>
                                                {student.name} {isMe && '(Saya)'}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium">{student.class}</p>
                                    </div>

                                    <div className="text-right">
                                        <span className="block text-sm font-black text-slate-800">{student.xp}</span>
                                        <span className="text-[10px] text-slate-400 font-bold">XP</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            
            {/* My Rank Footer */}
            {currentUser && (
                <div className="mt-4 p-4 bg-slate-900 rounded-2xl text-white flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                            #{students.findIndex(s => s.uid === currentUser.uid) + 1 || '-'}
                        </div>
                        <div>
                            <p className="font-bold text-sm">Peringkat Kamu</p>
                            <p className="text-xs text-slate-400">Terus tingkatkan keaktifanmu!</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-xl font-black text-amber-400">{currentUser.xp}</span>
                        <span className="text-[10px] text-slate-400 font-bold">Total XP</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaderboardView;