import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getStudentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const snapshot = await adminDb
      .collection("reading_journals")
      .where("studentId", "==", session.studentId)
      .orderBy("createdAt", "desc")
      .get();

    const journals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ journals });
  } catch (error) {
    console.error("Fetch journals error:", error);
    return NextResponse.json({ error: "Gagal memuat jurnal membaca" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, bookTitle, readingDate, durationMinutes, pagesRead, summary } = await req.json();

    if (!bookTitle || !readingDate || !summary) {
      return NextResponse.json({ error: "Mohon lengkapi seluruh field jurnal." }, { status: 400 });
    }

    const now = new Date().toISOString();

    const journalRef = await adminDb.collection("reading_journals").add({
      studentId: session.studentId,
      bookId: bookId || "",
      bookTitle,
      readingDate,
      durationMinutes: parseInt(durationMinutes) || 15,
      pagesRead: parseInt(pagesRead) || 10,
      summary,
      createdAt: now,
    });

    // Award 5 points for submitting reading journal
    const points = 5;
    await adminDb.collection("point_transactions").add({
      studentId: session.studentId,
      activityType: "journal_submitted",
      points,
      referenceId: journalRef.id,
      description: `Mengisi jurnal membaca: "${bookTitle}"`,
      createdAt: now,
    });

    // Update student's totalPoints
    const studentRef = adminDb.collection("students").doc(session.studentId);
    const studentSnap = await studentRef.get();
    if (studentSnap.exists) {
      const currentPts = studentSnap.data()?.totalPoints || 0;
      await studentRef.update({
        totalPoints: currentPts + points,
        updatedAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      journalId: journalRef.id,
      pointsAwarded: points,
      message: "Jurnal berhasil disimpan dan 5 Bintang Literasi ditambahkan!",
    });
  } catch (error) {
    console.error("Create journal error:", error);
    return NextResponse.json({ error: "Gagal menyimpan jurnal membaca" }, { status: 500 });
  }
}
