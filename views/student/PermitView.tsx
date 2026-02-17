import React, { useState, useRef } from 'react';
import { ArrowLeft, Thermometer, FileText, Send, CheckCircle2, UploadCloud, X, Image as ImageIcon, Loader2, AlertCircle, Clock } from 'lucide-react';
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
              
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Detail Absensi Tercatat</h2>
              <p className="text-slate-500 mb-8 leading-relaxed">
                  Sistem telah otomatis mencatat kehadiran Anda ke server sekolah. Anda tidak perlu melakukan apa-apa lagi.
              </p>
              
              <div className="w-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-left space-y-4 mb-8">
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
                      <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})} WIB
                      </span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-slate-500 font-medium">Poin Tambahan</span>
                      <span className="text-sm font-black text-amber-500">+5 XP</span>
                  </div>
              </div>

              <button onClick={onBack} className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all">
                  Kembali ke Dashboard
              </button>
          </div>
      )
  }

  return (
    <div className="p-6 md:p-10 pb-24 md:pb-10 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8 sticky top-0 bg-slate-50 z-10 py-2">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-200 transition-colors md:hidden">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Buat Izin Baru</h1>
      </div>

      <form onSubmit={handleSubmit} className="md:grid md:grid-cols-2 md:gap-8 space-y-6 md:space-y-0">
        
        {/* Left Column */}
        <div className="space-y-6">
            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => setType('Sakit')}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-200 ${type === 'Sakit' ? 'border-rose-600 bg-rose-50 text-rose-600 shadow-lg shadow-rose-100' : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'}`}
                >
                    <div className={`p-3 rounded-full ${type === 'Sakit' ? 'bg-white' : 'bg-slate-100'}`}>
                        <Thermometer className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm">Sakit</span>
                </button>
                <button
                    type="button"
                    onClick={() => setType('Izin')}
                    className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all duration-200 ${type === 'Izin' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-100' : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'}`}
                >
                    <div className={`p-3 rounded-full ${type === 'Izin' ? 'bg-white' : 'bg-slate-100'}`}>
                        <FileText className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm">Izin / Acara</span>
                </button>
            </div>

            {/* Date Input */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Tanggal Izin</label>
                <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-900 font-medium shadow-sm"
                    required
                />
            </div>

            {/* Reason Textarea */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Keterangan Lengkap</label>
                <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={type === 'Sakit' ? "Jelaskan sakit yang dialami..." : "Jelaskan keperluan izin..."}
                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent min-h-[140px] text-slate-900 resize-none shadow-sm leading-relaxed"
                    required
                />
            </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex justify-between">
                    <span>Bukti Foto / Surat</span>
                    <span className="text-rose-500 text-xs uppercase font-black tracking-wide">*Wajib Dilampirkan</span>
                </label>
                
                {!previewUrl ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group h-[280px] ${!file ? 'border-rose-300 bg-rose-50 hover:bg-rose-100' : 'border-slate-300 hover:bg-slate-50 hover:border-primary-400'}`}
                    >
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <UploadCloud className={`w-6 h-6 ${!file ? 'text-rose-400' : 'group-hover:text-primary-600'}`} />
                        </div>
                        <p className={`text-sm font-medium ${!file ? 'text-rose-500' : 'text-slate-400'}`}>
                            {!file ? 'Mohon upload bukti surat/foto' : 'Tekan untuk upload foto'}
                        </p>
                        <p className="text-xs mt-1 text-slate-400">Mendukung JPG, PNG (Max 5MB)</p>
                    </div>
                ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm group h-[280px]">
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-medium text-sm flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> Lihat Penuh
                            </p>
                        </div>
                        <button 
                            type="button" 
                            onClick={handleRemoveFile}
                            className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"
                        >
                            <X className="w-4 h-4" />
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
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 flex items-center gap-3 animate-in slide-in-from-bottom-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold">{error}</p>
                </div>
            )}

            <button 
                type="submit" 
                disabled={isSubmitting || !isFormValid}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${!isFormValid ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white shadow-xl shadow-primary-200 disabled:opacity-70 disabled:cursor-not-allowed'}`}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Memproses...
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5" /> {isFormValid ? 'Kirim Pengajuan Izin' : 'Lengkapi Data Dulu'}
                    </>
                )}
            </button>
        </div>
      </form>
    </div>
  );
};

export default PermitView;