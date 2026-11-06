import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";

/**
 * Clean private key from various environment variable formats
 * (strips wrapping quotes, fixes literal \n escape sequences, handles base64)
 */
function cleanPrivateKey(key: string): string {
  let cleaned = key.trim();

  // If the key is base64-encoded (often starts with LS0tLS1CRUdJTi for -----BEGIN)
  if (
    cleaned.startsWith("LS0tLS1CRUdJTi") ||
    (!cleaned.includes("-----BEGIN") && cleaned.length > 200 && /^[A-Za-z0-9+/=]+$/.test(cleaned))
  ) {
    try {
      const decoded = Buffer.from(cleaned, "base64").toString("utf-8");
      if (decoded.includes("BEGIN PRIVATE KEY")) {
        cleaned = decoded.trim();
      }
    } catch {
      // Ignore base64 decode failure and proceed
    }
  }

  // Strip wrapping single or double quotes if present
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Replace literal escaped \r\n or \n with actual newline characters
  cleaned = cleaned.replace(/\\r\\n/g, "\n");
  cleaned = cleaned.replace(/\\n/g, "\n");
  cleaned = cleaned.replace(/\r\n/g, "\n");
  cleaned = cleaned.replace(/\r/g, "\n");

  return cleaned;
}

function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "elibrary-2ba9f";
  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "elibrary-2ba9f.firebasestorage.app";

  // 1. Support full JSON string in FIREBASE_SERVICE_ACCOUNT (raw JSON or base64)
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountEnv) {
    try {
      let rawJson = serviceAccountEnv.trim();
      if (!rawJson.startsWith("{") && !rawJson.endsWith("}")) {
        // Try base64 decoding
        rawJson = Buffer.from(rawJson, "base64").toString("utf-8");
      }
      const parsed = JSON.parse(rawJson);
      return initializeApp({
        credential: cert(parsed),
        storageBucket,
      });
    } catch (e: any) {
      console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", e.message);
    }
  }

  // 2. Support standard FIREBASE_CLIENT_EMAIL & FIREBASE_PRIVATE_KEY
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && rawPrivateKey) {
    try {
      const privateKey = cleanPrivateKey(rawPrivateKey);
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket,
      });
    } catch (e: any) {
      console.error("Failed to initialize Firebase Admin with environment keys:", e.message);
    }
  }

  // 3. Fallback to local service-account.json if present (for local dev)
  const serviceAccountPath = path.resolve(process.cwd(), "service-account.json");
  if (fs.existsSync(serviceAccountPath)) {
    try {
      const raw = fs.readFileSync(serviceAccountPath, "utf-8");
      const parsed = JSON.parse(raw);
      return initializeApp({
        credential: cert(parsed),
        storageBucket,
      });
    } catch (e: any) {
      console.error("Failed to read local service-account.json:", e.message);
    }
  }

  // 4. Fallback default
  console.warn("⚠️ Warning: Firebase Admin initialized without explicit credentials. In non-GCP hosts (like Vercel), set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in Environment Variables.");
  return initializeApp({
    projectId,
    storageBucket,
  });
}

export const adminApp = getAdminApp();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);

export function getFirebaseAdminStatus() {
  const hasServiceAccount = !!(process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const hasLocalFile = fs.existsSync(path.resolve(process.cwd(), "service-account.json"));

  let keyValid = false;
  let keyLength = 0;
  if (rawKey) {
    const cleaned = cleanPrivateKey(rawKey);
    keyValid = cleaned.includes("BEGIN PRIVATE KEY") && cleaned.includes("END PRIVATE KEY");
    keyLength = cleaned.length;
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "elibrary-2ba9f",
    hasClientEmail: !!clientEmail,
    clientEmailMasked: clientEmail ? clientEmail.replace(/^(...).*(@.*)$/, "$1***$2") : null,
    hasPrivateKey: !!rawKey,
    isPrivateKeyValidFormat: keyValid,
    privateKeyLength: keyLength,
    hasServiceAccountJsonEnv: hasServiceAccount,
    hasLocalServiceAccountFile: hasLocalFile,
    isConfigured: (!!clientEmail && keyValid) || hasServiceAccount || hasLocalFile,
  };
}
