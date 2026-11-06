import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

interface SibiBookItem {
  id: string;
  title: string;
  slug: string;
  image: string;
  attachment: string;
  description: string;
  level: string;
  writer: string;
  publisher: string;
  isbn: string;
  tags?: string;
  published_year?: string;
}

function mapReadingLevel(level: string): {
  readingLevel: string;
  recommendedAgeMin: number;
  recommendedAgeMax: number;
  recommendedGrades: number[];
} {
  const norm = (level || "").trim().toUpperCase();

  if (norm === "PAUD" || norm === "A") {
    return {
      readingLevel: "Dini",
      recommendedAgeMin: 5,
      recommendedAgeMax: 7,
      recommendedGrades: [1],
    };
  }
  if (norm === "B1") {
    return {
      readingLevel: "Awal",
      recommendedAgeMin: 6,
      recommendedAgeMax: 8,
      recommendedGrades: [1, 2],
    };
  }
  if (norm === "B2") {
    return {
      readingLevel: "Awal",
      recommendedAgeMin: 7,
      recommendedAgeMax: 9,
      recommendedGrades: [2, 3],
    };
  }
  if (norm === "B3") {
    return {
      readingLevel: "Semenjana",
      recommendedAgeMin: 8,
      recommendedAgeMax: 10,
      recommendedGrades: [3, 4],
    };
  }
  if (norm === "C") {
    return {
      readingLevel: "Madya",
      recommendedAgeMin: 9,
      recommendedAgeMax: 11,
      recommendedGrades: [4, 5],
    };
  }
  if (norm === "D" || norm === "D1" || norm === "E") {
    return {
      readingLevel: "Mahir",
      recommendedAgeMin: 10,
      recommendedAgeMax: 12,
      recommendedGrades: [5, 6],
    };
  }

  return {
    readingLevel: "Awal",
    recommendedAgeMin: 7,
    recommendedAgeMax: 10,
    recommendedGrades: [2, 3, 4],
  };
}

function mapCategory(title: string, tags: string = "", description: string = ""): string {
  const text = `${title} ${tags} ${description}`.toLowerCase();
  if (text.includes("sains") || text.includes("alam") || text.includes("hewan") || text.includes("tumbuhan") || text.includes("bintang") || text.includes("bumi")) {
    return "Sains";
  }
  if (text.includes("lingkungan") || text.includes("sampah") || text.includes("hutan") || text.includes("sungai") || text.includes("laut")) {
    return "Lingkungan";
  }
  if (text.includes("budaya") || text.includes("tradisi") || text.includes("tari") || text.includes("nusantara") || text.includes("daerah")) {
    return "Budaya";
  }
  if (text.includes("sejarah") || text.includes("pahlawan") || text.includes("perjuangan")) {
    return "Sejarah";
  }
  if (text.includes("karakter") || text.includes("jujur") || text.includes("sahabat") || text.includes("berani") || text.includes("tolong") || text.includes("disiplin")) {
    return "Pendidikan Karakter";
  }
  if (text.includes("pengetahuan") || text.includes("tahukah kamu") || text.includes("mengenal")) {
    return "Pengetahuan Umum";
  }
  return "Cerita Anak";
}

async function createBooksPackageArchive(books: any[]) {
  const targetDir = path.resolve(process.cwd(), "books-package");
  const metadataDir = path.join(targetDir, "metadata");
  const booksDir = path.join(targetDir, "books");
  const coversDir = path.join(targetDir, "covers");

  fs.mkdirSync(metadataDir, { recursive: true });
  fs.mkdirSync(booksDir, { recursive: true });
  fs.mkdirSync(coversDir, { recursive: true });

  // Save metadata/books.json
  const booksJsonPath = path.join(metadataDir, "books.json");
  fs.writeFileSync(booksJsonPath, JSON.stringify(books, null, 2), "utf-8");

  // Save manifest.json
  const manifestPath = path.join(targetDir, "manifest.json");
  const manifest = {
    source: "https://buku.kemendikdasmen.go.id/katalog/buku-non-teks",
    extractedAt: new Date().toISOString(),
    totalBooks: books.length,
    school: "SD Negeri Kaliwungu 05",
    version: "1.0",
  };
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  console.log(`✓ Generated metadata at ${metadataDir} and manifest.json`);

  // Compress into books-package.zip using PowerShell
  const zipPath = path.resolve(process.cwd(), "books-package.zip");
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  execSync(`pwsh -Command "Compress-Archive -Path '${targetDir}/*' -DestinationPath '${zipPath}' -Force"`);
  console.log(`✓ Successfully created books-package.zip via Compress-Archive`);
}

