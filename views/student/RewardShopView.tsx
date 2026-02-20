import React, { useState } from 'react';
import { useAuth } from '../../App';
import { SHOP_ITEMS, api } from '../../services/mockData';
import { ShoppingBag, Star, Lock, Check, Loader2, Palette, Frame, Crown } from 'lucide-react';
import AvatarFrame from '../../components/AvatarFrame';

const RewardShopView: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'theme' | 'border'>('theme');
    const isPremium = user?.isPremium;

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
        <div className={`p-6 md:p-10 min-h-full max-w-5xl mx-auto animate-in fade-in duration-500 ${isPremium ? 'text-white' : ''}`}>
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className={`text-3xl font-black flex items-center gap-2 ${isPremium ? 'text-white' : 'text-slate-900'}`}>
                        <ShoppingBag className={`w-8 h-8 ${isPremium ? 'text-amber-400' : 'text-indigo-600'}`} />
                        Toko Hadiah
                    </h1>
                    <p className={`${isPremium ? 'text-slate-400' : 'text-slate-500'} mt-1`}>Tukar poin keaktifanmu dengan tampilan keren!</p>
                </div>
                
                <div className={`p-4 rounded-2xl flex items-center gap-4 shadow-xl w-full md:w-auto ${isPremium ? 'bg-slate-900 border border-amber-500/30' : 'bg-slate-900 text-white shadow-slate-200'}`}>
                    <div className={`p-2 rounded-xl ${isPremium ? 'bg-amber-500 text-amber-950' : 'bg-amber-500 text-amber-900'}`}>
                        <Star className="w-6 h-6" fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sisa Poin</p>
                        <p className="text-2xl font-black text-amber-400 leading-none">{currentBalance}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={`flex gap-2 p-1 rounded-xl w-full md:w-fit mb-8 ${isPremium ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'}`}>
                <button 
                    onClick={() => setActiveTab('theme')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'theme' ? (isPremium ? 'bg-amber-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-md') : (isPremium ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50')}`}
                >
                    <Palette className="w-4 h-4" /> Tema Warna
                </button>
                <button 
                    onClick={() => setActiveTab('border')}
                    className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'border' ? (isPremium ? 'bg-amber-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-md') : (isPremium ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-50')}`}
                >
                    <Frame className="w-4 h-4" /> Bingkai Foto
                </button>
            </div>

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map(item => {
                    const isOwned = user?.inventory?.includes(item.id);
                    const isEquipped = (activeTab === 'theme' && user?.theme === item.value) || 
                                       (activeTab === 'border' && user?.border === item.value);
                    const canAfford = currentBalance >= item.price;
                    const isLockedPremium = item.reqPremium && !user?.isPremium;

                    // Dynamic styles for item card
                    const cardBg = isPremium ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
                    const activeBorder = isPremium ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-indigo-500 ring-4 ring-indigo-50';
                    const hoverBorder = isPremium ? 'hover:border-slate-600' : 'hover:border-slate-300';

                    return (
                        <div key={item.id} className={`rounded-3xl p-6 border transition-all duration-300 group flex flex-col ${isEquipped ? activeBorder + ' shadow-xl' : isLockedPremium ? (isPremium ? 'bg-slate-900/50 border-slate-800 opacity-50' : 'border-slate-200 opacity-80') : `${cardBg} ${hoverBorder} hover:shadow-lg`}`}>
                            
                            {/* Preview Area */}
                            <div className={`h-32 rounded-2xl mb-4 flex items-center justify-center relative overflow-hidden ${isPremium ? 'bg-slate-950 border border-slate-800' : 'bg-slate-50'}`}>
                                {item.type === 'theme' ? (
                                    <div className="flex gap-3 items-center">
                                        <div className={`w-12 h-12 rounded-xl ${getThemeColorPreview(item.value)} shadow-lg transform rotate-12`}></div>
                                        <div className={`w-20 h-2 rounded-full ${isPremium ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
                                    </div>
                                ) : (
                                    <div className="relative p-2">
                                         <AvatarFrame 
                                            src={user?.photo || ''} 
                                            borderId={item.value}
                                            size="md"
                                         />
                                    </div>
                                )}
                                
                                {isEquipped && (
                                    <div className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-10 ${isPremium ? 'bg-amber-600 text-white' : 'bg-indigo-600 text-white'}`}>
                                        <Check className="w-3 h-3" /> Dipakai
                                    </div>
                                )}

                                {item.reqPremium && (
                                    <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm z-10">
                                        <Crown className="w-3 h-3" fill="currentColor" /> Premium Only
                                    </div>
                                )}
                            </div>

                            <div className="mb-4 flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-bold text-lg ${isPremium ? (item.reqPremium ? 'text-amber-400' : 'text-white') : (item.reqPremium ? 'text-amber-600' : 'text-slate-900')}`}>{item.name}</h3>
                                    {item.price > 0 && !isOwned && (
                                        <span className={`px-2 py-1 rounded-lg text-xs font-black ${isPremium ? 'bg-slate-800 text-amber-400 border border-slate-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {item.price} XP
                                        </span>
                                    )}
                                    {item.price === 0 && !isOwned && !isLockedPremium && <span className="text-slate-400 text-xs font-bold">Gratis</span>}
                                </div>
                                <p className={`${isPremium ? 'text-slate-400' : 'text-slate-500'} text-sm mt-1 leading-snug`}>{item.description}</p>
                            </div>

                            {/* Actions */}
                            <div className="mt-auto">
                                {isOwned ? (
                                    isEquipped ? (
                                        <button disabled className={`w-full py-3 font-bold rounded-xl text-sm cursor-default ${isPremium ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                                            Sedang Digunakan
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleEquip(item.id)}
                                            disabled={loadingId === item.id}
                                            className={`w-full py-3 font-bold rounded-xl text-sm transition-colors shadow-lg active:scale-95 flex justify-center items-center gap-2 ${isPremium ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-slate-900 text-white hover:bg-slate-700'}`}
                                        >
                                            {loadingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pakai Item Ini'}
                                        </button>
                                    )
                                ) : (
                                    <button 
                                        onClick={() => handleBuy(item.id)}
                                        disabled={!canAfford || loadingId === item.id || isLockedPremium}
                                        className={`w-full py-3 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all ${
                                            isLockedPremium 
                                            ? (isPremium ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed')
                                            : canAfford 
                                                ? (isPremium ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-900/20 shadow-lg' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 shadow-lg')
                                                : (isPremium ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed')
                                        }`}
                                    >
                                        {loadingId === item.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : isLockedPremium ? (
                                            <><Lock className="w-4 h-4" /> Butuh Akun Premium</>
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