export type UserRole = "student" | "admin";

export interface Student {
  id: string;
  nisn: string;
  name: string;
  classId: string;
  birthDate: string; // YYYY-MM-DD
  mustChangePassword?: boolean;
  isActive: boolean;
  totalPoints: number;
  totalBooksCompleted: number;
  totalPagesRead: number;
  totalReadingMinutes: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassModel {
  id: string;
  name: string; // e.g., "1A", "3B"
  grade: number; // 1 to 6
  academicYear: string; // e.g., "2025/2026"
  isActive: boolean;
}

export type ReadingLevel = "Dini" | "Awal" | "Semenjana" | "Madya" | "Mahir";

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  publicationYear: number;
  description: string;
  category: string;
  coverUrl: string;
  pdfUrl?: string;
  pdfStoragePath: string;
  totalPages: number;
  readingLevel: ReadingLevel | string;
  recommendedAgeMin: number;
  recommendedAgeMax: number;
  recommendedGrades: number[];
  aiSummary?: string;
  aiConfidence?: number;
  classificationStatus?: "verified" | "pending_review" | "manual";
  sourceUrl?: string;
  sourceLicenseNotes?: string;
  checksum?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ReadingStatus = "belum" | "sedang" | "selesai";

export interface ReadingProgress {
  id: string;
  studentId: string;
  bookId: string;
  lastPage: number;
  highestPage: number;
  readPageNumbers: number[]; // Set of unique pages read
  pagesReadCount: number;
  progressPercentage: number;
  readingMinutes: number;
  status: ReadingStatus;
  lastReadAt: string;
  updatedAt: string;
}

export interface ReadingJournal {
  id: string;
  studentId: string;
  bookId: string;
  bookTitle: string;
  readingDate: string; // YYYY-MM-DD
  durationMinutes: number;
  pagesRead: number;
  summary: string;
  createdAt: string;
  updatedAt?: string;
}

export type ActivityType =
  | "reading_duration" // 5 pts per 10 active mins
  | "reading_pages" // 5 pts per 20 unique pages
  | "book_completed" // 20 pts once per book
  | "journal_submitted" // 5 pts
  | "reading_streak_7d" // 15 pts bonus
  | "manual_adjustment";

export interface PointTransaction {
  id: string;
  studentId: string;
  activityType: ActivityType;
  points: number;
  referenceId?: string; // bookId or journalId
  description: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirementType: "books_completed" | "points_reached" | "streak_days";
  requirementValue: number;
}

export interface StudentBadge {
  id: string;
  studentId: string;
  badgeId: string;
  awardedAt: string;
}

export interface BookAgentLog {
  id: string;
  startedAt: string;
  finishedAt?: string;
  status: "running" | "completed" | "failed";
  totalBooksFound: number;
  totalBooksDownloaded: number;
  totalBooksFailed: number;
  totalDuplicates: number;
  errors?: string[];
}

