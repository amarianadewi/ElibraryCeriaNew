import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";
import { getAuth, Auth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

function getCredentials() {
  const saEnv = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "";
  if (saEnv) {
    try {
      let raw = saEnv.trim();
      if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
        raw = raw.slice(1, -1).trim();
      }
      if (!raw.startsWith("{")) {
        raw = Buffer.from(raw, "base64").toString("utf-8").trim();
      }
      return JSON.parse(raw);
    } catch (e: any) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT:", e.message);
    }
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let rawKey = process.env.FIREBASE_PRIVATE_KEY;
  if (clientEmail && rawKey) {
    rawKey = rawKey.trim();
    if ((rawKey.startsWith('"') && rawKey.endsWith('"')) || (rawKey.startsWith("'") && rawKey.endsWith("'"))) {
      rawKey = rawKey.slice(1, -1).trim();
    }
    rawKey = rawKey.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n");
    return {
      projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "elibrary-2ba9f",
      clientEmail,
      privateKey: rawKey,
    };
  }

  const serviceAccountPath = path.resolve(process.cwd(), "service-account.json");
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const raw = fs.readFileSync(serviceAccountPath, "utf-8");
      return JSON.parse(raw);
    } catch (e: any) {
      console.error("Failed to read local service-account.json:", e.message);
    }
  }

  return null;
}

function initAdmin(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const creds = getCredentials();
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "elibrary-2ba9f";
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "elibrary-2ba9f.firebasestorage.app";

  if (creds) {
    return initializeApp({
      credential: cert(creds),
      storageBucket,
    });
  }

  console.warn("⚠️ Warning: Firebase Admin initialized without credentials.");
  return initializeApp({
    projectId,
    storageBucket,
  });
}

export const adminApp: App = initAdmin();
export const adminDb: Firestore = getFirestore(adminApp);
export const adminAuth: Auth = getAuth(adminApp);
export const adminStorage: Storage = getStorage(adminApp);

export function getFirebaseAdminStatus() {
  const saEnv = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const hasLocalFile = fs.existsSync(path.resolve(process.cwd(), "service-account.json"));

  const isPrivateKeyValidFormat = !!rawKey && rawKey.includes("BEGIN PRIVATE KEY") && rawKey.includes("END PRIVATE KEY");

  return {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "elibrary-2ba9f",
    hasClientEmail: !!clientEmail,
    clientEmailMasked: clientEmail ? clientEmail.replace(/^(...).*(@.*)$/, "$1***$2") : null,
    hasPrivateKey: !!rawKey,
    isPrivateKeyValidFormat,
    hasServiceAccountJsonEnv: !!saEnv,
    hasLocalServiceAccountFile: hasLocalFile,
    isConfigured: (!!clientEmail && !!rawKey) || !!saEnv || hasLocalFile,
  };
}
