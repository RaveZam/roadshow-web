import JSZip from "jszip";
import QRCode from "qrcode";

type Student = {
  id: string; // supabase uuid
  student_id: string;
  full_name: string;
  section?: string;
};

function safeFileName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "_");
}

export async function generateStudentQrZip(students: Student[]) {
  const zip = new JSZip();

  for (const student of students) {
    const qrDataUrl = await QRCode.toDataURL(student.id, {
      width: 500,
      margin: 2,
    });

    const fileName = `${safeFileName(student.full_name)}_${safeFileName(student.student_id)}.png`;

    if (student.section) {
      zip
        .folder(safeFileName(student.section))
        ?.file(fileName, qrDataUrl.split(",")[1], { base64: true });
    } else {
      zip.file(fileName, qrDataUrl.split(",")[1], { base64: true });
    }
  }

  return zip.generateAsync({ type: "blob" });
}
