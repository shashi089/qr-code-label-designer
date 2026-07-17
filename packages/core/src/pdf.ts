import jsPDF from "jspdf";
import JsBarcode from 'jsbarcode';
import { StickerLayout, StickerElement } from "./layout/schema";
import { generateQR } from "./qr/generator";
import { parseContent } from "./utils/parse";

export type PdfDoc = InstanceType<typeof jsPDF>;

async function resolveDataUrl(src: string): Promise<string | undefined> {
  if (!src) return undefined;
  if (src.startsWith("data:")) return src;
  if (typeof fetch === "undefined" || typeof FileReader === "undefined") return undefined;
  try {
    const res  = await fetch(src);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror  = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn("Could not resolve data URL", err);
    return undefined;
  }
}

function renderBarcodeToDataUrl(element: StickerElement, data: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  try {
    const canvas = document.createElement("canvas");
    JsBarcode(canvas, data, {
      format:       element.barcodeFormat || "CODE128",
      displayValue: true,
      margin:       0,
      background:   element.style?.backgroundColor || "#ffffff",
      lineColor:    element.style?.color           || "#000000",
    });
    return canvas.toDataURL("image/png");
  } catch {
    return undefined;
  }
}

export async function exportToPDF(
  layout: StickerLayout,
  dataList: Record<string, any>[]
): Promise<PdfDoc> {
  const validUnits = ["pt", "px", "in", "mm", "cm"];
  const pdfUnit    = validUnits.includes(layout.unit) ? (layout.unit as any) : "mm";

  const doc = new jsPDF({
    orientation: layout.width > layout.height ? "l" : "p",
    unit:        pdfUnit,
    format:      [layout.width, layout.height]
  });

  for (let i = 0; i < dataList.length; i++) {
    if (i > 0) doc.addPage([layout.width, layout.height], layout.width > layout.height ? "l" : "p");

    const data = dataList[i];

    if (layout.backgroundColor) {
      doc.setFillColor(layout.backgroundColor);
      doc.rect(0, 0, layout.width, layout.height, "F");
    }

    if (layout.backgroundImage) {
      const dataUrl = await resolveDataUrl(layout.backgroundImage);
      if (dataUrl) {
        doc.addImage(dataUrl, "PNG", 0, 0, layout.width, layout.height);
      }
    }

    for (const element of layout.elements) {
      const filledContent = parseContent(
        element.content,
        data,
        element.type === "qr" ? element.qrSeparator : undefined
      );
      const { x, y, w, h } = element;

      if (element.type === "qr") {
        if (filledContent) {
          const qrUrl = await generateQR(filledContent);
          doc.addImage(qrUrl, "PNG", x, y, w, h);
        }

      } else if (element.type === "barcode") {
        if (filledContent) {
          const barcodeUrl = renderBarcodeToDataUrl(element, filledContent);
          if (barcodeUrl) doc.addImage(barcodeUrl, "PNG", x, y, w, h);
        }

      } else if (element.type === "text") {
        const style      = element.style || {};
        const fontSize   = style.fontSize || 12;
        const color      = style.color    || "#000000";
        const align      = style.textAlign    || "left";
        const vAlign     = style.verticalAlign || "top";
        const shouldWrap = style.wordWrap !== false;

        doc.setFontSize(fontSize);
        doc.setTextColor(color);

        let drawX = x;
        if (align === "center") drawX = x + w / 2;
        if (align === "right")  drawX = x + w;

        const lines: string[] = shouldWrap
          ? doc.splitTextToSize(filledContent, w)
          : [filledContent];

        // jsPDF uses pt internally; convert line height to layout unit
        const lineHeightFactor = doc.getLineHeightFactor?.() ?? (style.lineHeight ?? 1.25);
        const lineHeightInUnit = (fontSize * lineHeightFactor) * (pdfUnit === "pt" ? 1 : 25.4 / 72);

        const blockHeight = lines.length * lineHeightInUnit;
        let drawY = y;
        if (vAlign === "middle") drawY = y + (h - blockHeight) / 2;
        if (vAlign === "bottom") drawY = y + h - blockHeight;

        doc.text(lines, drawX, drawY, {
          baseline: "top",
          align:    align as "left" | "center" | "right",
        });
      }
    }
  }

  return doc;
}
