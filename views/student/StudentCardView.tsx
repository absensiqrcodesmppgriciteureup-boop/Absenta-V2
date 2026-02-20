import React from 'react';
import { useAuth } from '../../App';
import { School, QrCode, Share2, Download } from 'lucide-react';

const StudentCardView: React.FC = () => {
    const { user } = useAuth();
    const isPremium = user?.isPremium;

    // Generate High Quality QR Code from API (No dependency needed)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${user?.nis}&bgcolor=ffffff&color=000000&margin=2`;

    return (
        <div className={`p-6 md:p-10 min-h-full flex flex-col items-center justify-center max-w-2xl mx-auto animate-in fade-in duration-500 ${isPremium ? 'text-white' : ''}`}>
            <div className="text-center mb-8">
                <h1 className={`text-3xl font-black mb-2 ${isPremium ? 'text-white' : 'text-slate-900'}`}>Kartu Pelajar Digital</h1>
                <p className={`${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>Tunjukkan QR Code ini kepada petugas piket untuk absensi.</p>
            </div>

            {/* THE CARD */}
            <div className={`relative w-full max-w-[380px] aspect-[3/5] md:aspect-[1.58/1] rounded-3xl overflow-hidden group transition-transform duration-500 hover:scale-[1.02] ${isPremium ? 'shadow-2xl shadow-amber-900/40 border border-amber-500/30' : 'shadow-2xl shadow-primary-900/40'}`}>
                
                {/* Background Gradient & Pattern */}
                <div className={`absolute inset-0 ${isPremium ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900' : 'bg-gradient-to-br from-indigo-600 via-primary-600 to-sky-500'}`}></div>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                
                {/* Holographic Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"></div>

                {/* Content Container */}
                <div className="relative z-10 h-full flex flex-col p-6 md:p-8 text-white">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                                <School className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg leading-none tracking-tight">SMP PGRI</h2>
                                <p className={`text-xs font-medium tracking-widest uppercase mt-1 ${isPremium ? 'text-amber-200' : 'text-indigo-100'}`}>Citeureup</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`px-3 py-1 backdrop-blur-md rounded-full text-[10px] font-bold border ${isPremium ? 'bg-amber-500/20 border-amber-400 text-amber-100' : 'bg-white/20 border-white/20'}`}>
                                {isPremium ? 'PREMIUM MEMBER' : 'SISWA AKTIF'}
                            </span>
                        </div>
                    </div>

                    {/* Main Content: Photo & Info */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 flex-1">
                        <div className="relative">
                            <div className={`w-28 h-28 md:w-24 md:h-24 rounded-full p-1 backdrop-blur-sm ${isPremium ? 'bg-gradient-to-tr from-amber-400 to-amber-700' : 'bg-white/30'}`}>
                                <img 
                                    src={user?.photo} 
                                    className="w-full h-full rounded-full object-cover bg-slate-200 border-2 border-white" 
                                    alt="Student"
                                />
                            </div>
                            {/* Level Badge */}
                            <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 border-white shadow-lg ${isPremium ? 'bg-slate-900 text-amber-400' : 'bg-amber-400 text-amber-900'}`}>
                                {user?.level || 1}
                            </div>
                        </div>

                        <div className="text-center md:text-left space-y-1">
                            <h3 className={`text-2xl font-black tracking-tight ${isPremium ? 'text-amber-50' : 'text-white'}`}>{user?.name}</h3>
                            <p className={`font-medium opacity-90 ${isPremium ? 'text-amber-200' : 'text-indigo-100'}`}>{user?.nis}</p>
                            <p className="text-white font-bold bg-white/20 inline-block px-3 py-1 rounded-lg text-sm mt-2 backdrop-blur-md">
                                KELAS {user?.class}
                            </p>
                        </div>
                    </div>

                    {/* Footer: QR Code */}
                    <div className="mt-auto bg-white rounded-2xl p-4 flex items-center gap-4 shadow-lg text-slate-900">
                        <div className="w-20 h-20 bg-slate-100 rounded-lg flex-shrink-0">
                            <img src={qrCodeUrl} alt="QR" className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Scan untuk Presensi</p>
                            <div className="h-10 w-full bg-slate-100 rounded-lg overflow-hidden flex items-center px-3 relative">
                                <span className="font-mono text-xs font-bold tracking-widest text-slate-600 truncate">{user?.uid.substring(0, 16)}...</span>
                                <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-100 to-transparent"></div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8 w-full max-w-[380px]">
                <button className={`flex-1 border py-3 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 ${isPremium ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                    <Download className="w-4 h-4" /> Simpan
                </button>
                <button className={`flex-1 border py-3 rounded-xl font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 ${isPremium ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                    <Share2 className="w-4 h-4" /> Bagikan
                </button>
            </div>
            
            <p className={`mt-6 text-xs max-w-xs text-center leading-relaxed ${isPremium ? 'text-slate-500' : 'text-slate-400'}`}>
                Kartu ini valid selama Anda berstatus sebagai siswa aktif di SMP PGRI Citeureup. Jangan bagikan QR Code kepada orang lain.
            </p>
        </div>
    );
};

export default StudentCardView;