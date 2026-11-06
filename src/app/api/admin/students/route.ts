import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { hashPassword } from "@/lib/auth/password";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId");
    const query = searchParams.get("q")?.toLowerCase();

    let queryRef = adminDb.collection("students") as FirebaseFirestore.Query;
    if (classId) {
      queryRef = queryRef.where("classId", "==", classId);
    }

    const snapshot = await queryRef.orderBy("createdAt", "desc").limit(200).get();

    let students = snapshot.docs.map((doc) => {
      const { passwordHash, ...safe } = doc.data();
      return {
        id: doc.id,
        ...safe,
      };
    }) as any[];

    if (query) {
      students = students.filter(
        (s) =>
          s.name?.toLowerCase().includes(query) ||
          s.nisn?.includes(query)
      );
    }

    return NextResponse.json({ students });
  } catch (error) {
    console.error("Fetch admin students error:", error);
    return NextResponse.json({ error: "Gagal memuat data siswa" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, studentId, nisn, name, classId, birthDate, isActive } = body;

    if (action === "reset-password") {
      if (!studentId) {
        return NextResponse.json({ error: "ID siswa diperlukan." }, { status: 400 });
      }
      const defaultHash = await hashPassword("123456");
      await adminDb.collection("students").doc(studentId).update({
        passwordHash: defaultHash,
        mustChangePassword: true,
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json({
        success: true,
        message: "Password siswa berhasil di-reset ke 123456.",
      });
    }

    if (action === "toggle-status") {
      await adminDb.collection("students").doc(studentId).update({
        isActive: Boolean(isActive),
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json({ success: true, message: "Status siswa berhasil diubah." });
    }

    if (!nisn || !name || !classId) {
      return NextResponse.json(
        { error: "NISN, Nama, dan Kelas wajib diisi." },
        { status: 400 }
      );
    }

    const existing = await adminDb.collection("students").where("nisn", "==", nisn.trim()).get();
    if (!existing.empty) {
      return NextResponse.json(
        { error: `NISN ${nisn} sudah terdaftar.` },
        { status: 400 }
      );
    }

    const defaultHash = await hashPassword("123456");
    const now = new Date().toISOString();

    const newDocRef = await adminDb.collection("students").add({
      nisn: nisn.trim(),
      name: name.trim(),
      classId,
      birthDate: birthDate || "",
      passwordHash: defaultHash,
      mustChangePassword: true,
      isActive: true,
      totalPoints: 0,
      totalBooksCompleted: 0,
      totalPagesRead: 0,
      totalReadingMinutes: 0,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      studentId: newDocRef.id,
      message: "Siswa berhasil ditambahkan dengan password awal 123456.",
    });
  } catch (error: any) {
    console.error("Admin student operation error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memproses data siswa" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID siswa wajib disertakan." }, { status: 400 });
    }

    // Check if student exists
    const studentDoc = await adminDb.collection("students").doc(id).get();
    if (!studentDoc.exists) {
      return NextResponse.json({ error: "Data siswa tidak ditemukan." }, { status: 404 });
    }

    const studentData = studentDoc.data();

    // Batch delete student and their associated records
    const batch = adminDb.batch();
    batch.delete(studentDoc.ref);

    // Delete associated reading progress
    const progressSnap = await adminDb.collection("reading_progress").where("studentId", "==", id).get();
    progressSnap.forEach((doc) => batch.delete(doc.ref));

    // Delete associated journals
    const journalsSnap = await adminDb.collection("reading_journals").where("studentId", "==", id).get();
    journalsSnap.forEach((doc) => batch.delete(doc.ref));

    // Delete associated badges
    const badgesSnap = await adminDb.collection("student_badges").where("studentId", "==", id).get();
    badgesSnap.forEach((doc) => batch.delete(doc.ref));

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Data siswa "${studentData?.name || id}" berhasil dihapus dari sistem.`,
    });
  } catch (error: any) {
    console.error("Delete student error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus siswa: " + error.message },
      { status: 500 }
    );
  }
}
