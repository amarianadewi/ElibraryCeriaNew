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

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get("bookId");

    if (bookId) {
      const progressId = `${session.studentId}_${bookId}`;
      const docSnap = await adminDb.collection("reading_progress").doc(progressId).get();
      if (!docSnap.exists) {
        return NextResponse.json({ progress: null });
      }
      return NextResponse.json({ progress: { id: docSnap.id, ...docSnap.data() } });
    }

    // Get all progresses for student without composite index requirement
    const snapshot = await adminDb
      .collection("reading_progress")
      .where("studentId", "==", session.studentId)
      .get();

    const progresses = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // In-memory sort newest first
    progresses.sort((a: any, b: any) => {
      const timeA = new Date(a.updatedAt || a.lastReadAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.lastReadAt || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({ progresses });
  } catch (error) {
    console.error("Fetch reading progress error:", error);
    return NextResponse.json({ error: "Gagal memuat progres membaca" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getStudentSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, currentPage, durationSeconds = 30 } = await req.json();

    if (!bookId || !currentPage) {
      return NextResponse.json({ error: "Data membaca tidak lengkap" }, { status: 400 });
    }

    // Fetch book to get totalPages
    const bookDoc = await adminDb.collection("books").doc(bookId).get();
    if (!bookDoc.exists) {
      return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 });
    }
    const bookData = bookDoc.data()!;
    const totalPages = bookData.totalPages || 24;

    const progressId = `${session.studentId}_${bookId}`;
    const progressRef = adminDb.collection("reading_progress").doc(progressId);
    const progressSnap = await progressRef.get();

    const now = new Date().toISOString();
    let readPageNumbers: number[] = [];
    let highestPage = currentPage;
    let readingSeconds = durationSeconds;
    let currentStatus = "sedang";
    let newlyCompleted = false;
    let pointsAwarded = 0;
    const awardedBadges: string[] = [];

    if (progressSnap.exists) {
      const data = progressSnap.data()!;
      const existingPages = new Set<number>(data.readPageNumbers || []);
      existingPages.add(currentPage);
      readPageNumbers = Array.from(existingPages).sort((a, b) => a - b);
      highestPage = Math.max(data.highestPage || 0, currentPage);
      readingSeconds = (data.readingSeconds || 0) + durationSeconds;
      currentStatus = data.status || "sedang";
    } else {
      readPageNumbers = [currentPage];
    }

    const uniquePagesCount = readPageNumbers.length;
    const progressPercentage = Math.min(100, Math.round((uniquePagesCount / totalPages) * 100));

    // Check completion threshold (90% unique pages)
    if (progressPercentage >= 90 && currentStatus !== "selesai") {
      currentStatus = "selesai";
      newlyCompleted = true;
      pointsAwarded += 20;

      // Record 20 points transaction
      await adminDb.collection("point_transactions").add({
        studentId: session.studentId,
        activityType: "book_completed",
        points: 20,
        referenceId: bookId,
        description: `Menyelesaikan membaca buku "${bookData.title}"`,
        createdAt: now,
      });
    }

    // Save reading progress
    await progressRef.set(
      {
        studentId: session.studentId,
        bookId,
        bookTitle: bookData.title,
        coverUrl: bookData.coverUrl,
        lastPage: currentPage,
        highestPage,
        readPageNumbers,
        pagesReadCount: uniquePagesCount,
        progressPercentage,
        readingSeconds,
        readingMinutes: Math.round(readingSeconds / 60),
        status: currentStatus,
        lastReadAt: now,
        updatedAt: now,
      },
      { merge: true }
    );

    // Update student aggregates
    const studentRef = adminDb.collection("students").doc(session.studentId);
    const studentSnap = await studentRef.get();
    if (studentSnap.exists) {
      const sData = studentSnap.data()!;
      const newTotalPoints = (sData.totalPoints || 0) + pointsAwarded;
      const newBooksCompleted = (sData.totalBooksCompleted || 0) + (newlyCompleted ? 1 : 0);
      const newTotalMinutes = Math.round(((sData.totalReadingMinutes || 0) * 60 + durationSeconds) / 60);

      await studentRef.update({
        totalPoints: newTotalPoints,
        totalBooksCompleted: newBooksCompleted,
        totalPagesRead: Math.max(sData.totalPagesRead || 0, uniquePagesCount),
        totalReadingMinutes: newTotalMinutes,
        updatedAt: now,
      });

      // Check badges
      if (newBooksCompleted >= 1) awardedBadges.push("pembaca-pemula");
      if (newBooksCompleted >= 5) awardedBadges.push("sahabat-buku");
      if (newBooksCompleted >= 10) awardedBadges.push("pecinta-literasi");
      if (newBooksCompleted >= 25) awardedBadges.push("kutu-buku");
      if (newTotalPoints >= 1000) awardedBadges.push("juara-literasi");

      for (const badgeId of awardedBadges) {
        const badgeRecordId = `${session.studentId}_${badgeId}`;
        await adminDb.collection("student_badges").doc(badgeRecordId).set(
          {
            studentId: session.studentId,
            badgeId,
            awardedAt: now,
          },
          { merge: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      lastPage: currentPage,
      progressPercentage,
      status: currentStatus,
      newlyCompleted,
      pointsAwarded,
      awardedBadges,
    });
  } catch (error: any) {
    console.error("Save reading progress error:", error);
    return NextResponse.json({ error: "Gagal menyimpan progres membaca" }, { status: 500 });
  }
}
