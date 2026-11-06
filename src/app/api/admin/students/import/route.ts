import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { hashPassword } from "@/lib/auth/password";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

/**
 * Format any date input (Date object, Excel serial number, or string) to YYYY-MM-DD
 */
function normalizeDate(val: any): string {
  if (!val) return "";

  if (val instanceof Date) {
    if (isNaN(val.getTime())) return "";
    return val.toISOString().split("T")[0];
  }

  if (typeof val === "number") {
    // Excel date serial number to JS Date
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  }

  const str = String(val).trim();
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // YYYY/MM/DD
  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, "0");
    const day = ymdMatch[3].padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return str;
}

/**
 * Extract normalized classId ("kelas-1" ... "kelas-6") from various Dapodik/Excel formats
 */
function normalizeClass(raw: string, defaultClass = "kelas-1"): string {
  if (!raw) return defaultClass;
  const s = raw.toLowerCase().trim();

  if (s.includes("kelas-")) return s;
  if (s.includes("6") || /\bvi\b/i.test(s)) return "kelas-6";
  if (s.includes("5") || /\bv\b/i.test(s)) return "kelas-5";
  if (s.includes("4") || /\biv\b/i.test(s)) return "kelas-4";
  if (s.includes("3") || /\biii\b/i.test(s)) return "kelas-3";
  if (s.includes("2") || /\bii\b/i.test(s)) return "kelas-2";
  if (s.includes("1") || /\bi\b/i.test(s)) return "kelas-1";

  return defaultClass;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const targetClass = (formData.get("targetClass") as string) || "all";

    if (!file) {
      return NextResponse.json({ error: "File Excel (.xlsx/.xls/.csv) tidak ditemukan." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to 2D array of rows
    const matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" }) as any[][];

    if (!matrix || matrix.length === 0) {
      return NextResponse.json({ error: "File Excel kosong atau tidak terbaca." }, { status: 400 });
    }

    // 1. Detect header row
    let headerRowIdx = -1;
    let colNama = -1;
    let colNisn = -1;
    let colTglLahir = -1;
    let colRombel = -1;
    let colJk = -1;

    for (let r = 0; r < Math.min(25, matrix.length); r++) {
      const row = matrix[r];
      for (let c = 0; c < row.length; c++) {
        const val = String(row[c] || "").trim().toLowerCase();
        // Look for column containing "nama"
        if (
          val === "nama" ||
          val === "nama siswa" ||
          val === "nama peserta didik" ||
          val === "nama lengkap"
        ) {
          headerRowIdx = r;
          break;
        }
      }
      if (headerRowIdx !== -1) break;
    }

    // Fallback if no exact match found
    if (headerRowIdx === -1) {
      for (let r = 0; r < Math.min(10, matrix.length); r++) {
        const row = matrix[r];
        const rowStr = row.map((v) => String(v || "").toLowerCase()).join(" ");
        if (rowStr.includes("nisn") && rowStr.includes("nama")) {
          headerRowIdx = r;
          break;
        }
      }
    }

    if (headerRowIdx === -1) {
      return NextResponse.json(
        {
          error:
            "Format kolom tidak dikenali. Pastikan file memiliki baris header yang memuat kolom 'Nama' dan 'NISN' (format Dapodik Kemendikdasmen atau template).",
        },
        { status: 400 }
      );
    }

    // Map column positions
    const headerRow = matrix[headerRowIdx];
    for (let c = 0; c < headerRow.length; c++) {
      const val = String(headerRow[c] || "").trim().toLowerCase();

      // Nama (Pastikan bukan Nama Ayah, Nama Ibu, Nama Wali, Nama di KIP)
      if (
        (val === "nama" ||
          val === "nama siswa" ||
          val === "nama peserta didik" ||
          val === "nama lengkap") &&
        colNama === -1
      ) {
        colNama = c;
      } else if (val.includes("nisn") && colNisn === -1) {
        colNisn = c;
      } else if (
        (val.includes("tanggal lahir") ||
          val.includes("tgl lahir") ||
          val.includes("tgl_lahir") ||
          val.includes("birthdate")) &&
        colTglLahir === -1
      ) {
        colTglLahir = c;
      } else if (
        (val.includes("rombel") ||
          val.includes("kelas") ||
          val.includes("tingkat")) &&
        colRombel === -1
      ) {
        colRombel = c;
      } else if ((val === "jk" || val === "jenis kelamin") && colJk === -1) {
        colJk = c;
      }
    }

    if (colNama === -1 || colNisn === -1) {
      return NextResponse.json(
        {
          error: `Kolom wajib tidak lengkap: ${colNama === -1 ? "'Nama' " : ""}${colNisn === -1 ? "'NISN' " : ""}belum terdeteksi.`,
        },
        { status: 400 }
      );
    }

    // 2. Detect sub-header noise on next row (e.g., Dapodik Row with "Tahun Lahir", "Jenjang Pendidikan")
    let dataStartIdx = headerRowIdx + 1;
    if (dataStartIdx < matrix.length) {
      const nextRowStr = matrix[dataStartIdx]
        .map((v) => String(v || "").toLowerCase())
        .join(" ");
      if (
        nextRowStr.includes("tahun lahir") ||
        nextRowStr.includes("jenjang pendidikan") ||
        nextRowStr.includes("pekerjaan")
      ) {
        dataStartIdx++;
      }
    }

    // 3. Fetch existing students from Firestore
    const studentsSnap = await adminDb.collection("students").get();
    const existingStudentsMap = new Map<string, { id: string; data: any }>();
    studentsSnap.forEach((doc) => {
      const data = doc.data();
      if (data.nisn) {
        existingStudentsMap.set(String(data.nisn).trim(), { id: doc.id, data });
      }
    });

    const defaultHash = await hashPassword("123456");
    const now = new Date().toISOString();

    const seenInFile = new Set<string>();
    const studentsToSave: any[] = [];
    const errors: { row: number; nisn: string; error: string }[] = [];
    let skippedOtherClass = 0;
    const classCounts: Record<string, number> = {
      "kelas-1": 0,
      "kelas-2": 0,
      "kelas-3": 0,
      "kelas-4": 0,
      "kelas-5": 0,
      "kelas-6": 0,
    };

    for (let r = dataStartIdx; r < matrix.length; r++) {
      const row = matrix[r];
      const rowNum = r + 1;

      const rawNama = String(row[colNama] || "").trim();
      let rawNisn = String(row[colNisn] || "")
        .replace(/[^0-9]/g, "")
        .trim();

      // If NISN has 9 digits, pad leading zero (common Excel issue)
      if (rawNisn.length === 9) {
        rawNisn = "0" + rawNisn;
      }

      if (!rawNama && !rawNisn) {
        continue; // Skip empty rows
      }

      if (!rawNama) {
        errors.push({ row: rowNum, nisn: rawNisn, error: "Nama siswa kosong." });
        continue;
      }

      if (!rawNisn || rawNisn.length < 8) {
        errors.push({ row: rowNum, nisn: rawNisn, error: "NISN tidak valid atau kurang digit." });
        continue;
      }

      if (seenInFile.has(rawNisn)) {
        errors.push({ row: rowNum, nisn: rawNisn, error: "NISN duplikat di dalam file." });
        continue;
      }
      seenInFile.add(rawNisn);

      // Extract raw class & birthdate
      const rawRombel = colRombel !== -1 ? String(row[colRombel] || "").trim() : "";
      const rawTgl = colTglLahir !== -1 ? row[colTglLahir] : "";
      const birthDate = normalizeDate(rawTgl);
      const studentClass = normalizeClass(rawRombel, targetClass !== "all" ? targetClass : "kelas-1");

      // Track class counts
      if (classCounts[studentClass] !== undefined) {
        classCounts[studentClass]++;
      }

      // Check if targetClass filter is set
      if (targetClass !== "all" && studentClass !== targetClass) {
        skippedOtherClass++;
        continue;
      }

      const gender = colJk !== -1 ? String(row[colJk] || "").trim().toUpperCase() : "";

      studentsToSave.push({
        nisn: rawNisn,
        name: rawNama,
        classId: studentClass,
        birthDate,
        gender: gender.startsWith("L") ? "L" : gender.startsWith("P") ? "P" : "",
      });
    }

    if (studentsToSave.length === 0) {
      if (skippedOtherClass > 0) {
        return NextResponse.json({
          success: false,
          error: `Tidak ada siswa yang diimpor. Ditemukan ${skippedOtherClass} siswa di file, namun tidak ada yang cocok dengan pilihan '${targetClass}'.`,
          classCounts,
        }, { status: 400 });
      }
      return NextResponse.json({
        error: "Tidak ada baris data siswa yang valid untuk diimpor.",
        errors,
      }, { status: 400 });
    }

    // 4. Batch commit to Firestore (chunks of 400 to stay well under 500 limit)
    let createdCount = 0;
    let updatedCount = 0;
    const chunkSize = 400;

    for (let i = 0; i < studentsToSave.length; i += chunkSize) {
      const chunk = studentsToSave.slice(i, i + chunkSize);
      const batch = adminDb.batch();

      for (const item of chunk) {
        const existing = existingStudentsMap.get(item.nisn);
        if (existing) {
          // Update existing student
          const ref = adminDb.collection("students").doc(existing.id);
          batch.update(ref, {
            name: item.name,
            classId: item.classId,
            birthDate: item.birthDate || existing.data.birthDate || "",
            updatedAt: now,
          });
          updatedCount++;
        } else {
          // Insert new student
          const ref = adminDb.collection("students").doc();
          batch.set(ref, {
            nisn: item.nisn,
            name: item.name,
            classId: item.classId,
            birthDate: item.birthDate,
            passwordHash: defaultHash,
            mustChangePassword: true,
            isActive: true,
            totalPoints: 0,
            totalBooksCompleted: 0,
            totalPagesRead: 0,
            totalReadingMinutes: 0,
            createdAt: now,
            updatedAt: now,
          });
          createdCount++;
        }
      }

      await batch.commit();
    }

    const totalProcessed = createdCount + updatedCount;
    const targetLabel = targetClass === "all" ? "Semua Kelas" : targetClass.toUpperCase();

    let message = `Berhasil memproses ${totalProcessed} siswa (${createdCount} baru ditambahkan, ${updatedCount} data diperbarui).`;
    if (skippedOtherClass > 0) {
      message += ` (${skippedOtherClass} siswa kelas lain dilewati sesuai filter ${targetLabel}).`;
    }

    return NextResponse.json({
      success: true,
      totalProcessed,
      createdCount,
      updatedCount,
      skippedOtherClass,
      errorsCount: errors.length,
      errors: errors.slice(0, 10),
      classCounts,
      message,
    });
  } catch (error: any) {
    console.error("Excel import error:", error);
    return NextResponse.json(
      { error: "Gagal memproses file Excel: " + error.message },
      { status: 500 }
    );
  }
}
