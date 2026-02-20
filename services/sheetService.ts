import { AttendanceRecord } from '../types';
import { DATA_SISWA } from './mockData';

// ============================================================================
// KONFIGURASI LINK SPREADSHEET (READ ONLY)
// ============================================================================
export const CLASS_SHEET_URLS: Record<string, string> = {
  // --- KELAS 7 ---
  '7A': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=422320224&single=true&output=csv',
  '7B': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=2061295951&single=true&output=csv',
  '7C': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=1278930224&single=true&output=csv',
  '7D': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=403694118&single=true&output=csv',
  '7E': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=1922473248&single=true&output=csv',
  '7F': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=237451801&single=true&output=csv',
  '7G': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=1138110547&single=true&output=csv',

  // --- KELAS 8 ---
  '8A': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=1138665490&single=true&output=csv',
  '8B': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=238961063&single=true&output=csv',
  '8C': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=1398167255&single=true&output=csv',
  '8D': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=1152865268&single=true&output=csv',
  '8E': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=356890560&single=true&output=csv',
  '8F': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=629138211&single=true&output=csv',
  '8G': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=1495228331&single=true&output=csv',
  '8H': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=2027963723&single=true&output=csv',
  '8I': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=1621726434&single=true&output=csv',

  // --- KELAS 9 ---
  '9A': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=1101331230&single=true&output=csv',
  '9B': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=134959723&single=true&output=csv',
  '9C': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=31039592&single=true&output=csv',
  '9D': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=1828210703&single=true&output=csv',
  '9E': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=178623282&single=true&output=csv',
  '9F': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=538922190&single=true&output=csv',
  '9G': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=2077994314&single=true&output=csv',
  '9H': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=1692323982&single=true&output=csv',
  '9I': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFA740h6d7-Cy-p26A97kY70dcttjuvspQxQyfK9a066jTtgJk447HUQrbAuZRJIODZfRVap2EcQth/pub?gid=549562174&single=true&output=csv'
};

// ============================================================================
// KONFIGURASI FORMULIR ABSENSI (LINK SYSTEM)
// ============================================================================
const ATTENDANCE_FORM_ID = '1FAIpQLSddVTbGsgAcawIbAyctWbRptSqekCsuOiv9ImJ8Injp7kMovQ';
const ENTRY_NAME = 'entry.1390122158';
const ENTRY_STATUS = 'entry.2112276150';

export const submitToGoogleFormBackground = async (name: string, status: 'H' | 'S' | 'I' | 'A') => {
    // METODE POST (Lebih stabil untuk submission)
    const baseUrl = `https://docs.google.com/forms/d/e/${ATTENDANCE_FORM_ID}/formResponse`;
    
    // Mapping Code to Full Word (Google Form Validation Fix)
    let finalStatus: string = status;
    if (status === 'H') finalStatus = 'Hadir';
    if (status === 'S') finalStatus = 'Sakit';
    if (status === 'I') finalStatus = 'Izin';
    if (status === 'A') finalStatus = 'Alpa';

    const params = new URLSearchParams();
    params.append(ENTRY_NAME, name);
    params.append(ENTRY_STATUS, finalStatus);
    params.append('submit', 'Submit');

    try {
        await fetch(baseUrl, {
            method: 'POST',
            mode: 'no-cors', // CRITICAL: Mencegah error CORS blokir request
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });
        // Karena no-cors, kita tidak bisa cek response.ok, anggap sukses jika tidak throw error network
        return true;
    } catch (error) {
        console.error("[Link System] Gagal menembak link:", error);
        return false;
    }
};

// ============================================================================
// PARSING UTILS
// ============================================================================

const splitCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuote = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result.map(s => s.trim().replace(/^"|"$/g, '').trim());
};

