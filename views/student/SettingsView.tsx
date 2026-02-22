import React, { useState, useRef } from 'react';
import { useAuth } from '../../App';
import AvatarFrame from '../../components/AvatarFrame';
import { Lock, Save, RefreshCw, Image as ImageIcon, CheckCircle2, User, Hash, School, UploadCloud, FileImage, Loader2, RotateCcw, LogOut } from 'lucide-react';
import { api } from '../../services/mockData';

const SettingsView: React.FC = () => {
    const { user, refreshUser, logout } = useAuth();
    const [photoUrl, setPhotoUrl] = useState(user?.photo || '');
    const [isSaving, setIsSaving] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [selectedFileName, setSelectedFileName] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const cardClass = 'bg-white border border-slate-200';
    const textClass = 'text-slate-900';
    const subTextClass = 'text-slate-500';

    return (
        <div className="p-6 md:p-10 min-h-full max-w-5xl mx-auto animate-in fade-in duration-500 pb-24">
            <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
                    <User className="w-7 h-7" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-slate-900">Pengaturan Profil</h1>
                    <p className="text-sm font-medium text-slate-500">Kelola identitas dan tampilan profil kamu.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left Column: Avatar Preview (Recipe 3: Hardware style for widget) */}
                <div className="lg:col-span-4 flex flex-col items-center">
                    <div className="w-full p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 shadow-2xl shadow-slate-200/50 flex flex-col items-center relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute top-0 left-0 w-full h-24 bg-slate-50 border-b border-slate-100"></div>
                        
                        <div className="relative mb-8 mt-4 group z-10">
                            <AvatarFrame 
                                src={photoUrl} 
                                borderId={user?.border} 
                                size="2xl"
                            />
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl border border-slate-700 whitespace-nowrap z-20 group-hover:scale-110 transition-transform">
                                Preview Profil
                            </div>
                        </div>
                        
                        <div className="text-center space-y-2 z-10">
                            <p className="text-xl font-black tracking-tight text-slate-900">{user?.name}</p>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                                {user?.border !== 'none' ? '✨ Premium Member' : 'Standard Student'}
                            </p>
                        </div>

                        <div className="w-full mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Level</p>
                                <p className="text-lg font-black text-slate-900">{Math.floor((user?.xp || 0) / 100) + 1}</p>
                            </div>
                            <div className="text-center border-l border-slate-100">
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Border</p>
                                <p className="text-lg font-black text-indigo-600 uppercase text-[10px] tracking-widest">{user?.border || 'None'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-center">
                        <p className="text-xs font-bold text-indigo-700 leading-relaxed">
                            Gunakan foto yang sopan dan jelas agar mudah dikenali oleh guru dan teman sekelas.
                        </p>
                    </div>
                </div>

                {/* Right Column: Forms */}
                <div className="lg:col-span-8 space-y-10">
                    
                    {/* PHOTO SETTINGS (Recipe 11: SaaS Split style) */}
                    <div className="p-8 rounded-[2.5rem] bg-white border-2 border-slate-100 shadow-2xl shadow-slate-200/50">
                        <h2 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3 text-slate-900">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <ImageIcon className="w-5 h-5" />
                            </div>
                            Ubah Foto Profil
                        </h2>
                        
                        <div className="space-y-8">
                            {/* OPTION 1: UPLOAD */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Opsi 1: Unggah Foto</label>
                                <div 
                                    onClick={() => !isProcessing && fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                                        isProcessing 
                                            ? 'bg-slate-50 cursor-wait' 
                                            : selectedFileName 
                                                ? 'border-emerald-400 bg-emerald-50/50' 
                                                : 'border-slate-100 bg-slate-50/30 hover:bg-slate-50 hover:border-indigo-400'
                                    }`}
                                >
                                    {isProcessing ? (
                                        <div className="flex flex-col items-center py-4">
                                            <Loader2 className="w-10 h-10 animate-spin mb-3 text-indigo-600" />
                                            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">Memproses Gambar...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl transition-all group-hover:scale-110 ${selectedFileName ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white text-indigo-600 shadow-slate-200'}`}>
                                                {selectedFileName ? <CheckCircle2 className="w-8 h-8" /> : <UploadCloud className="w-8 h-8" />}
                                            </div>
                                            
                                            {selectedFileName ? (
                                                <div className="text-center">
                                                    <p className="text-sm font-black text-emerald-700 uppercase tracking-tight">Foto Terpilih</p>
                                                    <p className="text-xs text-emerald-500 mt-1 font-bold">{selectedFileName.length > 25 ? selectedFileName.substring(0,25)+'...' : selectedFileName}</p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <p className="text-sm font-black text-slate-600 uppercase tracking-widest group-hover:text-indigo-700">Pilih dari Galeri</p>
                                                    <p className="text-[10px] mt-2 text-slate-400 font-bold uppercase tracking-widest">Mendukung JPG, PNG (Max 20MB)</p>
                                                </div>
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

                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t-2 border-slate-50"></div>
                                <span className="flex-shrink-0 mx-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">ATAU</span>
                                <div className="flex-grow border-t-2 border-slate-50"></div>
                            </div>

                            {/* OPTION 2: AVATAR BUTTONS */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Opsi 2: Karakter Avatar</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button 
                                        type="button"
                                        onClick={generateRandomAvatar}
                                        disabled={isProcessing}
                                        className="p-5 rounded-[1.5rem] transition-all flex flex-col items-center justify-center gap-3 font-black text-xs uppercase tracking-widest border-2 border-dashed active:scale-95 disabled:opacity-50 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 border-indigo-100 hover:border-indigo-300"
                                    >
                                        <div className="p-3 bg-white rounded-xl shadow-md">
                                            <RefreshCw className="w-5 h-5" />
                                        </div>
                                        <span>Acak Kartun</span>
                                    </button>

                                    <button 
                                        type="button"
                                        onClick={handleResetDefault}
                                        disabled={isProcessing}
                                        className="p-5 rounded-[1.5rem] transition-all flex flex-col items-center justify-center gap-3 font-black text-xs uppercase tracking-widest border-2 border-dashed active:scale-95 disabled:opacity-50 bg-slate-50/50 hover:bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300"
                                    >
                                        <div className="p-3 bg-white rounded-xl shadow-md">
                                            <RotateCcw className="w-5 h-5" />
                                        </div>
                                        <span>Reset Default</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving || isProcessing || photoUrl === user?.photo}
                                    className="w-full py-5 font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200 hover:shadow-indigo-200"
                                >
                                    {isSaving ? 'Menyimpan...' : isProcessing ? 'Memproses...' : (
                                        <>
                                            <Save className="w-5 h-5" /> Simpan Perubahan
                                        </>
                                    )}
                                </button>
                                
                                {successMsg && (
                                    <div className="mt-4 p-4 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 animate-in slide-in-from-top-4 border-2 border-emerald-100">
                                        <CheckCircle2 className="w-5 h-5" /> {successMsg}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* LOCKED DATA (Recipe 1: Technical Dashboard style) */}
                    <div className="p-8 rounded-[2.5rem] border-2 bg-slate-50/50 border-slate-100 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
                            <Lock className="w-48 h-48 text-black" />
                        </div>

                        <h2 className="text-xl font-black tracking-tight mb-4 flex items-center gap-3 text-slate-900">
                            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                                <Lock className="w-5 h-5" />
                            </div>
                            Data Akademik
                        </h2>
                        <p className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest">
                            Data ini dikunci oleh sistem sekolah.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            <div className="flex items-center gap-5 p-5 rounded-2xl border-2 bg-white border-slate-100 opacity-80">
                                <div className="p-3 rounded-xl bg-slate-50 text-slate-400">
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Nama Lengkap</p>
                                    <p className="font-black text-slate-900 tracking-tight">{user?.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 p-5 rounded-2xl border-2 bg-white border-slate-100 opacity-80">
                                <div className="p-3 rounded-xl bg-slate-50 text-slate-400">
                                    <Hash className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Nomor Induk (NIS)</p>
                                    <p className="font-black text-slate-900 tracking-tight">{user?.nis}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-5 p-5 rounded-2xl border-2 bg-white border-slate-100 opacity-80 md:col-span-2">
                                <div className="p-3 rounded-xl bg-slate-50 text-slate-400">
                                    <School className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Kelas Terdaftar</p>
                                    <p className="font-black text-slate-900 tracking-tight">{user?.class}</p>
                                </div>
                                <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Verified
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LOGOUT SECTION */}
                    <div className="p-8 rounded-[2.5rem] border-2 border-rose-100 bg-rose-50/30">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-3 text-slate-900">
                                <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                                    <LogOut className="w-5 h-5" />
                                </div>
                                Keluar Akun
                            </h2>
                        </div>
                        <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">
                            Anda akan keluar dari sesi ini. Pastikan semua perubahan telah disimpan sebelum keluar.
                        </p>
                        <button 
                            onClick={logout}
                            className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all shadow-lg shadow-rose-100 hover:shadow-rose-200 flex items-center justify-center gap-2 active:scale-95"
                        >
                            <LogOut className="w-4 h-4" /> Keluar Aplikasi
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SettingsView;