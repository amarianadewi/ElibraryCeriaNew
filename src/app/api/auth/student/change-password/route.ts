import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";
import { getStudentSession, createStudentToken } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export async function POST(req: Request) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid. Silakan login kembali." }, { status: 401 });
    }

    const { oldPassword, newPassword } = await req.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password baru minimal terdiri dari 6 karakter." },
        { status: 400 }
      );
    }

    const studentRef = adminDb.collection("students").doc(session.studentId);
    const docSnap = await studentRef.get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Data siswa tidak ditemukan." }, { status: 404 });
    }

    const studentData = docSnap.data()!;

    // Check old password
    const isOldValid = await verifyPassword(oldPassword, studentData.passwordHash);
    if (!isOldValid) {
      return NextResponse.json(
        { error: "Password lama tidak sesuai." },
        { status: 400 }
      );
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    await studentRef.update({
      passwordHash: newHash,
      mustChangePassword: false,
      updatedAt: new Date().toISOString(),
    });

    // Update cookie session with mustChangePassword = false
    const newToken = await createStudentToken({
      ...session,
      mustChangePassword: false,
    });

    const cookieStore = await cookies();
    cookieStore.set("student_token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Password berhasil diperbarui!",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat memperbarui password." },
      { status: 500 }
    );
  }
}

