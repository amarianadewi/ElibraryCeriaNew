import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";

async function deleteCollection(db: FirebaseFirestore.Firestore, collectionPath: string, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  let deleted = 0;
  while (true) {
    const snapshot = await query.get();
    if (snapshot.size === 0) {
      break;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    deleted += snapshot.size;
  }
  console.log(`✓ Deleted ${deleted} documents from collection: "${collectionPath}"`);
}

async function main() {
  console.log("=== MEMULAI PEMBERSIHAN MOCK DATA & PEMBUATAN AKUN ADMIN BARU ===");

  const serviceAccount = JSON.parse(fs.readFileSync("service-account.json", "utf-8"));
  const app = initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore(app);
  const auth = getAuth(app);

  // 1. Delete mock collections in Firestore
  const mockCollections = [
    "students",
    "reading_journals",
    "student_badges",
    "reading_progress",
    "reading_sessions",
    "book_agent_logs",
  ];

  for (const col of mockCollections) {
    await deleteCollection(db, col);
  }

  // 2. Manage Firebase Auth Users
  console.log("\n--- MENGELOLA AKUN AUTHENTICATION ---");
  const listUsersResult = await auth.listUsers(100);
  for (const user of listUsersResult.users) {
    console.log(`Menemukan akun: ${user.email} (${user.uid})`);
    if (user.email === "admin@kaliwungu05.sch.id" || user.email === "fitria.novetasari15@admin.sd.belajar.id") {
      await auth.deleteUser(user.uid);
      console.log(`✓ Akun lama ${user.email} berhasil dihapus.`);
    }
  }

  // 3. Create the new Admin account
  const newAdminEmail = "fitria.novetasari15@admin.sd.belajar.id";
  const newAdminPassword = "20320722";

  const newAdmin = await auth.createUser({
    email: newAdminEmail,
    password: newAdminPassword,
    displayName: "Fitria Novetasari (Admin SDN Kaliwungu 05)",
  });

  console.log("\n✓ SUKSES MEMBUAT AKUN SUPER ADMIN BARU:");
  console.log("UID      :", newAdmin.uid);
  console.log("Email    :", newAdmin.email);
  console.log("Nama     :", newAdmin.displayName);
  console.log("Password :", newAdminPassword);

  // 4. Verify Books collection remains intact
  const booksCount = (await db.collection("books").count().get()).data().count;
  console.log(`\n✓ Koleksi buku resmi tetap utuh: ${booksCount} buku.`);

  // 5. Verify Classes & Badges remain intact
  const classesCount = (await db.collection("classes").count().get()).data().count;
  const badgesCount = (await db.collection("badges").count().get()).data().count;
  console.log(`✓ Master kelas: ${classesCount} kelas.`);
  console.log(`✓ Master badges: ${badgesCount} badges.`);

  console.log("\n=== PEMBERSIHAN SELESAI DENGAN SUKSES ===");
}

main().catch((err) => {
  console.error("Gagal membersihkan data:", err);
  process.exit(1);
});

