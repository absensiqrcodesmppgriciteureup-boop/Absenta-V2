import React, { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { storage } from "../lib/storage";
import { Aspiration, STATUSES, Status, cn } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Filter, 
  Search, 
  CheckCircle2, 
  Clock, 
  Send, 
  XCircle, 
  Archive, 
  MoreHorizontal, 
  AlertTriangle,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

export default function Dashboard() {
  const { role } = useAuth();
  const [aspirations, setAspirations] = useState<Aspiration[]>([]);
  const [filterStatus, setFilterStatus] = useState<Status | "All">("All");
  const [search, setSearch] = useState("");

  const loadData = () => {
    setAspirations(storage.getAspirations());
  };

  useEffect(() => {
    loadData();
    // Listen for storage events to sync across tabs
    window.addEventListener("storage", loadData);
    return () => window.removeEventListener("storage", loadData);
  }, []);

  const handleStatusChange = (id: string, newStatus: Status) => {
    storage.updateStatus(id, newStatus);
    toast.success(`Status diubah menjadi ${newStatus}`);
    loadData();
  };

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus aspirasi ini?")) {
      storage.deleteAspiration(id);
      toast.success("Aspirasi dihapus");
      loadData();
    }
  };

  const filteredAspirations = aspirations.filter((asp) => {
    const matchesStatus = filterStatus === "All" || asp.status === filterStatus;
    const matchesSearch = asp.content.toLowerCase().includes(search.toLowerCase()) || 
                          asp.category.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "Diterima": return "bg-slate-100 text-slate-700 border-slate-200";
      case "Diproses": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Diajukan": return "bg-purple-50 text-purple-700 border-purple-200";
      case "Selesai": return "bg-green-50 text-green-700 border-green-200";
      case "Ditolak": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Aspirasi</h1>
          <p className="text-slate-500">
            Selamat datang, <span className="font-semibold capitalize text-indigo-600">{role}</span>.
            Kelola aspirasi siswa di sini.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 shadow-sm">
            Total: {aspirations.length}
          </div>
          <div className="px-3 py-1 bg-yellow-50 border border-yellow-200 rounded-lg text-sm font-medium text-yellow-700 shadow-sm">
            Pending: {aspirations.filter(a => a.status === "Diterima").length}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Cari aspirasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="relative min-w-[180px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as Status | "All")}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none"
          >
            <option value="All">Semua Status</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAspirations.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
            <Archive className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-900">Tidak ada aspirasi ditemukan</h3>
            <p className="text-slate-500">Coba ubah filter atau kata kunci pencarian.</p>
          </div>
        ) : (
          filteredAspirations.map((item) => (
            <div
              key={item.id}
              className={cn(
                "bg-white p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md",
                item.isFlagged ? "border-red-200 bg-red-50/30" : "border-slate-200"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold border border-slate-200">
                      {item.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock size={12} />
                      {formatDistanceToNow(item.createdAt, { addSuffix: true, locale: id })}
                    </span>
                    {item.isFlagged && (
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1 border border-red-200">
                        <AlertTriangle size={10} />
                        Terdeteksi Kata Kasar
                      </span>
                    )}
                  </div>
                </div>
                <div className={cn("px-3 py-1 rounded-full text-xs font-bold border w-fit", getStatusColor(item.status))}>
                  {item.status}
                </div>
              </div>

              <p className="text-slate-800 text-base leading-relaxed whitespace-pre-wrap mb-6">
                {item.content}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Update Status:</span>
                  <div className="flex gap-1">
                    {STATUSES.map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(item.id, status)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-colors border",
                          item.status === status 
                            ? getStatusColor(status) + " ring-2 ring-offset-1 ring-slate-200"
                            : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                        )}
                        title={status}
                      >
                        {status === "Diterima" && <Clock size={14} />}
                        {status === "Diproses" && <MoreHorizontal size={14} />}
                        {status === "Diajukan" && <Send size={14} />}
                        {status === "Selesai" && <CheckCircle2 size={14} />}
                        {status === "Ditolak" && <XCircle size={14} />}
                      </button>
                    ))}
                  </div>
                </div>

                {role === "operator" && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Hapus Aspirasi"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
