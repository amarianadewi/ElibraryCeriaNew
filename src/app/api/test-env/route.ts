import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const diagnostics: any = {
    step: "start",
    nodeVersion: process.version,
  };

  try {
    diagnostics.step = "import-firebase-admin-app";
    const { initializeApp, cert, getApps } = await import("firebase-admin/app");

    diagnostics.step = "import-firebase-admin-firestore";
    const { getFirestore } = await import("firebase-admin/firestore");

    diagnostics.step = "parse-credentials";
    const saEnv = process.env.FIREBASE_SERVICE_ACCOUNT || "";
    let credObj: any = null;

    if (saEnv) {
      let raw = saEnv.trim();
      if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
        raw = raw.slice(1, -1).trim();
      }
      if (!raw.startsWith("{")) {
        raw = Buffer.from(raw, "base64").toString("utf-8").trim();
      }
      credObj = JSON.parse(raw);
    } else {
      let key = (process.env.FIREBASE_PRIVATE_KEY || "").trim();
      if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
        key = key.slice(1, -1).trim();
      }
      key = key.replace(/\\n/g, "\n");
      credObj = {
        projectId: process.env.FIREBASE_PROJECT_ID || "elibrary-2ba9f",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: key,
      };
    }

    diagnostics.step = "initialize-app";
    diagnostics.hasClientEmail = !!credObj.client_email || !!credObj.clientEmail;
    diagnostics.hasPrivateKey = !!credObj.private_key || !!credObj.privateKey;

    const appName = "test-diagnostics-app";
    const app = initializeApp(
      {
        credential: cert(credObj),
      },
      appName
    );

    diagnostics.step = "get-firestore";
    const db = getFirestore(app);

    diagnostics.step = "query-firestore";
    const snap = await db.collection("students").limit(1).get();

    diagnostics.step = "done";
    diagnostics.success = true;
    diagnostics.docCount = snap.size;

    return NextResponse.json(diagnostics, { status: 200 });
  } catch (err: any) {
    diagnostics.error = {
      message: err?.message,
      stack: err?.stack,
      name: err?.name,
      code: err?.code,
    };
    return NextResponse.json(diagnostics, { status: 200 });
  }
}

