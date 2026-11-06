import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import fs from "fs";
import path from "path";

async function main() {
  console.log("Testing Firebase Admin SDK connection...");
  const serviceAccountPath = path.resolve(process.cwd(), "service-account.json");
  if (!fs.existsSync(serviceAccountPath)) {
    throw new Error("service-account.json not found!");
  }

  const raw = fs.readFileSync(serviceAccountPath, "utf-8");
  const serviceAccount = JSON.parse(raw);

  const app = initializeApp({
    credential: cert(serviceAccount),
    storageBucket: "elibrary-2ba9f.firebasestorage.app",
  });

  const db = getFirestore(app);
  const bucket = getStorage(app).bucket();

  console.log("Checking Firestore connection...");
  const testDoc = db.collection("system_check").doc("status");
  await testDoc.set({
    appName: "E-Library Kaliwungu 05 Ceria",
    status: "connected",
    testedAt: new Date().toISOString(),
  });
  console.log("✓ Successfully wrote to Firestore!");

  const docSnap = await testDoc.get();
  console.log("✓ Read from Firestore:", docSnap.data());

  console.log("Checking Storage bucket exists:", bucket.name);
  const [exists] = await bucket.exists();
  console.log("✓ Bucket exists:", exists);

  // Initialize standard badges if not existing
  const badgesRef = db.collection("badges");
  const standardBadges = [
    {
      id: "pembaca-pemula",
      name: "Pembaca Pemula",
      description: "Menyelesaikan buku pertama",
      icon: "🌱",
      requirementType: "books_completed",
      requirementValue: 1,
    },
    {
      id: "sahabat-buku",
      name: "Sahabat Buku",
      description: "Menyelesaikan 5 buku",
      icon: "📚",
      requirementType: "books_completed",
      requirementValue: 5,
    },
    {
      id: "pecinta-literasi",
      name: "Pecinta Literasi",
      description: "Menyelesaikan 10 buku",
      icon: "⭐",
      requirementType: "books_completed",
      requirementValue: 10,
    },
    {
      id: "kutu-buku",
      name: "Kutu Buku",
      description: "Menyelesaikan 25 buku",
      icon: "🐛",
      requirementType: "books_completed",
      requirementValue: 25,
    },
    {
      id: "juara-literasi",
      name: "Juara Literasi",
      description: "Mencapai 1.000 poin Bintang Literasi",
      icon: "👑",
      requirementType: "points_reached",
      requirementValue: 1000,
    },
    {
      id: "pembaca-konsisten",
      name: "Pembaca Konsisten",
      description: "Membaca selama 7 hari berbeda",
      icon: "🔥",
      requirementType: "streak_days",
      requirementValue: 7,
    },
  ];

  for (const b of standardBadges) {
    await badgesRef.doc(b.id).set(b, { merge: true });
  }
  console.log("✓ Badges verified & initialized in Firestore.");

  // Initialize standard classes
  const classesRef = db.collection("classes");
  const grades = [1, 2, 3, 4, 5, 6];
  for (const grade of grades) {
    const classId = `kelas-${grade}`;
    await classesRef.doc(classId).set(
      {
        id: classId,
        name: `Kelas ${grade}`,
        grade: grade,
        academicYear: "2025/2026",
        isActive: true,
      },
      { merge: true }
    );
  }
  console.log("✓ Classes initialized (Kelas 1–6).");

  console.log("\nALL FIREBASE CHECKS PASSED SUCCESSFULLY!");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
