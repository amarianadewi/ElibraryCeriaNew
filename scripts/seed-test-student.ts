import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import path from "path";
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

  const defaultHash = await hashPassword("123456");

  const studentRef = db.collection("students").doc("student-andi");
  await studentRef.set({
    id: "student-andi",
    nisn: "1234567890",
    name: "Andi Pratama",
    classId: "kelas-3",
    birthDate: "2016-05-15",
    passwordHash: defaultHash,
    mustChangePassword: true,
    isActive: true,
    totalPoints: 15,
    totalBooksCompleted: 1,
    totalPagesRead: 25,
    totalReadingMinutes: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  console.log("✓ Test student seeded: NISN = 1234567890, Password = 123456");
}

main().catch(console.error);

