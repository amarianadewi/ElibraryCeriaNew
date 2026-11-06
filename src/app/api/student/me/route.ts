import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getStudentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const docSnap = await adminDb.collection("students").doc(session.studentId).get();
    if (!docSnap.exists) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    const data = docSnap.data()!;
    const { passwordHash, ...safeData } = data;

    let className = safeData.classId;
    if (safeData.classId) {
      const classDoc = await adminDb.collection("classes").doc(safeData.classId).get();
      if (classDoc.exists) {
        className = classDoc.data()?.name || safeData.classId;
      }
    }

    return NextResponse.json({
      id: docSnap.id,
      ...safeData,
      className,
    });
  } catch (error) {
    console.error("Fetch student me error:", error);
    return NextResponse.json({ error: "Gagal memuat profil siswa" }, { status: 500 });
  }
}
