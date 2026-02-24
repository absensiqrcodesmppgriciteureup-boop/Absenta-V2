import React from 'react';
import { Crown, Leaf, Flame, Zap, Ghost, Cpu, Gamepad2, Sparkles } from 'lucide-react';

interface AvatarFrameProps {
    src: string;
    borderId?: string; // nature, fire, electric, cyber, shadow, royal, pixel, galaxy
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    className?: string;
    level?: number;
}

const AvatarFrame: React.FC<AvatarFrameProps> = ({ src, borderId = 'none', size = 'md', className = '', level }) => {
    
    // Size Classes
    const sizeClass = {
        sm: 'w-10 h-10',
        md: 'w-16 h-16',
        lg: 'w-24 h-24',
        xl: 'w-32 h-32',
        '2xl': 'w-48 h-48'
    }[size];

    const iconSize = {
        sm: 'w-3 h-3',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8',
        '2xl': 'w-10 h-10'
    }[size];

    const BaseImage = ({ extraClass = '' }: { extraClass?: string }) => (
        <img 
            src={src} 
            alt="Avatar" 
            className={`w-full h-full rounded-full object-cover bg-slate-200 ${borderId === 'none' ? 'ring-2 ring-white' : ''} ${extraClass}`}
        />
    );

    // --- RENDERERS ---

    if (borderId === 'nature') {
        return (
            <div className={`relative ${sizeClass} ${className}`}>
                <div className="absolute inset-0 rounded-full border-[3px] border-emerald-500 ring-2 ring-emerald-200 shadow-sm"></div>
                <div className="absolute -top-1 -right-1 bg-emerald-100 p-1 rounded-full text-emerald-600 shadow-md z-10 border border-white">
                    <Leaf className={iconSize} fill="currentColor" />
                </div>
                <div className="absolute -bottom-1 -left-1 bg-emerald-100 p-1 rounded-full text-emerald-600 shadow-md z-10 border border-white">
                    <Leaf className={iconSize} fill="currentColor" />
                </div>
                <div className="w-full h-full rounded-full overflow-hidden p-[2px]">
                    <BaseImage />
                </div>
            </div>
        );
    }

    if (borderId === 'pixel') {
        return (
            <div className={`relative ${sizeClass} ${className}`}>
                <div className="absolute -inset-1 border-4 border-dashed border-slate-900 rounded-none bg-white/50"></div>
                <div className="absolute inset-0 border-2 border-slate-900 bg-white"></div>
                <div className="absolute -top-2 -right-2 bg-slate-900 text-white p-1 border-2 border-white z-10 shadow-lg transform rotate-6">
                    <Gamepad2 className={iconSize} />
                </div>
                <div className="w-full h-full overflow-hidden p-[4px] bg-slate-200 border border-slate-900">
                    <BaseImage extraClass="rounded-none grayscale contrast-125" />
                </div>
            </div>
        );
    }

    if (borderId === 'galaxy') {
        return (
            <div className={`relative ${sizeClass} ${className}`}>
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur opacity-75 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-2 border-white/50 z-10 ring-1 ring-white/20"></div>
                <div className="absolute -top-1 right-0 text-yellow-200 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] z-20 animate-bounce">
                    <Sparkles className={iconSize} fill="currentColor" />
                </div>
                <div className="w-full h-full rounded-full overflow-hidden p-[3px] bg-black relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-50 z-10 pointer-events-none"></div>
                    <BaseImage />
                </div>
            </div>
        );
    }

    if (borderId === 'glitch') {
        return (
            <div className={`relative ${sizeClass} ${className}`}>
                <div className="absolute -inset-1 bg-red-500/50 translate-x-[2px] rounded-full mix-blend-screen"></div>
                <div className="absolute -inset-1 bg-blue-500/50 -translate-x-[2px] rounded-full mix-blend-screen"></div>
                <div className="absolute inset-0 border-2 border-white rounded-full z-10 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/50 animate-pulse"></div>
                    <div className="absolute bottom-4 left-0 w-full h-0.5 bg-white/50 animate-pulse delay-75"></div>
                </div>
                <div className="w-full h-full rounded-full overflow-hidden p-[2px] bg-black relative">
                    <BaseImage extraClass="contrast-150 saturate-150" />
                </div>
            </div>
        );
    }

    if (borderId === 'electric') {
        return (
            <div className={`relative ${sizeClass} ${className}`}>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-yellow-300 to-purple-500 blur-sm opacity-60 animate-pulse"></div>
                <div className="absolute inset-0 rounded-full border-[3px] border-yellow-400 border-dashed animate-[spin_10s_linear_infinite]"></div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-600 text-yellow-300 p-1 rounded-full border-2 border-yellow-300 z-10 shadow-lg">
                    <Zap className={iconSize} fill="currentColor" />
                </div>
                <div className="w-full h-full rounded-full overflow-hidden p-[3px] bg-slate-800">
                    <BaseImage />
                </div>
            </div>
        );
    }

    if (borderId === 'fire') {
        return (
            <div className={`relative ${sizeClass} ${className}`}>
                <div className="absolute -inset-1 bg-gradient-to-t from-red-600 to-orange-400 rounded-full blur-[2px] opacity-70"></div>
                <div className="absolute inset-0 rounded-full border-4 border-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.8)]"></div>
                <div className="absolute -bottom-2 w-full flex justify-center z-10">
                    <div className="bg-gradient-to-tr from-red-600 to-orange-500 text-white p-1.5 rounded-full border-2 border-orange-300 shadow-lg">
                        <Flame className={iconSize} fill="#fcd34d" />
                    </div>
                </div>
                <div className="w-full h-full rounded-full overflow-hidden p-[2px]">
                    <BaseImage />
                </div>
            </div>
        );
    }

    if (borderId === 'cyber') {
        return (
            <div className={`relative ${sizeClass} ${className}`}>
                <div className="absolute -inset-1 border border-cyan-400 rounded-full animate-[spin_4s_linear_infinite] opacity-40 border-dashed"></div>
                <div className="absolute inset-0 border-[2px] border-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.6)]"></div>
                {/* HUD Elements */}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-4 w-1 bg-cyan-400 rounded-r"></div>
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 h-4 w-1 bg-cyan-400 rounded-l"></div>
                <div className="absolute -bottom-2 right-0 bg-cyan-900 text-cyan-300 p-1 rounded border border-cyan-500 z-10">
                    <Cpu className={iconSize} />
                </div>
                <div className="w-full h-full rounded-full overflow-hidden p-[2px] bg-black">
                    <BaseImage extraClass="opacity-90 sepia-[.5] hue-rotate-180" />
                </div>
            </div>
        );
    }

    if (borderId === 'shadow') {
        return (
            <div className={`relative ${sizeClass} ${className}`}>
                <div className="absolute -inset-2 bg-black blur-md rounded-full opacity-60"></div>
                <div className="absolute inset-0 border-2 border-red-900 rounded-full z-10"></div>
                <div className="absolute -top-2 -left-1 bg-black text-red-500 p-1 rounded-full border border-red-900 z-20">
                    <Ghost className={iconSize} />
                </div>
                <div className="w-full h-full rounded-full overflow-hidden p-[1px] bg-slate-900 relative z-0">
                    <BaseImage extraClass="grayscale contrast-125" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
            </div>
        );
    }

    if (borderId === 'royal') {
        const crownSize = size === 'sm' ? 'w-5 h-5' : size === 'md' ? 'w-8 h-8' : size === '2xl' ? 'w-12 h-12' : 'w-10 h-10';
        return (
            <div className={`relative ${sizeClass} ${className}`}>
                <div className={`absolute left-1/2 -translate-x-1/2 z-20 text-yellow-500 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] ${size === '2xl' ? '-top-6' : '-top-4 md:-top-5'}`}>
                    <Crown className={crownSize} fill="currentColor" />
                </div>
                <div className="absolute inset-0 rounded-full border-[4px] border-yellow-400 ring-2 ring-indigo-900 shadow-xl"></div>
                <div className="absolute inset-0 rounded-full border-t-2 border-white/70"></div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-4 bg-indigo-900 blur-md -z-10"></div>
                <div className="w-full h-full rounded-full overflow-hidden p-[3px] bg-indigo-900">
                    <BaseImage />
                </div>
            </div>
        );
    }

    // Default / None
    return (
        <div className={`relative ${sizeClass} ${className}`}>
            <BaseImage />
            {level && borderId === 'none' && (
               <div className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded border border-white shadow-sm">
                   {level}
               </div>
            )}
        </div>
    );
};

export default AvatarFrame;