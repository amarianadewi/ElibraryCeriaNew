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

    // Query journals for this student without composite index dependency
    const snapshot = await adminDb
      .collection("reading_journals")
      .where("studentId", "==", session.studentId)
      .get();

    const journals = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // In-memory sort newest first
    journals.sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt || a.readingDate || 0).getTime();
      const timeB = new Date(b.createdAt || b.readingDate || 0).getTime();
      return timeB - timeA;
    });

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

    const {
      bookId,
      bookTitle,
      coverUrl,
      readingDate,
      durationMinutes,
      pagesRead,
      summary,
      feeling,
    } = await req.json();

    if (!bookTitle || !readingDate || !summary) {
      return NextResponse.json({ error: "Mohon lengkapi seluruh field jurnal." }, { status: 400 });
    }

    // Attempt to lookup book cover if not provided
    let finalCoverUrl = coverUrl || "";
    if (bookId && !finalCoverUrl) {
      try {
        const bookDoc = await adminDb.collection("books").doc(bookId).get();
        if (bookDoc.exists) {
          finalCoverUrl = bookDoc.data()?.coverUrl || "";
        }
      } catch (e) {
        console.error("Lookup book cover error:", e);
      }
    }

    const now = new Date().toISOString();

    const journalRef = await adminDb.collection("reading_journals").add({
      studentId: session.studentId,
      bookId: bookId || "",
      bookTitle,
      coverUrl: finalCoverUrl,
      readingDate,
      durationMinutes: parseInt(durationMinutes) || 15,
      pagesRead: parseInt(pagesRead) || 10,
      summary: summary.trim(),
      feeling: feeling || "😊 Seru",
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
