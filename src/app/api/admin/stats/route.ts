import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [studentsSnap, booksSnap, progressSnap] = await Promise.all([
      adminDb.collection("students").get(),
      adminDb.collection("books").get(),
      adminDb.collection("reading_progress").orderBy("updatedAt", "desc").limit(50).get(),
    ]);

    let totalStudents = studentsSnap.size;
    let totalBooks = booksSnap.size;
    let totalPagesRead = 0;
    let totalReadingMinutes = 0;

    const classStats: Record<string, { totalStudents: number; totalMinutes: number; totalPoints: number }> = {};
    const studentsList: any[] = [];

    studentsSnap.forEach((doc) => {
      const data = doc.data();
      totalPagesRead += data.totalPagesRead || 0;
      totalReadingMinutes += data.totalReadingMinutes || 0;

      const cId = data.classId || "Lainnya";
      if (!classStats[cId]) {
        classStats[cId] = { totalStudents: 0, totalMinutes: 0, totalPoints: 0 };
      }
      classStats[cId].totalStudents += 1;
      classStats[cId].totalMinutes += data.totalReadingMinutes || 0;
      classStats[cId].totalPoints += data.totalPoints || 0;

      studentsList.push({
        id: doc.id,
        name: data.name,
        classId: data.classId,
        totalPoints: data.totalPoints || 0,
        totalBooksCompleted: data.totalBooksCompleted || 0,
      });
    });

    studentsList.sort((a, b) => b.totalPoints - a.totalPoints);
    const topStudents = studentsList.slice(0, 5);

    const recentActivities = progressSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        studentId: data.studentId,
        bookTitle: data.bookTitle,
        lastPage: data.lastPage,
        status: data.status,
        updatedAt: data.updatedAt,
      };
    });

    return NextResponse.json({
      summary: {
        totalStudents,
        totalBooks,
        totalPagesRead,
        totalReadingMinutes,
      },
      topStudents,
      classStats,
      recentActivities,
    });
  } catch (error) {
    console.error("Fetch admin stats error:", error);
    return NextResponse.json({ error: "Gagal memuat statistik admin" }, { status: 500 });
  }
}
