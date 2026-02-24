import { User, AttendanceRecord, Announcement, TeacherNotification, ScheduleItem, ShopItem, Aspiration } from '../types';
import { RAW_STUDENTS_DATA, RAW_IDS } from './rawData';
import { fetchSheetAttendance, submitToGoogleFormBackground } from './sheetService'; 

// ==========================================
// 1. RAW DATA GENERATION
// ==========================================
const generateDataSiswa = () => {
  const lines = RAW_STUDENTS_DATA.split('\n');
  const ids = RAW_IDS.split('\n').map(id => id.trim()).filter(Boolean);
  let currentId = 1;
  let idIndex = 0;

  const results = lines.map((line) => {
    const cleanLine = line.trim();
    if (!cleanLine) return null;
    const match = cleanLine.match(/^([0-9][A-Z])\s+(.+)$/);
    if (!match) return null;
    
    const kelas = match[1];
    const nama = match[2].trim();
    const id = (currentId++).toString();
    
    // Generate PIN based on current line position
    const pin = ids[idIndex] || (id.padStart(4, '0') + '71');
    idIndex++;
    
    return { id, kelas, nama, pin };
  }).filter(Boolean) as { id: string, kelas: string, nama: string, pin: string }[];

  return results;
};

export const DATA_SISWA = generateDataSiswa();

// ==========================================
// 2. LEVELING SYSTEM LOGIC
// ==========================================
export const LEVEL_THRESHOLDS = [
    { level: 1, min: 0, max: 100 },
    { level: 2, min: 101, max: 250 },     // +150
    { level: 3, min: 251, max: 450 },     // +200
    { level: 4, min: 451, max: 700 },     // +250
    { level: 5, min: 701, max: 1000 },    // +300
    { level: 6, min: 1001, max: 1400 },   // +400
    { level: 7, min: 1401, max: 1900 },   // +500
    { level: 8, min: 1901, max: 2500 },   // +600
    { level: 9, min: 2501, max: 3200 },   // +700
    { level: 10, min: 3201, max: 99999 }  // MAX
];

export const calculateLevel = (xp: number) => {
    const tier = LEVEL_THRESHOLDS.find(t => xp >= t.min && xp <= t.max);
    return tier ? tier.level : 1; // Default Level 1
};

export const getNextLevelProgress = (xp: number) => {
    const currentLevel = calculateLevel(xp);
    const tier = LEVEL_THRESHOLDS.find(t => t.level === currentLevel);
    if (!tier || currentLevel === 10) return { percent: 100, needed: 0, nextXp: xp };
    
    const range = tier.max - tier.min;
    const progress = xp - tier.min;
    const percent = Math.min(100, Math.round((progress / range) * 100));
    
    return {
        percent,
        needed: tier.max + 1 - xp,
        nextXp: tier.max + 1,
        currentMin: tier.min,
        currentMax: tier.max
    };
};

