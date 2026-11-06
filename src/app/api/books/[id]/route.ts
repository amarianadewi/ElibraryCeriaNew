import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const docSnap = await adminDb.collection("books").doc(id).get();

    if (!docSnap.exists) {
      return NextResponse.json({ error: "Buku tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({
      id: docSnap.id,
      ...docSnap.data(),
    });
  } catch (error) {
    console.error("Fetch single book error:", error);
    return NextResponse.json({ error: "Gagal mengambil data buku" }, { status: 500 });
  }
}

