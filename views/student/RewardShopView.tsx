import React, { useState } from 'react';
import { useAuth } from '../../App';
import { SHOP_ITEMS, api } from '../../services/mockData';
import { ShoppingBag, Star, Lock, Check, Loader2, Palette, Frame, Crown } from 'lucide-react';
import AvatarFrame from '../../components/AvatarFrame';

const RewardShopView: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'theme' | 'border'>('theme');

    const totalXp = user?.xp || 0;
    const spentXp = user?.spentXp || 0;
    const currentBalance = totalXp - spentXp;

    const filteredItems = SHOP_ITEMS.filter(item => item.type === activeTab);

    const handleBuy = async (itemId: string) => {
        if (!user) return;
        setLoadingId(itemId);
        try {
            const res = await api.buyItem(user.uid, itemId);
            if (res.success) {
                await refreshUser();
            } else {
                alert(res.message);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingId(null);
        }
    };

    const handleEquip = async (itemId: string) => {
        if (!user) return;
        setLoadingId(itemId);
        try {
             const res = await api.equipItem(user.uid, itemId, activeTab);
             if (res.success) {
                 await refreshUser();
             }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingId(null);
        }
    };

    // Helper to visualize theme colors
    const getThemeColorPreview = (colorName: string) => {
        switch(colorName) {
            case 'blue': return 'bg-blue-600';
            case 'emerald': return 'bg-emerald-600';
            case 'rose': return 'bg-rose-600';
            case 'amber': return 'bg-amber-600';
            case 'violet': return 'bg-violet-600';
            default: return 'bg-slate-500';
        }
    };

    return (
        <div className="p-6 md:p-10 min-h-full max-w-5xl mx-auto animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter flex items-center gap-3 text-slate-900">
                        <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-200">
                            <ShoppingBag className="w-8 h-8" />
                        </div>
                        Toko Hadiah
                    </h1>
                    <p className="text-slate-500 mt-2 font-medium">Tukar poin keaktifanmu dengan tampilan eksklusif.</p>
                </div>
                
                <div className="p-6 rounded-[2rem] flex items-center gap-6 shadow-2xl w-full md:w-auto glass-dark text-white border-indigo-500/20">
                    <div className="p-3 rounded-2xl bg-amber-500 text-amber-950 shadow-lg shadow-amber-500/20">
                        <Star className="w-7 h-7" fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Saldo Poin Aktif</p>
                        <p className="text-4xl font-black text-amber-400 tracking-tighter leading-none mt-1">{currentBalance.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Tabs (Recipe 4: Dark Luxury style for pills) */}
            <div className="flex gap-3 p-2 rounded-2xl w-full md:w-fit mb-12 bg-white border border-slate-200 shadow-sm">
                <button 
                    onClick={() => setActiveTab('theme')}
                    className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${activeTab === 'theme' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                    <Palette className="w-4 h-4" /> Tema
                </button>
                <button 
                    onClick={() => setActiveTab('border')}
                    className={`flex-1 md:flex-none px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${activeTab === 'border' ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                    <Frame className="w-4 h-4" /> Bingkai
                </button>
            </div>

            {/* Items Grid (Bento Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredItems.map(item => {
                    const isOwned = user?.inventory?.includes(item.id);
                    const isEquipped = (activeTab === 'theme' && user?.theme === item.value) || 
                                       (activeTab === 'border' && user?.border === item.value);
                    const canAfford = currentBalance >= item.price;

                    return (
                        <div key={item.id} className={`rounded-[2.5rem] p-8 border transition-all duration-500 group flex flex-col card-hover ${isEquipped ? 'border-indigo-500 bg-indigo-50/30 ring-4 ring-indigo-50' : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm hover:shadow-2xl'}`}>
                            
                            {/* Preview Area (Recipe 7: Atmospheric) */}
                            <div className="h-48 rounded-[2rem] mb-6 flex items-center justify-center relative overflow-hidden bg-slate-50 group-hover:bg-slate-100 transition-colors">
                                {item.type === 'theme' ? (
                                    <div className="relative flex items-center justify-center w-full h-full">
                                        <div className={`absolute inset-0 opacity-10 ${getThemeColorPreview(item.value)}`}></div>
                                        <div className={`w-20 h-20 rounded-3xl ${getThemeColorPreview(item.value)} shadow-2xl shadow-${item.value}-500/40 transform rotate-12 group-hover:rotate-0 transition-transform duration-700`}></div>
                                    </div>
                                ) : (
                                    <div className="relative p-4 transform group-hover:scale-110 transition-transform duration-700">
                                         <AvatarFrame 
                                            src={user?.photo || ''} 
                                            borderId={item.value}
                                            size="lg"
                                         />
                                    </div>
                                )}
                                
                                {isEquipped && (
                                    <div className="absolute top-4 right-4 text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-10 bg-indigo-600 text-white uppercase tracking-widest animate-in zoom-in duration-300">
                                        <Check className="w-3 h-3" /> Aktif
                                    </div>
                                )}
                            </div>

                            <div className="mb-6 flex-1">
                                <div className="flex justify-between items-start gap-2">
                                    <h3 className="font-black text-xl text-slate-900 tracking-tight">{item.name}</h3>
                                    {item.price > 0 && !isOwned && (
                                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                                            <Star size={12} fill="currentColor" />
                                            <span className="text-xs font-black">{item.price.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {item.price === 0 && !isOwned && <span className="text-emerald-500 text-xs font-black uppercase tracking-widest">Gratis</span>}
                                </div>
                                <p className="text-slate-500 text-sm mt-2 leading-relaxed font-medium">{item.description}</p>
                            </div>

                            {/* Actions (Recipe 11: SaaS Split style for buttons) */}
                            <div className="mt-auto">
                                {isOwned ? (
                                    isEquipped ? (
                                        <div className="w-full py-4 font-black rounded-2xl text-xs uppercase tracking-widest text-center bg-slate-100 text-slate-400 border border-slate-200">
                                            Digunakan
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleEquip(item.id)}
                                            disabled={loadingId === item.id}
                                            className="w-full py-4 font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex justify-center items-center gap-2 bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-indigo-200"
                                        >
                                            {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pasang Item'}
                                        </button>
                                    )
                                ) : (
                                    <button 
                                        onClick={() => handleBuy(item.id)}
                                        disabled={!canAfford || loadingId === item.id}
                                        className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex justify-center items-center gap-2 transition-all ${
                                            canAfford 
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 shadow-2xl hover:-translate-y-1' 
                                                : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                        }`}
                                    >
                                        {loadingId === item.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : canAfford ? (
                                            <>Beli Sekarang</>
                                        ) : (
                                            <><Lock className="w-4 h-4" /> Poin Kurang</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RewardShopView;