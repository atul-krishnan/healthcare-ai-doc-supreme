import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { BriefOutput, DepartmentBucket, CareSetting } from "@/lib/yourdoc/types";

function wrapText(text: string, maxChars = 95) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) {
        lines.push(current);
      }
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function labelForCareSetting(setting: CareSetting) {
  switch (setting) {
    case "er_now":
      return "ER now";
    case "urgent_today":
      return "Urgent clinic today";
    case "opd_24_72h":
      return "OPD in 24-72 hours";
    default:
      return "Self-care";
  }
}

function labelForDepartment(bucket: DepartmentBucket) {
  return bucket.replaceAll("_", " ");
}

type PdfBriefInput = {
  id: string;
  title: string;
  careSetting: CareSetting;
  departmentBucket: DepartmentBucket;
  createdAt: string;
  summary: BriefOutput;
  attachments: string[];
};

export async function buildBriefPdf(input: PdfBriefInput) {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([595, 842]);

  let y = 800;

  const writeLine = (text: string, opts?: { size?: number; bold?: boolean; color?: [number, number, number] }) => {
    const size = opts?.size ?? 11;
    const lineHeight = size + 4;

    if (y < 70) {
      page = pdf.addPage([595, 842]);
      y = 800;
    }

    page.drawText(text, {
      x: 48,
      y,
      size,
      font: opts?.bold ? fontBold : font,
      color: opts?.color ? rgb(opts.color[0], opts.color[1], opts.color[2]) : rgb(0.14, 0.16, 0.2),
    });
    y -= lineHeight;
  };

  writeLine("YourDoc", { size: 20, bold: true, color: [0.12, 0.45, 0.41] });
  writeLine("AI medical navigation + intake summary", { size: 10 });
  y -= 6;

  writeLine(input.title, { size: 16, bold: true, color: input.careSetting === "er_now" ? [0.7, 0.1, 0.1] : [0.12, 0.16, 0.2] });
  writeLine(`Created: ${new Date(input.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`);
  writeLine(`Care setting: ${labelForCareSetting(input.careSetting)}`);
  writeLine(`Department bucket: ${labelForDepartment(input.departmentBucket)}`);
  writeLine("Important: This is not a diagnosis.", { bold: true });
  writeLine("If severe symptoms are present, go to ER immediately.", { bold: true });
  y -= 6;

  writeLine("Next steps", { bold: true, size: 13 });
  for (const step of input.summary.next_steps) {
    for (const line of wrapText(`- ${step}`)) {
      writeLine(line);
    }
  }
  y -= 4;

  writeLine("Doctor summary", { bold: true, size: 13 });
  for (const line of wrapText(`HPI: ${input.summary.doctor_summary_sections.hpi}`)) {
    writeLine(line);
  }
  for (const line of wrapText(`History: ${input.summary.doctor_summary_sections.relevantHistory}`)) {
    writeLine(line);
  }
  for (const line of wrapText(`Medications/Allergies: ${input.summary.doctor_summary_sections.medicationsAllergies}`)) {
    writeLine(line);
  }

  if (input.summary.red_flags_checked.length > 0) {
    for (const line of wrapText(`Red flags marked: ${input.summary.red_flags_checked.join("; ")}`)) {
      writeLine(line);
    }
  }

  if (input.attachments.length > 0) {
    writeLine("Attachments", { bold: true, size: 13 });
    for (const item of input.attachments) {
      for (const line of wrapText(`- ${item}`)) {
        writeLine(line);
      }
    }
  }

  y -= 4;
  writeLine(`Confidence notes: ${input.summary.confidence_notes}`, { size: 10 });
  writeLine(`Reference ID: ${input.id}`, { size: 9, color: [0.3, 0.34, 0.4] });

  const bytes = await pdf.save();
  return bytes;
}