const normalizeStatus = (code: string | undefined): 'Hadir' | 'Sakit' | 'Izin' | 'Alpa' | null => {
    if (!code) return null;
    const c = code.toUpperCase().trim();
    if (['H', 'HADIR', 'V', 'Y', '.', '√', 'MASUK'].some(x => c.includes(x))) return 'Hadir';
    if (['S', 'SAKIT'].some(x => c.includes(x))) return 'Sakit';
    if (['I', 'IZIN', 'IJIN'].some(x => c.includes(x))) return 'Izin';
    if (['A', 'ALPA', 'ALPHA'].some(x => c.includes(x))) return 'Alpa';
    return null;
}

const findStudent = (rawName: string, className: string) => {
    if (!rawName) return null;
    const cleanName = rawName.replace(/^[\d.]+\s*/, '').trim().toUpperCase();
    
    return DATA_SISWA.find(s => {
         if (s.kelas !== className) return false;
         const sName = s.nama.toUpperCase().replace(/\s+/g, ' ').trim();
         return sName === cleanName || cleanName.startsWith(sName) || sName.includes(cleanName);
    });
}

// ============================================================================
// MODE 1: MATRIX PARSER (Old Pivot Style)
// ============================================================================
const parseMatrixAttendance = (rows: string[][], className: string): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; 
    
    let headerRowIndex = -1;
    let nameIndex = -1;
    let dateColumnMap: Record<number, string> = {}; 

    for (let r = 0; r < Math.min(rows.length, 9); r++) {
        const rowData = rows[r];
        let foundDate = false;

        rowData.forEach((cell, idx) => {
            const cleanCell = cell.trim();
            if (/^(0?[1-9]|[12][0-9]|3[01])$/.test(cleanCell)) {
                foundDate = true;
                const day = parseInt(cleanCell);
                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                dateColumnMap[idx] = dateStr;
            }
        });

        if (foundDate) {
            headerRowIndex = r;
            break;
        }
    }

    if (headerRowIndex === -1) return [];

    const firstDataRow = rows[headerRowIndex + 1];
    const firstDateCol = Math.min(...Object.keys(dateColumnMap).map(Number));
    
    if (firstDataRow) {
        let maxLen = 0;
        for (let c = 0; c < firstDateCol; c++) {
            const cell = firstDataRow[c];
            if (cell && !/^[\d.\s]+$/.test(cell) && cell.length > maxLen) {
                maxLen = cell.length;
                nameIndex = c;
            }
        }
    }
    if (nameIndex === -1) nameIndex = 1; 

    for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;
        
        const rawName = row[nameIndex];
        if (!rawName) continue;

        const student = findStudent(rawName, className);
        if (!student) continue;

        for (const [colIdxStr, dateStr] of Object.entries(dateColumnMap)) {
            const colIdx = parseInt(colIdxStr);
            const statusCode = row[colIdx];
            const status = normalizeStatus(statusCode);

            if (status) {
                records.push({
                    id: `sheet-mtx-${className}-${student.id}-${dateStr}`,
                    userId: student.id,
                    userName: student.nama,
                    userClass: student.kelas,
                    status: status,
                    type: status === 'Sakit' ? 'Sakit' : status === 'Izin' ? 'Izin' : undefined,
                    date: dateStr,
                    time: '07:00',
                    details: 'Rekap Absensi Harian',
                    isVerified: true
                });
            }
        }
    }
    return records;
};

