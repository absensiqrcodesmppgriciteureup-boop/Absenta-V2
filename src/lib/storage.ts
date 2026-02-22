import { Aspiration, filterProfanity } from "./utils";

const STORAGE_KEY = "osis_aspirations";

// Initialize with some dummy data if empty
const DUMMY_DATA: Aspiration[] = [
  {
    id: "1",
    category: "Fasilitas",
    content: "AC di kelas X-A rusak, tolong diperbaiki karena panas sekali.",
    status: "Diproses",
    createdAt: Date.now() - 86400000,
    isFlagged: false,
  },
  {
    id: "2",
    category: "Kantin",
    content: "Harga gorengan naik tapi ukurannya makin kecil.",
    status: "Diterima",
    createdAt: Date.now() - 172800000,
    isFlagged: false,
  },
  {
    id: "3",
    category: "Keamanan",
    content: "Ada siswa yang merokok di belakang gedung olahraga.",
    status: "Diajukan",
    createdAt: Date.now() - 250000000,
    isFlagged: false,
  },
];

export const storage = {
  getAspirations: (): Aspiration[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DUMMY_DATA));
      return DUMMY_DATA;
    }
    return JSON.parse(data);
  },

  addAspiration: (category: string, content: string): Aspiration => {
    const aspirations = storage.getAspirations();
    const { cleanText, hasProfanity } = filterProfanity(content);
    
    const newAspiration: Aspiration = {
      id: Math.random().toString(36).substr(2, 9),
      category: category as any,
      content: cleanText,
      status: "Diterima",
      createdAt: Date.now(),
      isFlagged: hasProfanity,
    };

    const updated = [newAspiration, ...aspirations];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    // Dispatch event for real-time sync across tabs
    window.dispatchEvent(new Event("storage"));
    
    return newAspiration;
  },

  updateStatus: (id: string, status: string) => {
    const aspirations = storage.getAspirations();
    const updated = aspirations.map((asp) =>
      asp.id === id ? { ...asp, status: status as any } : asp
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  },

  deleteAspiration: (id: string) => {
    const aspirations = storage.getAspirations();
    const updated = aspirations.filter((asp) => asp.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  },
};
