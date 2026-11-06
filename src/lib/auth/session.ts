import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "e-library-ceria-kaliwungu-05-secret-key-2026-super-secure"
);

export interface StudentSessionPayload {
  studentId: string;
  nisn: string;
  name: string;
  classId: string;
  mustChangePassword?: boolean;
  role: "student";
}

export async function createStudentToken(payload: StudentSessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyStudentToken(token: string): Promise<StudentSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as StudentSessionPayload;
  } catch {
    return null;
  }
}

export async function getStudentSession(): Promise<StudentSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("student_token")?.value;
    if (!token) return null;
    return await verifyStudentToken(token);
  } catch {
    return null;
  }
}

