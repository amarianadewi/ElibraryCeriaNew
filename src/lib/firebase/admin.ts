import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
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

let _app: App | null = null;
let _db: Firestore | null = null;

export function getAdminApp(): App {
  if (_app) return _app;
  if (getApps().length > 0) {
    _app = getApp();
    return _app;
  }

  const creds = getCredentials();
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "elibrary-2ba9f";

  if (creds) {
    _app = initializeApp({
      credential: cert(creds),
    });
    return _app;
  }

  console.warn("⚠️ Warning: Firebase Admin initialized without credentials.");
  _app = initializeApp({
    projectId,
  });
  return _app;
}

export function getAdminDb(): Firestore {
  if (_db) return _db;
  _db = getFirestore(getAdminApp());
  return _db;
}

export const adminDb = new Proxy({} as Firestore, {
  get(_, prop) {
    if (prop === "then" || prop === Symbol.toStringTag || typeof prop === "symbol") {
      return undefined;
    }
    const db = getAdminDb();
    const val = (db as any)[prop];
    return typeof val === "function" ? val.bind(db) : val;
  },
});

export const adminApp = new Proxy({} as App, {
  get(_, prop) {
    if (prop === "then" || prop === Symbol.toStringTag || typeof prop === "symbol") {
      return undefined;
    }
    const app = getAdminApp();
    const val = (app as any)[prop];
    return typeof val === "function" ? val.bind(app) : val;
  },
});

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
