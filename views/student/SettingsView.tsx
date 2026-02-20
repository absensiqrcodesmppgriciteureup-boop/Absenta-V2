import React, { useState, useRef } from 'react';
import { useAuth } from '../../App';
import AvatarFrame from '../../components/AvatarFrame';
import { Lock, Save, RefreshCw, Image as ImageIcon, CheckCircle2, User, Hash, School, UploadCloud, FileImage, Loader2, RotateCcw } from 'lucide-react';
import { api } from '../../services/mockData';

const SettingsView: React.FC = () => {
    const { user, refreshUser } = useAuth();
    const [photoUrl, setPhotoUrl] = useState(user?.photo || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [selectedFileName, setSelectedFileName] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isPremium = user?.isPremium;

    const generateRandomAvatar = () => {
        const randomSeed = Math.random().toString(36).substring(7);
        // Using DiceBear for high quality random avatars
        const styles = ['adventurer', 'avataaars', 'big-smile', 'bottts', 'fun-emoji', 'lorelei', 'micah', 'miniavs', 'notionists', 'open-peeps', 'personas', 'pixel-art'];
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];
        const url = `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${randomSeed}`;
        
        setPhotoUrl(url);
        setSelectedFileName(''); // Reset local file name if switching to avatar
    };

    const handleResetDefault = () => {
        if (!user) return;
        // Default avatar uses initials
        const defaultUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`;
        setPhotoUrl(defaultUrl);
        setSelectedFileName('');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Limit updated to 20MB to handle high-res phone camera photos
            if (file.size > 20 * 1024 * 1024) {
                alert('Ukuran file terlalu besar! Harap pilih foto di bawah 20MB.');
                return;
            }

            setSelectedFileName(file.name);
            setIsProcessing(true); // Start processing indicator

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Smart Resize: Max dimension 800px
                    // This ensures high quality on mobile but small file size for storage
                    const MAX_DIMENSION = 800;
                    
                    if (width > height) {
                        if (width > MAX_DIMENSION) {
                            height *= MAX_DIMENSION / width;
                            width = MAX_DIMENSION;
                        }
                    } else {
                        if (height > MAX_DIMENSION) {
                            width *= MAX_DIMENSION / height;
                            height = MAX_DIMENSION;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        
                        // Compress to JPEG with 0.8 quality
                        // This drastically reduces size (e.g. 5MB -> ~100KB)
                        const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        setPhotoUrl(optimizedDataUrl);
                    }
                    setIsProcessing(false);
                };
                img.onerror = () => {
                    alert("Gagal memproses gambar. File mungkin rusak.");
                    setIsProcessing(false);
                }
                
                if (event.target?.result) {
                    img.src = event.target.result as string;
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setIsSaving(true);
        try {
            await api.updateUserProfile(user.uid, { photo: photoUrl });
            await refreshUser();
            setSuccessMsg('Profil berhasil diperbarui!');
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const cardClass = isPremium ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200';
    const textClass = isPremium ? 'text-white' : 'text-slate-900';
    const subTextClass = isPremium ? 'text-slate-400' : 'text-slate-500';

    return (
        <div className={`p-6 md:p-10 min-h-full max-w-4xl mx-auto animate-in fade-in duration-500 pb-24 ${isPremium ? 'text-white' : ''}`}>
            <h1 className={`text-3xl font-black mb-8 ${textClass}`}>Pengaturan Profil</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Left Column: Avatar Preview */}
                <div className="md:col-span-1 flex flex-col items-center">
                    <div className="relative mb-8 mt-4 group">
                        <AvatarFrame 
                            src={photoUrl} 
                            borderId={user?.border} 
                            size="2xl"
                        />
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xl border border-slate-700 whitespace-nowrap z-20 group-hover:scale-110 transition-transform">
                            Preview Tampilan
                        </div>
                    </div>
                    
                    <p className={`text-center text-sm px-4 leading-relaxed ${subTextClass}`}>
                        Ini adalah tampilan foto profilmu dengan border <br/>
                        <span className={`font-black ${user?.border !== 'none' ? (isPremium ? 'text-amber-400' : 'text-indigo-600') : (isPremium ? 'text-slate-300' : 'text-slate-700')}`}>
                            {user?.border !== 'none' ? 'Premium' : 'Standar'}
                        </span>
                    </p>
                </div>

                {/* Right Column: Forms */}
                <div className="md:col-span-2 space-y-8">
                    
                    {/* PHOTO SETTINGS */}
                    <div className={`p-6 rounded-3xl shadow-sm ${cardClass}`}>
                        <h2 className={`text-lg font-bold mb-6 flex items-center gap-2 ${textClass}`}>
                            <ImageIcon className={`w-5 h-5 ${isPremium ? 'text-amber-500' : 'text-indigo-500'}`} />
                            Ganti Foto Profil
                        </h2>
                        
                        <div className="space-y-6">
                            {/* OPTION 1: UPLOAD */}
                            <div>
                                <label className={`block text-sm font-bold mb-2 ${subTextClass}`}>Opsi 1: Upload Foto Sendiri</label>
                                <div 
                                    onClick={() => !isProcessing && fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                                        isProcessing 
                                            ? 'bg-slate-50 cursor-wait' 
                                            : selectedFileName 
                                                ? 'border-emerald-400 bg-emerald-50' 
                                                : isPremium ? 'border-slate-700 bg-slate-800 hover:border-amber-500' : 'border-slate-300 bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-400'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <div className="flex flex-col items-center py-2">
                                            <Loader2 className={`w-8 h-8 animate-spin mb-2 ${isPremium ? 'text-amber-500' : 'text-indigo-600'}`} />
                                            <p className={`text-sm font-bold ${isPremium ? 'text-amber-500' : 'text-indigo-600'}`}>Sedang memproses & mengecilkan gambar...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-sm border transition-transform group-hover:scale-110 ${selectedFileName ? 'bg-white text-emerald-600 border-emerald-200' : (isPremium ? 'bg-slate-700 text-amber-500 border-slate-600' : 'bg-white text-indigo-600 border-slate-100')}`}>
                                                {selectedFileName ? <FileImage className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                                            </div>
                                            
                                            {selectedFileName ? (
                                                <>
                                                    <p className="text-sm font-bold text-emerald-700">Foto Siap: {selectedFileName.length > 20 ? selectedFileName.substring(0,20)+'...' : selectedFileName}</p>
                                                    <p className="text-xs text-emerald-500 mt-1">Klik untuk ganti foto lain</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className={`text-sm font-bold ${isPremium ? 'text-slate-300 group-hover:text-amber-400' : 'text-slate-600 group-hover:text-indigo-700'}`}>Klik untuk Pilih Foto dari Galeri</p>
                                                    <p className={`text-xs mt-1 ${isPremium ? 'text-slate-500' : 'text-slate-400'}`}>Mendukung Kamera HP & Foto Besar</p>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            <div className="relative flex items-center py-1">
                                <div className={`flex-grow border-t ${isPremium ? 'border-slate-700' : 'border-slate-200'}`}></div>
                                <span className={`flex-shrink-0 mx-4 text-xs font-bold uppercase tracking-widest ${subTextClass}`}>ATAU</span>
                                <div className={`flex-grow border-t ${isPremium ? 'border-slate-700' : 'border-slate-200'}`}></div>
                            </div>

                            {/* OPTION 2: AVATAR BUTTONS */}
                            <div>
                                <label className={`block text-sm font-bold mb-3 ${subTextClass}`}>Opsi 2: Pilihan Avatar</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button 
                                        type="button"
                                        onClick={generateRandomAvatar}
                                        disabled={isProcessing}
                                        className={`p-3.5 rounded-xl transition-all flex flex-col items-center justify-center gap-2 font-bold border-2 border-dashed active:scale-95 disabled:opacity-50 ${isPremium ? 'bg-slate-800 text-amber-400 border-slate-700 hover:border-amber-500' : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 hover:border-indigo-300'}`}
                                    >
                                        <RefreshCw className="w-5 h-5" />
                                        <span>Acak Kartun</span>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={handleResetDefault}
                                        disabled={isProcessing}
                                        className={`p-3.5 rounded-xl transition-all flex flex-col items-center justify-center gap-2 font-bold border active:scale-95 disabled:opacity-50 ${isPremium ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <RotateCcw className="w-5 h-5" />
                                        <span>Reset Default</span>
                                    </button>
                                </div>
                                <p className={`text-xs text-center mt-2 ${subTextClass}`}>
                                    Pilih "Acak Kartun" untuk karakter unik atau "Reset Default" untuk inisial nama.
                                </p>
                            </div>

                            <hr className={isPremium ? 'border-slate-700' : 'border-slate-100'} />

                            <button 
                                onClick={handleSave}
                                disabled={isSaving || isProcessing || photoUrl === user?.photo}
                                className={`w-full py-3.5 font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${isPremium ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-amber-900/20' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'}`}
                            >
                                {isSaving ? 'Menyimpan Perubahan...' : isProcessing ? 'Memproses Gambar...' : (
                                    <>
                                        <Save className="w-4 h-4" /> Simpan Foto Profil
                                    </>
                                )}
                            </button>
                            
                            {successMsg && (
                                <div className="p-3 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2 border border-emerald-100">
                                    <CheckCircle2 className="w-4 h-4" /> {successMsg}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* LOCKED DATA */}
                    <div className={`p-6 rounded-3xl border relative overflow-hidden ${isPremium ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        {/* Lock Overlay Icon */}
                        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                            <Lock className={`w-32 h-32 ${isPremium ? 'text-white' : 'text-black'}`} />
                        </div>

                        <h2 className={`text-lg font-bold mb-4 flex items-center gap-2 ${textClass}`}>
                            <Lock className="w-5 h-5 text-rose-500" />
                            Data Akademik (Terkunci)
                        </h2>
                        <p className={`text-sm mb-6 ${subTextClass}`}>
                            Data di bawah ini dikelola oleh admin sekolah dan tidak dapat diubah oleh siswa. Hubungi wali kelas jika ada kesalahan.
                        </p>

                        <div className="space-y-4 relative z-10">
                            <div className={`flex items-center gap-4 p-4 rounded-xl border opacity-80 cursor-not-allowed ${isPremium ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className={`p-2 rounded-lg ${isPremium ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className={`text-xs font-bold uppercase ${subTextClass}`}>Nama Lengkap</p>
                                    <p className={`font-bold ${textClass}`}>{user?.name}</p>
                                </div>
                                <Lock className="w-4 h-4 text-slate-300" />
                            </div>

                            <div className={`flex items-center gap-4 p-4 rounded-xl border opacity-80 cursor-not-allowed ${isPremium ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className={`p-2 rounded-lg ${isPremium ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                                    <Hash className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className={`text-xs font-bold uppercase ${subTextClass}`}>Nomor Induk (NIS)</p>
                                    <p className={`font-bold ${textClass}`}>{user?.nis}</p>
                                </div>
                                <Lock className="w-4 h-4 text-slate-300" />
                            </div>

                            <div className={`flex items-center gap-4 p-4 rounded-xl border opacity-80 cursor-not-allowed ${isPremium ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className={`p-2 rounded-lg ${isPremium ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                                    <School className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <p className={`text-xs font-bold uppercase ${subTextClass}`}>Kelas Terdaftar</p>
                                    <p className={`font-bold ${textClass}`}>{user?.class}</p>
                                </div>
                                <Lock className="w-4 h-4 text-slate-300" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SettingsView;