// ==========================================
// 3. SHOP DATA
// ==========================================
export const SHOP_ITEMS: ShopItem[] = [
    // THEMES
    { id: 'theme_default', name: 'Absenta Blue', type: 'theme', value: 'blue', price: 0, description: 'Tema standar aplikasi.' },
    { id: 'theme_emerald', name: 'Nature Green', type: 'theme', value: 'emerald', price: 150, description: 'Nuansa hijau alam yang segar.' },
    { id: 'theme_rose', name: 'Sakura Pink', type: 'theme', value: 'rose', price: 300, description: 'Warna merah muda yang lembut.' },
    { id: 'theme_amber', name: 'Sunset Gold', type: 'theme', value: 'amber', price: 500, description: 'Energi semangat matahari terbenam.' },
    { id: 'theme_cyan', name: 'Ocean Breeze', type: 'theme', value: 'cyan', price: 600, description: 'Ketenangan ombak samudra biru.' },
    { id: 'theme_violet', name: 'Royal Purple', type: 'theme', value: 'violet', price: 800, description: 'Kesan mewah dan elegan.' },
    
    // BORDERS
    { id: 'border_none', name: 'Standar', type: 'border', value: 'none', price: 0, description: 'Bingkai standar sekolah.' },
    { id: 'border_nature', name: 'Forest Guardian', type: 'border', value: 'nature', price: 200, description: 'Energi alam dengan aksen dedaunan hijau.' },
    { id: 'border_pixel', name: 'Pixel Retro', type: 'border', value: 'pixel', price: 350, description: 'Gaya klasik 8-bit yang nostalgia.' },
    { id: 'border_glitch', name: 'Neon Glitch', type: 'border', value: 'glitch', price: 700, description: 'Efek kerusakan digital yang artistik.' },
    { id: 'border_electric', name: 'Thunder Storm', type: 'border', value: 'electric', price: 400, description: 'Energi listrik statis bertegangan tinggi.' },
    { id: 'border_fire', name: 'Magma Warrior', type: 'border', value: 'fire', price: 550, description: 'Api abadi yang membakar semangat juara.' },
    { id: 'border_galaxy', name: 'Galaxy Swirl', type: 'border', value: 'galaxy', price: 900, description: 'Keindahan nebula di luar angkasa.' },
    { id: 'border_shadow', name: 'Shadow Assassin', type: 'border', value: 'shadow', price: 1200, description: 'Diselimuti aura kegelapan misterius.' },
    { id: 'border_cyber', name: 'Cyberpunk HUD', type: 'border', value: 'cyber', price: 0, description: 'Teknologi hologram masa depan.' },
    { id: 'border_royal', name: 'King Crown', type: 'border', value: 'royal', price: 0, description: 'Mahkota emas murni.' },
];

// ==========================================
// 4. SMART STORAGE SYSTEM (OPTIMIZED)
// ==========================================

const STORAGE_KEY_USERS = 'absenta_server_users_v5'; 
const STORAGE_KEY_ATTENDANCE = 'absenta_server_attendance_v2';
const STORAGE_KEY_NOTIFICATIONS = 'absenta_server_notifications_v2';
const STORAGE_KEY_ASPIRATIONS = 'absenta_server_aspirations_v1';
const STORAGE_KEY_DELETED = 'absenta_deleted_ids_v1'; 

// CACHE VARIABLES
let IN_MEMORY_SHEET_DATA: AttendanceRecord[] = [];
let LAST_SHEET_FETCH_TIME = 0;
const CACHE_TTL = 15000; // 15 Detik Cache (Untuk responsivitas UI)

