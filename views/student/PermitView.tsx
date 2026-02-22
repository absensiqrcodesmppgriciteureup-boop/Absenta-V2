import React, { useState, useRef } from 'react';
import { ArrowLeft, Thermometer, FileText, Send, CheckCircle2, UploadCloud, X, Image as ImageIcon, Loader2, AlertCircle, Clock, CalendarDays } from 'lucide-react';
import { api } from '../../services/mockData';
import { submitToGoogleFormBackground } from '../../services/sheetService';
import { useAuth } from '../../App';

const PermitView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { user } = useAuth();
  const [type, setType] = useState<'Sakit' | 'Izin'>('Sakit');
  const [reason, setReason] = useState('');
  // USE LOCAL DATE
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA')); 
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isFormValid = !!file && !!reason && !!date;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
        const studentName = user?.name || '';
        // Convert 'Sakit' -> 'S', 'Izin' -> 'I'
        const statusParam = type === 'Sakit' ? 'S' : 'I';
        
        const fakeUrl = previewUrl || ''; 
        
        // 1. Submit to Google Form silently in background
        await submitToGoogleFormBackground(studentName, statusParam);

        // 2. Simulate minimum network delay for UX
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 3. Save locally to show immediate feedback in history
        await api.submitPermit({
            userId: user?.uid || '', 
            status: type, 
            date, 
            time: new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}), 
            details: reason,
            attachmentUrl: fakeUrl
        });
        
        setIsSuccess(true);
    } catch (err) {
        console.error(err);
        setError("Gagal memproses data. Silakan coba lagi.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isSuccess) {
      return (
          <div className="p-8 h-full flex flex-col items-center justify-center text-center animate-in zoom-in duration-300 max-w-lg mx-auto">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-lg 
                  ${type === 'Sakit' ? 'bg-rose-100 text-rose-600 shadow-rose-200' : 'bg-blue-100 text-blue-600 shadow-blue-200'}`}>
                  {type === 'Sakit' ? <Thermometer className="w-12 h-12" /> : <FileText className="w-12 h-12" />}
              </div>
              
              <h2 className="text-2xl font-bold mb-2 text-slate-900">Detail Absensi Tercatat</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                  Sistem telah otomatis mencatat kehadiran Anda ke server sekolah hari ini. Anda tidak perlu melakukan apa-apa lagi.
              </p>
              
              <div className="w-full p-6 rounded-2xl border shadow-sm text-left space-y-4 mb-8 bg-white border-slate-200">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                      <span className="text-sm text-slate-500 font-medium">Status Kehadiran</span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${type === 'Sakit' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                          {type}
                      </span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 font-medium">Nama Siswa</span>
                      <span className="text-sm font-bold text-slate-900">{user?.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 font-medium">Waktu Tercatat</span>
                      <span className="text-sm font-bold flex items-center gap-1 text-slate-900">
                          <Clock className="w-3.5 h-3.5" /> {new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB
                      </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-slate-500 font-medium">Poin Tambahan</span>
                      <span className="text-sm font-black text-amber-500">+5 XP</span>
                  </div>
              </div>

              <button onClick={onBack} className="w-full py-4 rounded-2xl font-bold shadow-xl transition-all bg-primary-600 text-white shadow-primary-200 hover:bg-primary-700">
                  Kembali ke Dashboard
              </button>
          </div>
      )
  }

  const inputClass = 'bg-white border-slate-200 text-slate-900 focus:ring-primary-500 focus:border-transparent';

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-6 mb-12 sticky top-0 z-10 py-4 bg-slate-50/80 backdrop-blur-md -mx-6 px-6 md:mx-0 md:px-0">
        <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">Buat Izin Baru</h1>
            <p className="text-sm font-medium text-slate-500">Lengkapi data untuk mengajukan izin tidak hadir.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-10 space-y-8 lg:space-y-0">
        
        {/* Left Column (Main Form) */}
        <div className="lg:col-span-7 space-y-8">
            {/* Type Selection (Recipe 11: SaaS Split style) */}
            <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Izin</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setType('Sakit')}
                        className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all duration-300 group ${type === 'Sakit' ? 'border-rose-500 bg-rose-50/50 text-rose-600 shadow-2xl shadow-rose-100 ring-4 ring-rose-50' : 'border-slate-100 bg-white text-slate-400 hover:border-rose-200 hover:bg-slate-50'}`}
                    >
                        <div className={`p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 ${type === 'Sakit' ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-slate-50 text-slate-400'}`}>
                            <Thermometer className="w-7 h-7" />
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest">Sakit</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('Izin')}
                        className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all duration-300 group ${type === 'Izin' ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700 shadow-2xl shadow-indigo-100 ring-4 ring-indigo-50' : 'border-slate-100 bg-white text-slate-400 hover:border-indigo-200 hover:bg-slate-50'}`}
                    >
                        <div className={`p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 ${type === 'Izin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400'}`}>
                            <FileText className="w-7 h-7" />
                        </div>
                        <span className="font-black text-sm uppercase tracking-widest">Acara / Izin</span>
                    </button>
                </div>
            </div>

            {/* Date Input */}
            <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Izin</label>
                <div className="relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                        <CalendarDays className="w-5 h-5" />
                    </div>
                    <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={`w-full pl-14 pr-6 py-5 border-2 rounded-2xl outline-none transition-all font-bold text-lg ${inputClass} focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 border-slate-100`}
                        required
                    />
                </div>
            </div>

            {/* Reason Textarea */}
            <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Keterangan Alasan</label>
                <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={type === 'Sakit' ? "Jelaskan sakit yang dialami secara detail..." : "Jelaskan keperluan atau acara yang akan dihadiri..."}
                    className={`w-full px-6 py-5 border-2 rounded-[2rem] outline-none transition-all min-h-[180px] resize-none font-medium leading-relaxed ${inputClass} focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 border-slate-100`}
                    required
                />
            </div>
        </div>

        {/* Right Column (Upload & Submit) */}
        <div className="lg:col-span-5 space-y-8">
            {/* File Upload (Recipe 5: Brutalist style for borders) */}
            <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                    <span>Unggah Bukti</span>
                    <span className="text-rose-500">Wajib *</span>
                </label>
                
                {!previewUrl ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center cursor-pointer transition-all group h-[340px] ${!file ? 'border-rose-200 bg-rose-50/30 hover:bg-rose-50 hover:border-rose-400' : 'border-slate-200 bg-white hover:border-indigo-400'}`}
                    >
                        <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-white shadow-xl shadow-slate-200/50">
                            <UploadCloud className={`w-8 h-8 ${!file ? 'text-rose-400' : 'text-indigo-600'}`} />
                        </div>
                        <p className={`text-sm font-black uppercase tracking-widest ${!file ? 'text-rose-500' : 'text-slate-600'}`}>
                            {!file ? 'Upload Bukti Surat' : 'Ganti Foto Bukti'}
                        </p>
                        <p className="text-xs mt-2 text-slate-400 font-medium">JPG, PNG (Maksimal 5MB)</p>
                    </div>
                ) : (
                    <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl group h-[340px] animate-in zoom-in duration-500">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <p className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> Ganti Foto
                            </p>
                        </div>
                        <button 
                            type="button" 
                            onClick={handleRemoveFile}
                            className="absolute top-4 right-4 p-3 bg-white rounded-2xl text-rose-500 hover:bg-rose-50 transition-all shadow-xl hover:scale-110"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
            </div>

            {error && (
                <div className="p-5 bg-rose-50 border-2 border-rose-100 rounded-2xl text-rose-600 flex items-center gap-4 animate-in slide-in-from-bottom-4">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <p className="text-sm font-black uppercase tracking-tight">{error}</p>
                </div>
            )}

            <button 
                type="submit" 
                disabled={isSubmitting || !isFormValid}
                className={`w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all duration-300 ${
                    !isFormValid 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xl shadow-indigo-200 hover:-translate-y-1'
                } disabled:opacity-70`}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Memproses...
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5" /> {isFormValid ? 'Kirim Pengajuan' : 'Lengkapi Data'}
                    </>
                )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default PermitView;