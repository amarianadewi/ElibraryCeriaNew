import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "e-library-ceria-kaliwungu-05-secret-key-2026-super-secure"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected student routes
  const isStudentRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/jurnal") ||
    pathname.startsWith("/bintang") ||
    pathname.startsWith("/baca");

  if (isStudentRoute) {
    const token = request.cookies.get("student_token")?.value;
    if (!token) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET);
      const student = payload as any;

      // If must change password, redirect to /ganti-password
      if (student.mustChangePassword && pathname !== "/ganti-password") {
        return NextResponse.redirect(new URL("/ganti-password", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jurnal/:path*",
    "/bintang/:path*",
    "/baca/:path*",
  ],
};