// Loaders that run ONLY ONCE on app start
const loadInitialUsers = (): Record<string, User> => {
    let savedJSON = localStorage.getItem(STORAGE_KEY_USERS);
    const savedUsers: Record<string, User> = savedJSON ? JSON.parse(savedJSON) : {};
    const deletedIDs: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY_DELETED) || '[]');
    const finalUsers: Record<string, User> = {};

    // Admin / Operator
    if (savedUsers['operator']) {
        finalUsers['operator'] = savedUsers['operator'];
        delete savedUsers['operator']; 
    } else {
        finalUsers['operator'] = { uid: '999', nis: 'operator', name: 'Operator Sekolah', role: 'operator', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&fit=crop' };
    }

    // OSIS
    if (savedUsers['osis']) {
        finalUsers['osis'] = savedUsers['osis'];
        delete savedUsers['osis'];
    } else {
        finalUsers['osis'] = { uid: '888', nis: 'osis', name: 'Pengurus OSIS', role: 'osis', photo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&fit=crop' };
    }

    // Teacher (Legacy Admin) - keeping for compatibility if needed, or map to teacher role
    if (savedUsers['admin']) {
        finalUsers['admin'] = savedUsers['admin'];
        delete savedUsers['admin']; 
    } else {
        finalUsers['admin'] = { uid: '777', nis: 'admin', name: 'Guru Piket', role: 'teacher', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&fit=crop' };
    }

    // Merge RAW Data
    DATA_SISWA.forEach((codeUser) => {
        if (deletedIDs.includes(codeUser.pin)) return;

        // Try to match existing
        const nameKey = Object.keys(savedUsers).find(key => {
            const u = savedUsers[key];
            return u.role === 'student' && 
                   u.name.trim().toLowerCase() === codeUser.nama.trim().toLowerCase() && 
                   u.class === codeUser.kelas;
        });

        const defaultUserProps = { spentXp: 0, theme: 'blue', border: 'none', inventory: ['theme_default', 'border_none'] };

        if (nameKey) {
            finalUsers[codeUser.pin] = { ...defaultUserProps, ...savedUsers[nameKey], uid: codeUser.id, nis: codeUser.pin, name: codeUser.nama, class: codeUser.kelas };
            delete savedUsers[nameKey]; 
            return;
        }

        if (savedUsers[codeUser.pin]) {
             finalUsers[codeUser.pin] = { ...defaultUserProps, ...savedUsers[codeUser.pin], uid: codeUser.id, nis: codeUser.pin, name: codeUser.nama, class: codeUser.kelas };
             delete savedUsers[codeUser.pin];
             return;
        }

        // New
        finalUsers[codeUser.pin] = {
            uid: codeUser.id,
            nis: codeUser.pin,
            name: codeUser.nama,
            role: 'student',
            class: codeUser.kelas,
            level: 1, 
            xp: 0,
            spentXp: 0,
            theme: 'blue',
            border: 'none',
            inventory: ['theme_default', 'border_none'],
            photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(codeUser.nama)}`
        };
    });

    // Add remaining manually created users
    Object.keys(savedUsers).forEach(key => {
        finalUsers[key] = { ...savedUsers[key] };
    });
    
    // Persist immediately to keep sync
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(finalUsers));
    return finalUsers;
};

// Global Memory State (Single Source of Truth)
export let MOCK_USERS = loadInitialUsers();
export let MOCK_ATTENDANCE: AttendanceRecord[] = JSON.parse(localStorage.getItem(STORAGE_KEY_ATTENDANCE) || '[]');
export let MOCK_NOTIFICATIONS: TeacherNotification[] = JSON.parse(localStorage.getItem(STORAGE_KEY_NOTIFICATIONS) || '[]');
export let MOCK_ASPIRATIONS: Aspiration[] = JSON.parse(localStorage.getItem(STORAGE_KEY_ASPIRATIONS) || '[]');

const saveChanges = () => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(MOCK_USERS));
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(MOCK_ATTENDANCE));
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(MOCK_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEY_ASPIRATIONS, JSON.stringify(MOCK_ASPIRATIONS));
};

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'Ujian Akhir Semester', content: 'UAS akan dilaksanakan pada tanggal 12-20 Desember 2024. Harap persiapkan diri dengan baik.', date: '2024-11-01', priority: 'high' },
  { id: '2', title: 'Lomba Kebersihan Kelas', content: 'Penilaian lomba kebersihan akan dilakukan setiap hari Jumat.', date: '2024-11-05', priority: 'medium' },
  { id: '3', title: 'Libur Nasional', content: 'Sekolah libur pada tanggal 17 Agustus memperingati kemerdekaan.', date: '2024-08-15', priority: 'medium' },
  { id: '4', title: 'Study Tour Bandung', content: 'Pendaftaran study tour ke Bandung dibuka hingga akhir bulan ini.', date: '2024-12-01', priority: 'medium' },
];

export const MOCK_SCHEDULE: ScheduleItem[] = [
    { id: '1', subject: 'KBM Sesi 1', time: '07:00 - 09:20', room: 'Kelas' },
    { id: '2', subject: 'Istirahat Pertama', time: '09:20 - 09:50', room: 'Area Sekolah' },
    { id: '3', subject: 'KBM Sesi 2', time: '09:50 - 11:20', room: 'Kelas' },
    { id: '4', subject: 'Istirahat Kedua (Ishoma)', time: '11:20 - 12:30', room: 'Masjid / Kantin' },
    { id: '5', subject: 'KBM Sesi 3', time: '12:30 - 14:00', room: 'Kelas' },
];

export const api = {
  login: async (nis: string): Promise<User | null> => {
    // Reload only on login to ensure fresh data
    MOCK_USERS = loadInitialUsers(); 
    const cleanNis = nis.trim();
    // Trigger background sync on login
    api.getAttendance(true).catch(console.error);
    return MOCK_USERS[cleanNis] || null;
  },
  
  lockAttendanceData: async (): Promise<number> => {
      // Force fetch fresh data for locking
      const sheetRecords = await fetchSheetAttendance();
      IN_MEMORY_SHEET_DATA = sheetRecords; // Update cache
      LAST_SHEET_FETCH_TIME = Date.now();

      let newRecordsCount = 0;

      sheetRecords.forEach(sheetRecord => {
          const exists = MOCK_ATTENDANCE.some(local => local.userId === sheetRecord.userId && local.date === sheetRecord.date);
          if (!exists) {
              MOCK_ATTENDANCE.push({ ...sheetRecord, id: `locked-${sheetRecord.userId}-${sheetRecord.date}`, isVerified: true });
              
              // XP Logic
              const userKey = Object.keys(MOCK_USERS).find(k => MOCK_USERS[k].uid === sheetRecord.userId);
              if (userKey) {
                  let xpAdd = sheetRecord.status === 'Hadir' ? 10 : (['Sakit','Izin'].includes(sheetRecord.status) ? 5 : 0);
                  MOCK_USERS[userKey].xp = (MOCK_USERS[userKey].xp || 0) + xpAdd;
                  MOCK_USERS[userKey].level = calculateLevel(MOCK_USERS[userKey].xp || 0);
              }
              newRecordsCount++;
          }
      });
      saveChanges();
      return newRecordsCount;
  },
  
  resetLocalData: async (): Promise<void> => {
      localStorage.removeItem(STORAGE_KEY_ATTENDANCE);
      MOCK_ATTENDANCE = [];
      IN_MEMORY_SHEET_DATA = [];
      LAST_SHEET_FETCH_TIME = 0;
      return;
  },

  getUser: async (nis: string): Promise<User | null> => {
     return MOCK_USERS[nis] || null; 
  },

  getAllStudents: async (): Promise<User[]> => {
      // Use In-Memory Data (Fast)
      return Object.values(MOCK_USERS).filter(u => u.role === 'student');
  },
  
  updateUserProfile: async (uid: string, data: { photo?: string }): Promise<boolean> => {
      const userKey = Object.keys(MOCK_USERS).find(key => MOCK_USERS[key].uid === uid);
      if (!userKey) return false;
      if (data.photo) MOCK_USERS[userKey].photo = data.photo;
      saveChanges();
      return true;
  },

  getLocalAttendance: (): AttendanceRecord[] => {
      return MOCK_ATTENDANCE;
  },

  // === CORE FUNCTION: GET ATTENDANCE ===
  getAttendance: async (forceUpdate = false): Promise<AttendanceRecord[]> => {
      const now = Date.now();
      const isStale = (now - LAST_SHEET_FETCH_TIME) > CACHE_TTL;
      const hasCache = IN_MEMORY_SHEET_DATA.length > 0;

      // STRATEGY: Stale-While-Revalidate
      // 1. If Forced Update OR No Cache => Block and Await Fetch
      // 2. If Stale but Has Cache => Return Cache, Fetch in Background
      // 3. If Fresh => Return Cache

      if (forceUpdate || !hasCache) {
          try {
              // Blocking fetch for critical updates or first load
              IN_MEMORY_SHEET_DATA = await fetchSheetAttendance();
              LAST_SHEET_FETCH_TIME = now;
          } catch (e) {
              console.error("[Data] Sync failed, using local only", e);
          }
      } else if (isStale) {
          // Non-blocking background refresh
          fetchSheetAttendance().then(data => {
              IN_MEMORY_SHEET_DATA = data;
              LAST_SHEET_FETCH_TIME = Date.now();
              console.log("[Data] Background sync complete");
          }).catch(console.error);
      }

      // MERGE: Local (Manual/Locked) + Sheet (Auto)
      // Local records take precedence for same User+Date
      const mergedMap = new Map<string, AttendanceRecord>();

      // 1. Add Sheet Data First (Base Layer)
      IN_MEMORY_SHEET_DATA.forEach(r => {
          mergedMap.set(`${r.userId}-${r.date}`, r);
      });

      // 2. Add Local Data (Override Layer)
      MOCK_ATTENDANCE.forEach(r => {
          mergedMap.set(`${r.userId}-${r.date}`, r);
      });

      return Array.from(mergedMap.values());
  },
  
  getNotifications: async (): Promise<TeacherNotification[]> => {
    return MOCK_NOTIFICATIONS;
  },
  
  getLeaderboard: async (): Promise<User[]> => {
      return Object.values(MOCK_USERS)
        .filter(u => u.role === 'student')
        .sort((a, b) => ((a.xp||0)-(a.spentXp||0)) - ((b.xp||0)-(b.spentXp||0)))
        .reverse()
        .slice(0, 50);
  },

  verifyPermit: async (recordId: string, status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'): Promise<boolean> => {
     const idx = MOCK_ATTENDANCE.findIndex(a => a.id === recordId);
     if (idx !== -1) {
         MOCK_ATTENDANCE[idx].status = status;
         MOCK_ATTENDANCE[idx].isVerified = true;
         
         const uid = MOCK_ATTENDANCE[idx].userId;
         const userKey = Object.keys(MOCK_USERS).find(k => MOCK_USERS[k].uid === uid);
         
         if (userKey) {
             let newPoints = status === 'Hadir' ? 10 : (['Sakit','Izin'].includes(status) ? 5 : 0);
             MOCK_USERS[userKey].xp = (MOCK_USERS[userKey].xp || 0) + newPoints;
             MOCK_USERS[userKey].level = calculateLevel(MOCK_USERS[userKey].xp || 0);
         }
         saveChanges();
         return true;
     }
     return false;
  },
  
  submitPermit: async (permit: Omit<AttendanceRecord, 'id' | 'userName' | 'userClass'>): Promise<boolean> => {
        const user = Object.values(MOCK_USERS).find(u => u.uid === permit.userId);
        if (user) {
            const newRecord: AttendanceRecord = {
                id: Math.random().toString(36).substr(2, 9),
                userName: user.name,
                userClass: user.class || '',
                ...permit,
                status: permit.status,
                type: permit.status as 'Sakit' | 'Izin',
                isVerified: true 
            };
            
            const existingIdx = MOCK_ATTENDANCE.findIndex(a => a.userId === permit.userId && a.date === permit.date);
            if (existingIdx > -1) {
                MOCK_ATTENDANCE[existingIdx] = newRecord;
            } else {
                MOCK_ATTENDANCE.unshift(newRecord);
            }

            const userKey = Object.keys(MOCK_USERS).find(k => MOCK_USERS[k].uid === permit.userId);
             if (userKey) {
                 let xpAdd = ['Sakit','Izin'].includes(permit.status) ? 5 : 0;
                 MOCK_USERS[userKey].xp = (MOCK_USERS[userKey].xp || 0) + xpAdd;
                 MOCK_USERS[userKey].level = calculateLevel(MOCK_USERS[userKey].xp || 0);
             }
            saveChanges();
            return true;
        }
        return false;
  },

  addStudent: async (studentData: { name: string, nis: string, class: string }): Promise<boolean> => {
        if (MOCK_USERS[studentData.nis]) return false;

        const newId = Math.random().toString(36).substr(2, 9);
        MOCK_USERS[studentData.nis] = {
            uid: newId,
            nis: studentData.nis,
            name: studentData.name,
            class: studentData.class,
            role: 'student',
            level: 1, xp: 0, spentXp: 0,
            theme: 'blue', border: 'none', inventory: ['theme_default', 'border_none'],
            photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentData.name)}`
        };
        saveChanges();
        return true;
  },

  updateStudent: async (uid: string, data: { name: string, class: string, nis: string }): Promise<boolean> => {
      const userKey = Object.keys(MOCK_USERS).find(key => MOCK_USERS[key].uid === uid);
      if (!userKey) return false;
      
      const oldUser = MOCK_USERS[userKey];
      if (oldUser.nis !== data.nis) {
          if (MOCK_USERS[data.nis]) return false;
          delete MOCK_USERS[userKey]; 
          MOCK_USERS[data.nis] = { ...oldUser, ...data, nis: data.nis };
      } else {
          MOCK_USERS[userKey] = { ...oldUser, ...data };
      }
      saveChanges();
      return true;
  },

  deleteStudent: async (uid: string): Promise<boolean> => {
      const userKey = Object.keys(MOCK_USERS).find(key => MOCK_USERS[key].uid === uid);
      if (userKey) {
          const deletedIDs: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY_DELETED) || '[]');
          deletedIDs.push(MOCK_USERS[userKey].nis);
          localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(deletedIDs));
          delete MOCK_USERS[userKey];
          saveChanges();
          return true;
      }
      return false;
  },
  
  updateStudentXP: async (uid: string, amount: number): Promise<boolean> => {
      const userKey = Object.keys(MOCK_USERS).find(key => MOCK_USERS[key].uid === uid);
      if (userKey) {
          MOCK_USERS[userKey].xp = (MOCK_USERS[userKey].xp || 0) + amount;
          MOCK_USERS[userKey].level = calculateLevel(MOCK_USERS[userKey].xp || 0);
          saveChanges();
          return true;
      }
      return false;
  },

  deleteAttendanceRecord: async (recordId: string, userId: string): Promise<boolean> => {
       const idx = MOCK_ATTENDANCE.findIndex(r => r.id === recordId);
       if (idx !== -1) {
           MOCK_ATTENDANCE.splice(idx, 1);
           saveChanges(); // Simple remove, no XP deduction logic to keep simple
           return true;
       }
       return false;
  },
  
  addManualAttendance: async (record: Omit<AttendanceRecord, 'id' | 'userName' | 'userClass'>): Promise<boolean> => {
      const userKey = Object.keys(MOCK_USERS).find(key => MOCK_USERS[key].uid === record.userId);
      if (!userKey) return false;
      const user = MOCK_USERS[userKey];

      const newRecord: AttendanceRecord = {
          id: `manual-${Date.now()}`,
          userName: user.name,
          userClass: user.class || '',
          ...record,
          isVerified: true
      };
      
      MOCK_ATTENDANCE.unshift(newRecord);
      
      let add = record.status === 'Hadir' ? 10 : (['Sakit','Izin'].includes(record.status) ? 5 : 0);

      user.xp = (user.xp || 0) + add;
      user.level = calculateLevel(user.xp || 0);
      saveChanges();
      return true;
  },
  
  // ===============================================
  // OPTIMIZED MARK BULK ALPHA
  // ===============================================
  markBulkAlpha: async (userIds: string[], date: string, skipNetwork: boolean = false): Promise<number> => {
      // 1. Create Lookup Map for Speed (O(N))
      const uidMap = new Map<string, User>();
      Object.values(MOCK_USERS).forEach(u => uidMap.set(u.uid, u));

      let count = 0;
      const newRecords: AttendanceRecord[] = [];
      const pendingSubmissions: { name: string, status: 'A' }[] = [];

      userIds.forEach(uid => {
          const user = uidMap.get(uid);
          if (user) {
              const existsLocal = MOCK_ATTENDANCE.some(r => r.userId === uid && r.date === date);
              const existsSheet = IN_MEMORY_SHEET_DATA.some(r => r.userId === uid && r.date === date);
              
              if (!existsLocal && !existsSheet) {
                  // 1. Create Local Record (Instant Feedback)
                  newRecords.push({
                      id: `alpha-${uid}-${date}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                      userId: uid,
                      userName: user.name,
                      userClass: user.class || '',
                      status: 'Alpa',
                      date: date,
                      time: '-',
                      details: 'Tanpa Keterangan (Sistem)',
                      isVerified: true
                  });
                  
                  // 2. Queue for throttled submission
                  pendingSubmissions.push({ name: user.name, status: 'A' });
                  count++;
              }
          }
      });

      // 2. Batch Push & Save Local Data
      if (newRecords.length > 0) {
          MOCK_ATTENDANCE.unshift(...newRecords);
          saveChanges();
          console.log(`[Batch] Sukses menyimpan ${newRecords.length} record Alpa secara lokal.`);
      }

      // 3. IF skipNetwork is TRUE, we STOP here. 
      // This is because the UI (TeacherLayout) will handle the network calls one by one for visual effect.
      if (skipNetwork) {
          return count;
      }

      // 3. THROTTLED QUEUE SUBMISSION (FALLBACK IF NOT SKIPPED)
      const processQueue = async () => {
          const CHUNK_SIZE = 3; 
          for (let i = 0; i < pendingSubmissions.length; i += CHUNK_SIZE) {
              const chunk = pendingSubmissions.slice(i, i + CHUNK_SIZE);
              await Promise.all(chunk.map(item => submitToGoogleFormBackground(item.name, item.status as any)));
              if (i + CHUNK_SIZE < pendingSubmissions.length) {
                  await new Promise(resolve => setTimeout(resolve, 500)); 
              }
          }
      };

      processQueue();

      return count;
  },

  buyItem: async (uid: string, itemId: string): Promise<{success: boolean, message: string}> => {
      const userKey = Object.keys(MOCK_USERS).find(key => MOCK_USERS[key].uid === uid);
      if (!userKey) return {success: false, message: 'User not found'};

      const user = MOCK_USERS[userKey];
      const item = SHOP_ITEMS.find(i => i.id === itemId);
      if (!item) return {success: false, message: 'Item not found'};

      const currentBalance = (user.xp || 0) - (user.spentXp || 0);
      if (currentBalance < item.price) return {success: false, message: 'XP tidak cukup'};

      if (user.inventory?.includes(itemId)) return {success: false, message: 'Item sudah dimiliki'};

      user.spentXp = (user.spentXp || 0) + item.price;
      user.inventory = [...(user.inventory || []), itemId];
      saveChanges();
      return {success: true, message: 'Item berhasil dibeli!'};
  },

  equipItem: async (uid: string, itemId: string, type: 'theme' | 'border'): Promise<{success: boolean, message: string}> => {
      const userKey = Object.keys(MOCK_USERS).find(key => MOCK_USERS[key].uid === uid);
      if (!userKey) return {success: false, message: 'User not found'};

      const user = MOCK_USERS[userKey];
      if (!user.inventory?.includes(itemId)) return {success: false, message: 'Anda belum memiliki item ini'};

      if (type === 'theme') user.theme = itemId === 'theme_default' ? 'blue' : SHOP_ITEMS.find(i => i.id === itemId)?.value;
      if (type === 'border') user.border = itemId === 'border_none' ? 'none' : SHOP_ITEMS.find(i => i.id === itemId)?.value;

      saveChanges();
      return {success: true, message: `Berhasil menggunakan item`};
  },

  // ==========================================
  // ASPIRASI DIGITAL
  // ==========================================
  submitAspiration: async (aspiration: Omit<Aspiration, 'id' | 'date' | 'status'>): Promise<boolean> => {
      const newAspiration: Aspiration = {
          id: `asp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...aspiration,
          status: 'Pending',
          date: new Date().toISOString().split('T')[0],
      };
      MOCK_ASPIRATIONS.unshift(newAspiration);
      saveChanges();
      return true;
  },

  getAspirations: async (): Promise<Aspiration[]> => {
      return [...MOCK_ASPIRATIONS];
  },

  updateAspirationStatus: async (id: string, status: Aspiration['status'], feedback?: string): Promise<boolean> => {
      const idx = MOCK_ASPIRATIONS.findIndex(a => a.id === id);
      if (idx !== -1) {
          MOCK_ASPIRATIONS[idx].status = status;
          if (feedback) MOCK_ASPIRATIONS[idx].feedback = feedback;
          saveChanges();
          return true;
      }
      return false;
  },

  deleteAspiration: async (id: string): Promise<boolean> => {
      let idx = MOCK_ASPIRATIONS.findIndex(a => a.id === id);
      
      // Fallback: Try reloading from storage if not found (Sync Issue Protection)
      if (idx === -1) {
          const stored = JSON.parse(localStorage.getItem(STORAGE_KEY_ASPIRATIONS) || '[]');
          MOCK_ASPIRATIONS.length = 0;
          MOCK_ASPIRATIONS.push(...stored);
          idx = MOCK_ASPIRATIONS.findIndex(a => a.id === id);
      }

      if (idx !== -1) {
          MOCK_ASPIRATIONS.splice(idx, 1);
          saveChanges();
          return true;
      }
      return false;
  }
};