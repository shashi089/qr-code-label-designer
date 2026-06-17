import { StickerPrinter } from "qrlayout-core";
import type { StickerLayout } from "qrlayout-ui";

export interface ExportOptions {
  layout: StickerLayout;
  items: Record<string, unknown>[];
  printer: StickerPrinter;
  baseFilename: string;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportToPNG(options: ExportOptions): Promise<void> {
  const { layout, items, printer, baseFilename } = options;
  if (!layout || items.length === 0) return;

  for (const item of items) {
    const dataUrl = await printer.renderToDataURL(layout, item, {
      format: "png",
    });
    const link = document.createElement("a");
    link.download = `${baseFilename}-${String(item.id ?? Date.now())}.png`;
    link.href = dataUrl;
    link.click();
  }
}

export async function exportToBatchPDFViaApi(
  options: Omit<ExportOptions, "printer">,
): Promise<void> {
  const { layout, items, baseFilename } = options;
  if (!layout || items.length === 0) return;

  const response = await fetch("/api/export/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layout, records: items }),
  });

  if (!response.ok) {
    throw new Error("PDF export failed");
  }

  const blob = await response.blob();
  downloadBlob(blob, `${baseFilename}-${Date.now()}.pdf`);
}

export async function exportToZPLViaApi(
  options: Omit<ExportOptions, "printer"> & { dpi?: number },
): Promise<void> {
  const { layout, items, baseFilename, dpi = 203 } = options;
  if (!layout || items.length === 0) return;

  const response = await fetch("/api/export/zpl", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ layout, records: items, dpi }),
  });

  if (!response.ok) {
    throw new Error("ZPL export failed");
  }

  const blob = await response.blob();
  downloadBlob(blob, `${baseFilename}-${Date.now()}.zpl.txt`);
}
