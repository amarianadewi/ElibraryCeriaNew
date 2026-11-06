import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { verifyPassword } from "@/lib/auth/password";
import { createStudentToken } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { nisn, password } = await req.json();

    if (!nisn || !password) {
      return NextResponse.json(
        { error: "NISN dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanNisn = String(nisn).trim();

    // Query student by NISN with timeout safety (max 8s to prevent Vercel 504 Gateway Timeout)
    const queryPromise = adminDb
      .collection("students")
      .where("nisn", "==", cleanNisn)
      .limit(1)
      .get();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "Koneksi ke database Firebase timeout (melebihi 8 detik). Pastikan FIREBASE_CLIENT_EMAIL dan FIREBASE_PRIVATE_KEY sudah diatur di Environment Variables Vercel dan lakukan Redeploy."
            )
          ),
        8000
      )
    );

    const snapshot = await Promise.race([queryPromise, timeoutPromise]);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: "NISN tidak ditemukan. Hubungi Guru Kelas atau Kepala Sekolah." },
        { status: 401 }
      );
    }

    const doc = snapshot.docs[0];
    const studentData = doc.data();

    if (studentData.isActive === false) {
      return NextResponse.json(
        { error: "Akun siswa ini sedang dinonaktifkan." },
        { status: 403 }
      );
    }

    // Verify password hash
    const isValid = await verifyPassword(password, studentData.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Password salah. Password awal adalah 123456." },
        { status: 401 }
      );
    }

    // Create session token
    const token = await createStudentToken({
      studentId: doc.id,
      nisn: studentData.nisn,
      name: studentData.name,
      classId: studentData.classId,
      mustChangePassword: studentData.mustChangePassword ?? false,
      role: "student",
    });

    const cookieStore = await cookies();
    cookieStore.set("student_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      mustChangePassword: studentData.mustChangePassword ?? false,
      student: {
        id: doc.id,
        nisn: studentData.nisn,
        name: studentData.name,
        classId: studentData.classId,
      },
    });
  } catch (error: any) {
    console.error("Student login error:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Terjadi kesalahan pada server saat login. Silakan hubungi admin.",
      },
      { status: 500 }
    );
  }
}

