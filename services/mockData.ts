import { User, AttendanceRecord, Announcement, TeacherNotification, ScheduleItem } from '../types';
import { RAW_STUDENTS_DATA, RAW_IDS } from './rawData';
import { fetchSheetAttendance } from './sheetService'; 

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
// 3. SMART STORAGE & MIGRATION SYSTEM
// ==========================================

const STORAGE_KEY_USERS = 'absenta_server_users_v4'; 
const STORAGE_KEY_ATTENDANCE = 'absenta_server_attendance_v2';
const STORAGE_KEY_NOTIFICATIONS = 'absenta_server_notifications_v2';
const STORAGE_KEY_DELETED = 'absenta_deleted_ids_v1'; // NEW: Blacklist for deleted IDs

const loadInitialUsers = (): Record<string, User> => {
    // 1. Load Existing Data
    const savedJSON = localStorage.getItem(STORAGE_KEY_USERS);
    const savedUsers: Record<string, User> = savedJSON ? JSON.parse(savedJSON) : {};
    
    // Load Blacklist
    const deletedIDs: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY_DELETED) || '[]');

    // 2. Prepare Final Object
    const finalUsers: Record<string, User> = {};

    // 3. Admin Always Exists
    if (savedUsers['admin']) {
        finalUsers['admin'] = savedUsers['admin'];
        delete savedUsers['admin']; 
    } else {
        finalUsers['admin'] = { uid: '999', nis: 'admin', name: 'Operator Sekolah', role: 'teacher', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&fit=crop' };
    }

    // 4. MIGRATION LOGIC
    DATA_SISWA.forEach((codeUser) => {
        if (deletedIDs.includes(codeUser.pin)) return;

        // Find existing user to preserve XP/Level
        const nameKey = Object.keys(savedUsers).find(key => {
            const u = savedUsers[key];
            return u.role === 'student' && 
                   u.name.trim().toLowerCase() === codeUser.nama.trim().toLowerCase() && 
                   u.class === codeUser.kelas;
        });

        if (nameKey) {
            finalUsers[codeUser.pin] = {
                ...savedUsers[nameKey],
                uid: codeUser.id,   
                nis: codeUser.pin,  
                name: codeUser.nama,
                class: codeUser.kelas
            };
            delete savedUsers[nameKey]; 
            return;
        }

        if (savedUsers[codeUser.pin]) {
             const oldUser = savedUsers[codeUser.pin];
             finalUsers[codeUser.pin] = {
                ...oldUser,
                uid: codeUser.id,
                nis: codeUser.pin,
                name: codeUser.nama,
                class: codeUser.kelas
            };
            delete savedUsers[codeUser.pin];
            return;
        }

        // New User - Default Level 1
        finalUsers[codeUser.pin] = {
            uid: codeUser.id,
            nis: codeUser.pin,
            name: codeUser.nama,
            role: 'student',
            class: codeUser.kelas,
            level: 1, // Start at Level 1
            xp: 0,
            photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(codeUser.nama)}`
        };
    });

    Object.keys(savedUsers).forEach(key => {
        finalUsers[key] = savedUsers[key];
    });
    
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(finalUsers));
    return finalUsers;
};

const loadInitialAttendance = (): AttendanceRecord[] => {
    const saved = localStorage.getItem(STORAGE_KEY_ATTENDANCE);
    if (saved) return JSON.parse(saved);
    return [];
};

const loadInitialNotifications = (): TeacherNotification[] => {
    const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (saved) return JSON.parse(saved);
    return [];
}

export let MOCK_USERS = loadInitialUsers();
export let MOCK_ATTENDANCE: AttendanceRecord[] = loadInitialAttendance();
export let MOCK_NOTIFICATIONS: TeacherNotification[] = loadInitialNotifications();

const saveChanges = () => {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(MOCK_USERS));
    localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(MOCK_ATTENDANCE));
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(MOCK_NOTIFICATIONS));
};

// === HELPER: CALCULATE XP & UPDATE LEVEL ===
const calculateUserXPAndLevel = (userId: string, allRecords: AttendanceRecord[]) => {
    const userRecords = allRecords.filter(r => r.userId === userId);
    
    // 1. Calculate XP
    let xp = 0;
    userRecords.forEach(r => {
        if (r.status === 'Hadir') xp += 10;
        else if (r.status === 'Sakit' || r.status === 'Izin') xp += 5;
    });

    // 2. Calculate Level based on XP
    const level = calculateLevel(xp);

    return { xp, level };
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
    // 1. Load User First
    MOCK_USERS = loadInitialUsers(); 
    const cleanNis = nis.trim();
    const user = MOCK_USERS[cleanNis];
    
    if (user) {
        // === MASTER SYNC ===
        const sheetRecords = await fetchSheetAttendance();
        const localRecords = loadInitialAttendance();
        const mergedMap = new Map<string, AttendanceRecord>();

        localRecords.forEach(r => mergedMap.set(`${r.userId}-${r.date}`, r));
        sheetRecords.forEach(r => {
            const key = `${r.userId}-${r.date}`;
            if (!mergedMap.has(key)) mergedMap.set(key, r);
        });

        MOCK_ATTENDANCE = Array.from(mergedMap.values());
        
        // RECALCULATE XP & LEVEL FOR THIS USER
        const { xp, level } = calculateUserXPAndLevel(user.uid, MOCK_ATTENDANCE);
        
        // Update user object if changed
        if (user.xp !== xp || user.level !== level) {
            user.xp = xp;
            user.level = level;
            MOCK_USERS[cleanNis] = user;
            saveChanges();
        }
        
        return user;
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(user || null);
      }, 500);
    });
  },
  
  // LOCK DATA (Updates XP & Level for everyone)
  lockAttendanceData: async (): Promise<number> => {
      const sheetRecords = await fetchSheetAttendance();
      MOCK_ATTENDANCE = loadInitialAttendance();
      
      let newRecordsCount = 0;

      sheetRecords.forEach(sheetRecord => {
          const existsIndex = MOCK_ATTENDANCE.findIndex(
              local => local.userId === sheetRecord.userId && local.date === sheetRecord.date
          );

          if (existsIndex === -1) {
              MOCK_ATTENDANCE.push({
                  ...sheetRecord,
                  id: `locked-${sheetRecord.userId}-${sheetRecord.date}`,
                  isVerified: true
              });
              newRecordsCount++;
          } else {
              if (!MOCK_ATTENDANCE[existsIndex].isVerified) {
                   MOCK_ATTENDANCE[existsIndex] = {
                       ...MOCK_ATTENDANCE[existsIndex],
                       status: sheetRecord.status,
                       details: sheetRecord.details,
                       isVerified: true
                   };
              }
          }
      });

      // SYNC XP & LEVEL FOR ALL USERS
      const allUserKeys = Object.keys(MOCK_USERS);
      allUserKeys.forEach(key => {
          const u = MOCK_USERS[key];
          const { xp, level } = calculateUserXPAndLevel(u.uid, MOCK_ATTENDANCE);
          if (u.xp !== xp || u.level !== level) {
              u.xp = xp;
              u.level = level;
              MOCK_USERS[key] = u;
          }
      });

      saveChanges();
      
      return new Promise(resolve => setTimeout(() => resolve(newRecordsCount), 1000));
  },
  
  getUser: async (nis: string): Promise<User | null> => {
     const users = loadInitialUsers();
     return users[nis] || null; 
  },

  // NEW: INSTANT LOCAL GET
  getLocalAttendance: (): AttendanceRecord[] => {
      return loadInitialAttendance();
  },

  getAttendance: async (): Promise<AttendanceRecord[]> => {
    const local = loadInitialAttendance();
    const sheet = await fetchSheetAttendance();
    
    const mergedMap = new Map<string, AttendanceRecord>();
    local.forEach(r => mergedMap.set(`${r.userId}-${r.date}`, r));
    sheet.forEach(r => {
        if (!mergedMap.has(`${r.userId}-${r.date}`)) mergedMap.set(`${r.userId}-${r.date}`, r);
    });

    return Array.from(mergedMap.values());
  },
  
  getNotifications: async (): Promise<TeacherNotification[]> => {
    MOCK_NOTIFICATIONS = loadInitialNotifications();
    return new Promise(resolve => setTimeout(() => resolve([...MOCK_NOTIFICATIONS]), 300));
  },
  
  getLeaderboard: async (): Promise<User[]> => {
      const users = loadInitialUsers();
      return new Promise(resolve => {
          const sorted = Object.values(users)
            .filter(u => u.role === 'student')
            .sort((a, b) => (b.xp || 0) - (a.xp || 0))
            .slice(0, 50);
          setTimeout(() => resolve(sorted), 400);
      });
  },

  verifyPermit: async (recordId: string, status: 'Hadir' | 'Sakit' | 'Izin' | 'Alpa'): Promise<boolean> => {
     return new Promise(resolve => {
         MOCK_ATTENDANCE = loadInitialAttendance();
         const idx = MOCK_ATTENDANCE.findIndex(a => a.id === recordId);
         if (idx !== -1) {
             MOCK_ATTENDANCE[idx].status = status;
             MOCK_ATTENDANCE[idx].isVerified = true;
             
             // Update XP & Level immediately
             const uid = MOCK_ATTENDANCE[idx].userId;
             const userKey = Object.keys(MOCK_USERS).find(k => MOCK_USERS[k].uid === uid);
             if (userKey) {
                 const { xp, level } = calculateUserXPAndLevel(uid, MOCK_ATTENDANCE);
                 MOCK_USERS[userKey].xp = xp;
                 MOCK_USERS[userKey].level = level;
             }

             saveChanges();
         }
         setTimeout(() => resolve(true), 600);
     })
  },
  
  submitPermit: async (permit: Omit<AttendanceRecord, 'id' | 'userName' | 'userClass'>): Promise<boolean> => {
    return new Promise(async (resolve) => {
        MOCK_USERS = loadInitialUsers();
        MOCK_ATTENDANCE = loadInitialAttendance();
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

            // Update XP & Level immediately
            const userKey = Object.keys(MOCK_USERS).find(k => MOCK_USERS[k].uid === permit.userId);
             if (userKey) {
                 const { xp, level } = calculateUserXPAndLevel(permit.userId, MOCK_ATTENDANCE);
                 MOCK_USERS[userKey].xp = xp;
                 MOCK_USERS[userKey].level = level;
             }

            saveChanges();
        }
        setTimeout(() => resolve(true), 800);
    });
  },

  addStudent: async (studentData: { name: string, nis: string, class: string }): Promise<boolean> => {
      return new Promise((resolve) => {
        MOCK_USERS = loadInitialUsers();
        if (MOCK_USERS[studentData.nis]) {
             resolve(false);
             return;
        }

        const newId = Math.random().toString(36).substr(2, 9);
        const newUser: User = {
            uid: newId,
            nis: studentData.nis,
            name: studentData.name,
            class: studentData.class,
            role: 'student',
            level: 1, // Start Level 1
            xp: 0,
            photo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentData.name)}`
        };
        
        let deletedIDs: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY_DELETED) || '[]');
        deletedIDs = deletedIDs.filter(id => id !== studentData.nis);
        localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(deletedIDs));

        MOCK_USERS[studentData.nis] = newUser;
        saveChanges();
        resolve(true);
      });
  },

  updateStudent: async (uid: string, data: { name: string, class: string, nis: string }): Promise<boolean> => {
      return new Promise((resolve) => {
          MOCK_USERS = loadInitialUsers();
          const userKey = Object.keys(MOCK_USERS).find(key => MOCK_USERS[key].uid === uid);
          
          if (!userKey) {
              resolve(false);
              return;
          }

          const oldUser = MOCK_USERS[userKey];
          
          if (oldUser.nis !== data.nis) {
              if (MOCK_USERS[data.nis]) {
                  resolve(false); 
                  return;
              }
              delete MOCK_USERS[userKey]; 
              MOCK_USERS[data.nis] = { ...oldUser, ...data, nis: data.nis };
          } else {
              MOCK_USERS[userKey] = { ...oldUser, ...data };
          }
          
          saveChanges();
          resolve(true);
      });
  },

  deleteStudent: async (uid: string): Promise<boolean> => {
      return new Promise((resolve) => {
          MOCK_USERS = loadInitialUsers();
          const userKey = Object.keys(MOCK_USERS).find(key => MOCK_USERS[key].uid === uid);
          
          if (userKey) {
              const userNIS = MOCK_USERS[userKey].nis;
              const deletedIDs: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY_DELETED) || '[]');
              if (!deletedIDs.includes(userNIS)) {
                  deletedIDs.push(userNIS);
                  localStorage.setItem(STORAGE_KEY_DELETED, JSON.stringify(deletedIDs));
              }

              delete MOCK_USERS[userKey];
              saveChanges();
              
              resolve(true);
          } else {
              resolve(false);
          }
      });
  }
};