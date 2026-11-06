import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get("classId"); // optional filter for class leaderboard

    let studentsRef = adminDb.collection("students") as FirebaseFirestore.Query;

    if (classId) {
      studentsRef = studentsRef.where("classId", "==", classId);
    }

    const snapshot = await studentsRef
      .where("isActive", "==", true)
      .orderBy("totalPoints", "desc")
      .limit(50)
      .get();

    // Also get classes map
    const classesSnap = await adminDb.collection("classes").get();
    const classMap: Record<string, string> = {};
    classesSnap.forEach((doc) => {
      classMap[doc.id] = doc.data().name || doc.id;
    });

    const leaderboard = snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        rank: index + 1,
        id: doc.id,
        name: data.name,
        classId: data.classId,
        className: classMap[data.classId] || data.classId,
        totalPoints: data.totalPoints || 0,
        totalBooksCompleted: data.totalBooksCompleted || 0,
        totalPagesRead: data.totalPagesRead || 0,
        totalReadingMinutes: data.totalReadingMinutes || 0,
      };
    });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Fetch leaderboard error:", error);
    return NextResponse.json({ error: "Gagal memuat leaderboard" }, { status: 500 });
  }
}