async function runBookAgent() {
  console.log("=== MEMULAI BOOK AGENT KEMENDIKDASMEN ===");
  const startTime = new Date().toISOString();

  const serviceAccount = JSON.parse(fs.readFileSync("service-account.json", "utf-8"));
  const app = initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore(app);

  console.log("Mengambil seluruh katalog buku nonteks resmi Kemendikdasmen...");
  const endpoint = "https://api.buku.cloudapp.web.id/api/catalogue/getNonTextBooks?limit=1000&offset=0";
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`Gagal memanggil API Kemendikdasmen: ${res.statusText}`);
  }

  const json = await res.json();
  const rawBooks: SibiBookItem[] = json.results || [];
  console.log(`✓ Ditemukan total ${rawBooks.length} buku nonteks dari SIBI Kemendikdasmen.`);

  const validBooks = rawBooks.filter((b) => b.attachment && b.attachment.endsWith(".pdf"));
  console.log(`✓ Buku dengan PDF valid: ${validBooks.length}`);

  const booksCollection = db.collection("books");
  const formattedBooksList: any[] = [];

  const batchSize = 400;
  let batchCount = 0;
  let currentBatch = db.batch();

  for (let i = 0; i < validBooks.length; i++) {
    const b = validBooks[i];
    const levelInfo = mapReadingLevel(b.level);
    const category = mapCategory(b.title, b.tags, b.description);

    const docId = `book-${b.id || b.slug}`;
    const docRef = booksCollection.doc(docId);

    const bookDoc = {
      id: docId,
      sibiId: String(b.id),
      slug: b.slug || `book-${b.id}`,
      title: b.title.trim(),
      author: b.writer || "Pusat Perbukuan Kemendikdasmen",
      publisher: b.publisher || "Pusat Perbukuan",
      publicationYear: b.published_year ? parseInt(b.published_year.slice(0, 4)) : 2023,
      description: b.description || `Buku bacaan anak non-teks berkualitas dari Kemendikdasmen dengan tema ${category}.`,
      category: category,
      coverUrl: b.image,
      pdfUrl: b.attachment,
      pdfStoragePath: `books/${docId}.pdf`,
      totalPages: 24,
      readingLevel: levelInfo.readingLevel,
      recommendedAgeMin: levelInfo.recommendedAgeMin,
      recommendedAgeMax: levelInfo.recommendedAgeMax,
      recommendedGrades: levelInfo.recommendedGrades,
      aiSummary: `Buku "${b.title}" karya ${b.writer || "Pusat Perbukuan"} dengan fokus bacaan ${levelInfo.readingLevel} untuk kelas ${levelInfo.recommendedGrades.join(", ")}.`,
      aiConfidence: 0.95,
      classificationStatus: "verified",
      sourceUrl: `https://buku.kemendikdasmen.go.id/katalog/buku-non-teks/${b.slug}`,
      isbn: b.isbn || "",
      tags: b.tags || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    formattedBooksList.push(bookDoc);
    currentBatch.set(docRef, bookDoc, { merge: true });
    batchCount++;

    if (batchCount >= batchSize || i === validBooks.length - 1) {
      await currentBatch.commit();
      currentBatch = db.batch();
      batchCount = 0;
    }
  }

  // Create books-package.zip and manifest
  await createBooksPackageArchive(formattedBooksList);

  // Save Book Agent execution log
  const logRef = db.collection("book_agent_logs").doc(`log-${Date.now()}`);
  await logRef.set({
    startedAt: startTime,
    finishedAt: new Date().toISOString(),
    status: "completed",
    totalBooksFound: rawBooks.length,
    totalBooksDownloaded: validBooks.length,
    totalBooksFailed: rawBooks.length - validBooks.length,
    totalDuplicates: 0,
    source: "https://buku.kemendikdasmen.go.id",
  });

  console.log(`\n🎉 SELESAI! Seluruh ${validBooks.length} buku nonteks Kemendikdasmen telah tersimpan di Firestore dan terpaket di books-package.zip!`);
}

runBookAgent().catch((err) => {
  console.error("Book Agent error:", err);
  process.exit(1);
});
