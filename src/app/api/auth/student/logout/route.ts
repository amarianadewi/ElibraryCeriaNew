import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("student_token");
    return NextResponse.json({ success: true, message: "Berhasil logout." });
  } catch (error) {
    return NextResponse.json({ error: "Gagal logout." }, { status: 500 });
  }
}

