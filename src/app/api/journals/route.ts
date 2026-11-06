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

    if (!bookTitle || !summary || !summary.trim()) {
      return NextResponse.json({ error: "Mohon pilih buku dan tulis ringkasan jurnal." }, { status: 400 });
    }

    let finalDurationMinutes = parseInt(durationMinutes) || 0;
    let finalPagesRead = parseInt(pagesRead) || 0;
    let finalReadingDate = readingDate || new Date().toISOString().slice(0, 10);
    let finalCoverUrl = coverUrl || "";

    // Automatically lookup minutes & pages read recorded in system from reading_progress
    if (bookId) {
      try {
        const progressSnap = await adminDb
          .collection("reading_progress")
          .doc(`${session.studentId}_${bookId}`)
          .get();

        if (progressSnap.exists) {
          const pData = progressSnap.data()!;
          if (!finalDurationMinutes) {
            finalDurationMinutes = pData.readingMinutes || Math.round((pData.readingSeconds || 0) / 60) || 15;
          }
          if (!finalPagesRead) {
            finalPagesRead = pData.pagesReadCount || pData.highestPage || pData.lastPage || 10;
          }
          if (!finalCoverUrl) {
            finalCoverUrl = pData.coverUrl || "";
          }
          if (!readingDate && pData.lastReadAt) {
            finalReadingDate = pData.lastReadAt.slice(0, 10);
          }
        }
      } catch (e) {
        console.error("Lookup progress error:", e);
      }
    }

    // Attempt to lookup book cover from books collection if still missing
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

    if (!finalDurationMinutes) finalDurationMinutes = 15;
    if (!finalPagesRead) finalPagesRead = 10;

    const now = new Date().toISOString();

    const journalRef = await adminDb.collection("reading_journals").add({
      studentId: session.studentId,
      bookId: bookId || "",
      bookTitle,
      coverUrl: finalCoverUrl,
      readingDate: finalReadingDate,
      durationMinutes: finalDurationMinutes,
      pagesRead: finalPagesRead,
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
