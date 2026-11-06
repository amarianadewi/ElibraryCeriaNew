import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { getStudentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getStudentSession();
    const badgesSnap = await adminDb.collection("badges").get();
    const allBadges = badgesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    const unlockedMap: Record<string, string> = {};

    if (session) {
      const studentBadgesSnap = await adminDb
        .collection("student_badges")
        .where("studentId", "==", session.studentId)
        .get();

      studentBadgesSnap.forEach((doc) => {
        const data = doc.data();
        unlockedMap[data.badgeId] = data.awardedAt;
      });
    }

    const result = allBadges.map((b) => ({
      ...b,
      unlocked: Boolean(unlockedMap[b.id]),
      unlockedAt: unlockedMap[b.id] || null,
    }));

    return NextResponse.json({ badges: result });
  } catch (error) {
    console.error("Fetch badges error:", error);
    return NextResponse.json({ error: "Gagal memuat lencana" }, { status: 500 });
  }
}
