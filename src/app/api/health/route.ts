import { NextResponse } from "next/server";
import { adminDb, getFirebaseAdminStatus } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const startTime = Date.now();
  const adminStatus = getFirebaseAdminStatus();

  const diagnosticResult: {
    status: "ok" | "error";
    durationMs: number;
    adminConfig: ReturnType<typeof getFirebaseAdminStatus>;
    firestoreTest: {
      connected: boolean;
      studentsCountInSnapshot?: number;
      error?: string;
    };
    advice?: string[];
  } = {
    status: "ok",
    durationMs: 0,
    adminConfig: adminStatus,
    firestoreTest: {
      connected: false,
    },
  };

  const advice: string[] = [];

  if (!adminStatus.hasClientEmail) {
    advice.push("Variabel FIREBASE_CLIENT_EMAIL belum diset di Vercel Settings -> Environment Variables.");
  }

  if (!adminStatus.hasPrivateKey) {
    advice.push("Variabel FIREBASE_PRIVATE_KEY belum diset di Vercel Settings -> Environment Variables.");
  } else if (!adminStatus.isPrivateKeyValidFormat) {
    advice.push("Format FIREBASE_PRIVATE_KEY tampaknya tidak valid (harus mengandung '-----BEGIN PRIVATE KEY-----').");
  }

  try {
    // Attempt real read with a 5-second timeout
    const queryPromise = adminDb.collection("students").limit(1).get();
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Timeout koneksi Firestore (> 5000ms). Kredensial Vercel mungkin salah atau belum di-Redeploy.")),
        5000
      )
    );

    const snapshot = await Promise.race([queryPromise, timeoutPromise]);
    diagnosticResult.firestoreTest.connected = true;
    diagnosticResult.firestoreTest.studentsCountInSnapshot = snapshot.size;
  } catch (err: any) {
    diagnosticResult.status = "error";
    diagnosticResult.firestoreTest.connected = false;
    diagnosticResult.firestoreTest.error = err?.message || String(err);
    advice.push(
      "Gagal menghubungi Firestore: " + (err?.message || "Unknown error") + ". Jika Anda baru saja menambahkan Environment Variables di Vercel, jangan lupa untuk melakukan REDEPLOY agar perubahan diterapkan."
    );
  }

  if (advice.length > 0) {
    diagnosticResult.advice = advice;
  }

  diagnosticResult.durationMs = Date.now() - startTime;

  return NextResponse.json(diagnosticResult, {
    status: 200,
  });
}

