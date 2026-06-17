import { StickerPrinter } from "qrlayout-core";
import { NextResponse } from "next/server";
import type { StickerLayout } from "qrlayout-ui";

interface ZplExportRequest {
  layout: StickerLayout;
  records: Record<string, unknown>[];
  dpi?: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ZplExportRequest;
    const { layout, records, dpi = 203 } = body;

    if (!layout || !Array.isArray(records) || records.length === 0) {
      return NextResponse.json(
        { error: "layout and records are required" },
        { status: 400 },
      );
    }

    const printer = new StickerPrinter();
    const pages = printer.exportToZPL(layout, records, { dpi });
    const content = pages.join("\n");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="event-labels.zpl.txt"',
      },
    });
  } catch (error) {
    console.error("ZPL export error:", error);
    return NextResponse.json({ error: "ZPL export failed" }, { status: 500 });
  }
}
