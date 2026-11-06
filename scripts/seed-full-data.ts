import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import crypto from "crypto";

const ITERATIONS = 100000;
const KEY_LEN = 64;
const DIGEST = "sha512";

async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LEN, DIGEST, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

async function main() {
  const serviceAccount = JSON.parse(fs.readFileSync("service-account.json", "utf-8"));
  const app = initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore(app);

  console.log("Seeding realistic school data for SD Negeri Kaliwungu 05...");

  const defaultHash = await hashPassword("123456");
  const changedHash = await hashPassword("berprestasi2026");

  // Sample students across grades 1-6
  const sampleStudents = [
    {
      id: "student-andi",
      nisn: "1234567890",
      name: "Andi Pratama",
      classId: "kelas-3",
      birthDate: "2016-05-15",
      mustChangePassword: true,
      totalPoints: 125,
      totalBooksCompleted: 5,
      totalPagesRead: 140,
      totalReadingMinutes: 180,
    },
    {
      id: "student-siti",
      nisn: "1234567891",
      name: "Siti Rahmawati",
      classId: "kelas-4",
      birthDate: "2015-08-20",
      mustChangePassword: false,
      totalPoints: 245,
      totalBooksCompleted: 10,
      totalPagesRead: 280,
      totalReadingMinutes: 320,
    },
    {
      id: "student-budi",
      nisn: "1234567892",
      name: "Budi Santoso",
      classId: "kelas-2",
      birthDate: "2017-02-10",
      mustChangePassword: false,
      totalPoints: 95,
      totalBooksCompleted: 4,
      totalPagesRead: 90,
      totalReadingMinutes: 120,
    },
    {
      id: "student-dewi",
      nisn: "1234567893",
      name: "Dewi Lestari",
      classId: "kelas-5",
      birthDate: "2014-11-05",
      mustChangePassword: false,
      totalPoints: 340,
      totalBooksCompleted: 14,
      totalPagesRead: 420,
      totalReadingMinutes: 460,
    },
    {
      id: "student-rizky",
      nisn: "1234567894",
      name: "Rizky Ramadhan",
      classId: "kelas-6",
      birthDate: "2013-09-18",
      mustChangePassword: false,
      totalPoints: 480,
      totalBooksCompleted: 18,
      totalPagesRead: 560,
      totalReadingMinutes: 610,
    },
    {
      id: "student-putri",
      nisn: "1234567895",
      name: "Putri Ayu Ningrum",
      classId: "kelas-1",
      birthDate: "2018-04-22",
      mustChangePassword: false,
      totalPoints: 80,
      totalBooksCompleted: 3,
      totalPagesRead: 60,
      totalReadingMinutes: 90,
    },
    {
      id: "student-fajar",
      nisn: "1234567896",
      name: "Fajar Hidayat",
      classId: "kelas-3",
      birthDate: "2016-07-30",
      mustChangePassword: false,
      totalPoints: 170,
      totalBooksCompleted: 7,
      totalPagesRead: 190,
      totalReadingMinutes: 230,
    },
    {
      id: "student-zahra",
      nisn: "1234567897",
      name: "Zahra Aulia",
      classId: "kelas-4",
      birthDate: "2015-12-14",
      mustChangePassword: false,
      totalPoints: 310,
      totalBooksCompleted: 12,
      totalPagesRead: 350,
      totalReadingMinutes: 390,
    },
  ];

  const studentsRef = db.collection("students");
  for (const s of sampleStudents) {
    await studentsRef.doc(s.id).set(
      {
        ...s,
        passwordHash: s.mustChangePassword ? defaultHash : changedHash,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  }
  console.log(`✓ Seeded ${sampleStudents.length} students across grades 1-6.`);

  // Sample Journals
  const journalsRef = db.collection("reading_journals");
  const sampleJournals = [
    {
      studentId: "student-andi",
      bookTitle: "Pelung Keluar Kampung",
      readingDate: "2026-11-04",
      durationMinutes: 20,
      pagesRead: 15,
      summary: "Cerita tentang Pelung yang berani menjelajah di luar kampungnya dan belajar banyak hal baru tentang kerja sama.",
      createdAt: new Date().toISOString(),
    },
    {
      studentId: "student-siti",
      bookTitle: "Petualangan Bima di Hutan Tropis",
      readingDate: "2026-11-03",
      durationMinutes: 25,
      pagesRead: 20,
      summary: "Bima belajar menjaga kelestarian alam dan tidak membuang sampah sembarangan di hutan lindung.",
      createdAt: new Date().toISOString(),
    },
    {
      studentId: "student-dewi",
      bookTitle: "Mengenal Tata Surya Kita",
      readingDate: "2026-11-02",
      durationMinutes: 30,
      pagesRead: 25,
      summary: "Buku sains yang sangat seru! Saya jadi tahu tentang planet Mars dan cincin Saturnus.",
      createdAt: new Date().toISOString(),
    },
  ];

  for (const j of sampleJournals) {
    await journalsRef.add(j);
  }
  console.log(`✓ Seeded sample reading journals.`);

  // Seed Badges for top students
  const studentBadgesRef = db.collection("student_badges");
  const badgesToAward = [
    { studentId: "student-andi", badgeId: "pembaca-pemula" },
    { studentId: "student-andi", badgeId: "sahabat-buku" },
    { studentId: "student-siti", badgeId: "pembaca-pemula" },
    { studentId: "student-siti", badgeId: "sahabat-buku" },
    { studentId: "student-siti", badgeId: "pecinta-literasi" },
    { studentId: "student-rizky", badgeId: "pembaca-pemula" },
    { studentId: "student-rizky", badgeId: "sahabat-buku" },
    { studentId: "student-rizky", badgeId: "pecinta-literasi" },
    { studentId: "student-rizky", badgeId: "pembaca-konsisten" },
  ];

  for (const sb of badgesToAward) {
    const id = `${sb.studentId}_${sb.badgeId}`;
    await studentBadgesRef.doc(id).set({
      ...sb,
      awardedAt: new Date().toISOString(),
    });
  }
  console.log(`✓ Awarded sample badges.`);

  console.log("\nDATA SEEDING COMPLETED SUCCESSFULLY!");
}

main().catch(console.error);

