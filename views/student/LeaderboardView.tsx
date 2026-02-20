import React, { useEffect, useState } from 'react';
import { api } from '../../services/mockData';
import { User } from '../../types';
import { useAuth } from '../../App';
import { Trophy, Medal, Crown } from 'lucide-react';
import AvatarFrame from '../../components/AvatarFrame';

const LeaderboardView: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const isPremium = currentUser?.isPremium;

    useEffect(() => {
        const load = async () => {
            const data = await api.getLeaderboard();
            setStudents(data);
            setLoading(false);
        };
        load();
    }, []);

    const calculateNetXp = (u: User) => (u.xp || 0) - (u.spentXp || 0);

    if (loading) return <div className={`p-10 text-center ${isPremium ? 'text-slate-500' : 'text-slate-400'}`}>Memuat peringkat...</div>;

    return (
        <div className={`p-6 md:p-10 h-full flex flex-col max-w-5xl mx-auto ${isPremium ? 'text-white' : ''}`}>
            <header className="mb-6">
                <h1 className={`text-2xl md:text-3xl font-bold flex items-center gap-2 ${isPremium ? 'text-white' : 'text-slate-900'}`}>
                    <Trophy className={`w-7 h-7 ${isPremium ? 'text-amber-400' : 'text-amber-500'}`} />
                    Peringkat Sekolah
                </h1>
                <p className={`${isPremium ? 'text-slate-400' : 'text-slate-500'} text-sm`}>Siswa paling rajin (Berdasarkan sisa poin aktif).</p>
            </header>

            <div className={`rounded-3xl border shadow-xl overflow-hidden flex-1 flex flex-col ${isPremium ? 'bg-slate-900 border-slate-800 shadow-black/50' : 'bg-white border-slate-200 shadow-slate-200/50'}`}>
                <div className="overflow-y-auto custom-scrollbar p-2 md:p-4 space-y-2 md:grid md:grid-cols-2 md:space-y-0 md:gap-3">
                    {students.length === 0 ? (
                        <div className="p-10 text-center text-slate-400 col-span-2">Belum ada data peringkat.</div>
                    ) : (
                        students.map((student, index) => {
                            const isMe = student.uid === currentUser?.uid;
                            const rank = index + 1;
                            const netPoints = calculateNetXp(student);
                            
                            let rankIcon;
                            let rankClass = isPremium ? "bg-slate-800 text-slate-500" : "bg-slate-50 text-slate-500";
                            
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

                            // Card Styling for Premium
                            const cardClass = isPremium
                                ? (isMe ? 'bg-amber-900/20 border border-amber-500/50' : 'border border-slate-800 hover:bg-slate-800')
                                : (isMe ? 'bg-primary-50 border border-primary-200 shadow-sm' : 'border border-transparent hover:bg-slate-50');

                            return (
                                <div 
                                    key={student.uid} 
                                    className={`flex items-center gap-4 p-3 rounded-2xl transition-all ${cardClass}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${rankClass}`}>
                                        {rankIcon || <span>#{rank}</span>}
                                    </div>
                                    
                                    <div className="flex-shrink-0">
                                        <AvatarFrame src={student.photo} borderId={student.border} size="sm" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className={`font-bold truncate flex items-center gap-1 ${
                                                student.isPremium 
                                                    ? 'text-amber-500 drop-shadow-sm' 
                                                    : (isPremium ? 'text-white' : (isMe ? 'text-primary-700' : 'text-slate-900'))
                                            }`}>
                                                {student.name} {isMe && '(Saya)'}
                                                {student.isPremium && <Crown className="w-3 h-3 text-amber-500" fill="currentColor" />}
                                            </h3>
                                        </div>
                                        <p className={`text-xs font-medium ${isPremium ? 'text-slate-400' : 'text-slate-400'}`}>{student.class} • Level {student.level}</p>
                                    </div>

                                    <div className="text-right">
                                        <span className={`block text-sm font-black ${student.isPremium ? 'text-amber-500' : (isPremium ? 'text-white' : 'text-slate-800')}`}>{netPoints}</span>
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
                <div className={`mt-4 p-4 rounded-2xl text-white flex items-center justify-between shadow-lg ${
                    isPremium 
                    ? 'bg-gradient-to-r from-slate-900 to-slate-800 border border-amber-500/50 shadow-amber-900/20' 
                    : (currentUser.isPremium ? 'bg-gradient-to-r from-slate-900 to-slate-800 border border-amber-500/50' : 'bg-slate-900')
                }`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentUser.isPremium ? 'bg-amber-500 text-amber-950' : 'bg-slate-700'}`}>
                            #{students.findIndex(s => s.uid === currentUser.uid) + 1 || '-'}
                        </div>
                        <div>
                            <p className="font-bold text-sm flex items-center gap-1">
                                Peringkat Kamu 
                                {currentUser.isPremium && <Crown className="w-3 h-3 text-amber-400" fill="currentColor" />}
                            </p>
                            <p className="text-xs text-slate-400">Pertahankan posisimu!</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-xl font-black text-amber-400">{calculateNetXp(currentUser)}</span>
                        <span className="text-[10px] text-slate-400 font-bold">Sisa XP</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaderboardView;