import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const email = process.env.FIREBASE_CLIENT_EMAIL || "";
  const key = process.env.FIREBASE_PRIVATE_KEY || "";
  const sa = process.env.FIREBASE_SERVICE_ACCOUNT || "";

  return NextResponse.json({
    status: "ok",
    hasProjectId: !!process.env.FIREBASE_PROJECT_ID,
    projectId: process.env.FIREBASE_PROJECT_ID || null,
    hasClientEmail: !!email,
    clientEmail: email ? email.substring(0, 10) + "..." : null,
    hasPrivateKey: !!key,
    privateKeyLength: key.length,
    privateKeyFirst30: key ? key.substring(0, 30) : null,
    hasServiceAccount: !!sa,
    serviceAccountLength: sa.length,
    nodeVersion: process.version,
  });
}
