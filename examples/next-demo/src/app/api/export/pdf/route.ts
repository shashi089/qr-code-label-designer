import { exportToPDF } from "qrlayout-core/pdf";
import { NextResponse } from "next/server";
import type { StickerLayout } from "qrlayout-ui";

interface PdfExportRequest {
  layout: StickerLayout;
  records: Record<string, unknown>[];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PdfExportRequest;
    const { layout, records } = body;

    if (!layout || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "layout and records are required" },
        { status: 400 },
      );
    }

    const pdf = await exportToPDF(layout, records);
    const arrayBuffer = pdf.output("arraybuffer") as ArrayBuffer;

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="event-labels.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "PDF export failed" }, { status: 500 });
  }
}