// ============================================================================
// MODE 2: LOG PARSER (Form Responses)
// ============================================================================
const parseLogAttendance = (rows: string[][], className: string): AttendanceRecord[] => {
    const records: AttendanceRecord[] = [];
    if (rows.length < 2) return [];

    const header = rows[0].map(c => c.toLowerCase());
    
    // Detect Columns
    const nameIdx = header.findIndex(c => c.includes('nama'));
    
    // Timestamp column is critical for time
    const timestampIdx = header.findIndex(c => c.includes('timestamp') || c.includes('waktu'));
    
    // Note column
    const noteIdx = header.findIndex(c => c.includes('keterangan') || c.includes('alasan') || c.includes('catatan'));
    
    const statusIdx = header.findIndex(c => c.includes('status') || c.includes('kehadiran') || c.includes('keterangan'));

    if (nameIdx === -1 || (statusIdx === -1 && noteIdx === -1)) return [];

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row) continue;

        const rawName = row[nameIdx];
        const rawTimestamp = timestampIdx !== -1 ? row[timestampIdx] : null;
        
        // Strategy: Status might be in 'Status' column OR inferred from 'Keterangan'
        let rawStatus = statusIdx !== -1 ? row[statusIdx] : 'Hadir';
        const rawNote = noteIdx !== -1 ? row[noteIdx] : '';

        if (!rawName) continue;

        // Parse Date & Time from Timestamp
        let isoDate = new Date().toLocaleDateString('en-CA');
        let timeStr = '07:00'; // Default if no timestamp

        if (rawTimestamp) {
            const d = new Date(rawTimestamp);
            if (!isNaN(d.getTime())) {
                // Adjust for YYYY-MM-DD
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                isoDate = `${year}-${month}-${day}`;
                
                // Adjust for HH:mm
                const hours = String(d.getHours()).padStart(2, '0');
                const minutes = String(d.getMinutes()).padStart(2, '0');
                timeStr = `${hours}:${minutes}`;
            }
        } else {
             // Fallback: Check if there is a separate 'Tanggal' column
             const dateColIdx = header.findIndex(c => c.includes('tanggal'));
             if (dateColIdx !== -1 && row[dateColIdx]) {
                 const rawDate = row[dateColIdx];
                 if (rawDate.includes('/')) {
                    const parts = rawDate.split('/'); // 16/02/2026
                    if (parts.length === 3) isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                 } else {
                    isoDate = rawDate;
                 }
             }
        }

        const student = findStudent(rawName, className);
        const status = normalizeStatus(rawStatus);

        if (student && status) {
            records.push({
                id: `sheet-log-${className}-${student.id}-${isoDate}`,
                userId: student.id,
                userName: student.nama,
                userClass: student.kelas,
                status: status,
                type: status === 'Sakit' ? 'Sakit' : status === 'Izin' ? 'Izin' : undefined,
                date: isoDate,
                time: timeStr, // REAL TIME FROM TIMESTAMP
                details: rawNote || (status === 'Hadir' ? 'Presensi Tepat Waktu' : `Keterangan: ${status}`),
                isVerified: true
            });
        }
    }
    return records;
};

// ============================================================================
// MAIN FETCH FUNCTION
// ============================================================================
const fetchSingleClassAttendance = async (className: string, url: string): Promise<AttendanceRecord[]> => {
  if (!url) return [];
  const fetchUrl = `${url}&t=${Date.now()}`;

  try {
    const response = await fetch(fetchUrl);
    if (!response.ok) return [];
    
    const csvText = await response.text();
    if (csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) return [];

    const rows = csvText.split(/\r?\n/).map(row => splitCSVLine(row));
    if (rows.length < 2) return []; 

    // === AUTO DETECT ENGINE ===
    const headerRow = rows[0].join(' ').toLowerCase();
    
    // Priority: If it has "Timestamp", treat as Log/Form Response
    const isLog = headerRow.includes('timestamp') || headerRow.includes('waktu');

    if (isLog) {
        return parseLogAttendance(rows, className);
    } else {
        return parseMatrixAttendance(rows, className);
    }

  } catch (error) {
    console.warn(`[${className}] Fetch error`, error);
    return [];
  }
};

export const fetchSheetAttendance = async (): Promise<AttendanceRecord[]> => {
  const hasConfiguredUrls = Object.values(CLASS_SHEET_URLS).some(url => url !== '');
  if (!hasConfiguredUrls) return [];

  console.log(`[SYNC] Starting FULL HISTORY sync from sheets...`);
  const promises = Object.entries(CLASS_SHEET_URLS).map(([className, url]) => 
    fetchSingleClassAttendance(className, url)
  );

  try {
    const results = await Promise.all(promises);
    return results.flat();
  } catch (error) {
    console.error("Global fetch error:", error);
    return [];
  }
};