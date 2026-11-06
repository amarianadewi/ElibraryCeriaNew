import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase().trim() || "";
    const category = searchParams.get("category") || "";
    const grade = searchParams.get("grade") ? parseInt(searchParams.get("grade")!) : null;
    const level = searchParams.get("level") || "";
    const limitParam = searchParams.get("limit") || "20";
    const page = parseInt(searchParams.get("page") || "1");

    // Fetch all books (up to 2000) so we never miss any book
    let booksRef = adminDb.collection("books") as FirebaseFirestore.Query;

    if (category) {
      booksRef = booksRef.where("category", "==", category);
    }
    if (level) {
      booksRef = booksRef.where("readingLevel", "==", level);
    }

    const snapshot = await booksRef.limit(2000).get();

    let books = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // In-memory filter for grade array and flexible text search across multiple fields
    if (grade) {
      books = books.filter(
        (b) => Array.isArray(b.recommendedGrades) && b.recommendedGrades.includes(grade)
      );
    }

    if (query) {
      books = books.filter(
        (b) =>
          b.title?.toLowerCase().includes(query) ||
          b.author?.toLowerCase().includes(query) ||
          b.publisher?.toLowerCase().includes(query) ||
          b.category?.toLowerCase().includes(query) ||
          b.description?.toLowerCase().includes(query) ||
          b.tags?.toLowerCase().includes(query)
      );
    }

    const total = books.length;

    // Handle "all" limit
    if (limitParam === "all") {
      return NextResponse.json({
        books,
        total,
        page: 1,
        totalPages: 1,
      });
    }

    const limit = parseInt(limitParam);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const startIndex = (safePage - 1) * limit;
    const paginatedBooks = books.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      books: paginatedBooks,
      total,
      page: safePage,
      totalPages,
      limit,
    });
  } catch (error: any) {
    console.error("Fetch books error:", error);
    return NextResponse.json({ error: "Gagal memuat katalog buku" }, { status: 500 });
  }
}
