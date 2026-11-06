import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId"); // optional filter for class leaderboard

    let studentsRef = adminDb.collection("students") as FirebaseFirestore.Query;

    if (classId && classId !== "all") {
      studentsRef = studentsRef.where("classId", "==", classId);
    }

    const [snapshot, classesSnap] = await Promise.all([
      studentsRef.get(),
      adminDb.collection("classes").get(),
    ]);

    // Build class name lookup and class list
    const classMap: Record<string, string> = {};
    const classesList: { id: string; name: string }[] = [];

    classesSnap.forEach((doc) => {
      const data = doc.data();
      const name = data.name || doc.id;
      classMap[doc.id] = name;
      classesList.push({ id: doc.id, name });
    });

    classesList.sort((a, b) => a.name.localeCompare(b.name));

    // Map and filter active students (handles missing/undefined isActive gracefully)
    const students = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "Siswa",
          classId: data.classId || "",
          className: classMap[data.classId] || data.classId || "-",
          isActive: data.isActive,
          totalPoints: Number(data.totalPoints) || 0,
          totalBooksCompleted: Number(data.totalBooksCompleted) || 0,
          totalPagesRead: Number(data.totalPagesRead) || 0,
          totalReadingMinutes: Number(data.totalReadingMinutes) || 0,
        };
      })
      .filter((s) => s.isActive !== false);

    // Sort in-memory: totalPoints DESC, then books completed DESC, then reading minutes DESC
    students.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      if (b.totalBooksCompleted !== a.totalBooksCompleted) {
        return b.totalBooksCompleted - a.totalBooksCompleted;
      }
      return b.totalReadingMinutes - a.totalReadingMinutes;
    });

    const leaderboard = students.slice(0, 50).map((item, index) => ({
      rank: index + 1,
      id: item.id,
      name: item.name,
      classId: item.classId,
      className: item.className,
      totalPoints: item.totalPoints,
      totalBooksCompleted: item.totalBooksCompleted,
      totalPagesRead: item.totalPagesRead,
      totalReadingMinutes: item.totalReadingMinutes,
    }));

    return NextResponse.json({
      leaderboard,
      classes: classesList,
    });
  } catch (error: any) {
    console.error("Fetch leaderboard error:", error);
    return NextResponse.json(
      { error: "Gagal memuat leaderboard", details: error?.message },
      { status: 500 }
    );
  }
}
