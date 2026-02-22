import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CATEGORIES = [
  "Fasilitas",
  "Kegiatan Sekolah",
  "Pembelajaran",
  "Keamanan",
  "Kebersihan",
  "Kantin",
  "Lainnya",
] as const;

export const STATUSES = [
  "Diterima",
  "Diproses",
  "Diajukan",
  "Selesai",
  "Ditolak",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type Status = (typeof STATUSES)[number];

export interface Aspiration {
  id: string;
  category: Category;
  content: string;
  status: Status;
  createdAt: number;
  isFlagged: boolean; // For moderation
}

// Simple bad words list (Indonesian) - for demo purposes
const BAD_WORDS = ["anjing", "babi", "bangsat", "tolol", "goblok", "bodoh", "setan", "monyet"];

export function filterProfanity(text: string): { cleanText: string; hasProfanity: boolean } {
  let cleanText = text;
  let hasProfanity = false;

  BAD_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    if (regex.test(cleanText)) {
      hasProfanity = true;
      cleanText = cleanText.replace(regex, "*".repeat(word.length));
    }
  });

  return { cleanText, hasProfanity };
}
