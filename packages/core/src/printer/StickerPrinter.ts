import JsBarcode from 'jsbarcode';
import { StickerLayout, StickerElement, StickerData, ImageFormat } from "../layout/schema";
import { generateQR } from "../qr/generator";
import { parseContent } from "../utils/parse";
import { toPx, toDots } from "../utils/units";
import type { PdfDoc } from "../pdf";

export interface DataUrlOptions {
    format?: ImageFormat;
    quality?: number;
    canvas?: HTMLCanvasElement;
}

export interface ExportPNGOptions {
    /** Override the canvas element used for rendering (useful for server-side/Node rendering). */
    canvas?: HTMLCanvasElement;
}

export interface ZplOptions {
    /**
     * The print resolution of the target Zebra printer in dots-per-inch (DPI).
     * This must match your printer's physical DPI setting exactly — wrong DPI
     * causes all positions, sizes, and fonts to be scaled incorrectly on the label.
     *
     * Common Zebra DPI values:
     * - `203` — standard desktop label printers (default)
     * - `300` — mid-range / high-quality printers
     * - `600` — high-resolution printers
     *
     * @default 203
     */
    dpi?: 203 | 300 | 600 | number;

    /**
     * QR code error correction level.
     * Higher levels allow the code to be read even if partially damaged,
     * at the cost of a denser/larger QR pattern.
     *
     * - `L` — ~7% data restoration  (lowest density)
     * - `M` — ~15% data restoration (default, good for most labels)
     * - `Q` — ~25% data restoration
     * - `H` — ~30% data restoration (use when label may be dirty or worn)
     *
     * @default "M"
     */
    qrErrorCorrection?: "L" | "M" | "Q" | "H";
}

export class StickerPrinter {

    public async renderToCanvas(
        layout: StickerLayout,
        data: StickerData,
        canvas: HTMLCanvasElement
    ): Promise<void> {
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context not available");

        canvas.width  = toPx(layout.width,  layout.unit);
        canvas.height = toPx(layout.height, layout.unit);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (layout.backgroundColor) {
            ctx.fillStyle = layout.backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (layout.backgroundImage) {
            await this.drawImage(ctx, layout.backgroundImage, 0, 0, canvas.width, canvas.height);
        }

        for (const element of layout.elements) {
            const x = toPx(element.x, layout.unit);
            const y = toPx(element.y, layout.unit);
            const w = toPx(element.w, layout.unit);
            const h = toPx(element.h, layout.unit);

            const filledContent = parseContent(
                element.content,
                data,
                element.type === "qr" ? element.qrSeparator : undefined
            );

            if (element.type === "qr") {
                if (filledContent) {
                    const qrUrl = await generateQR(filledContent);
                    await this.drawImage(ctx, qrUrl, x, y, w, h);
                }
            } else if (element.type === "barcode") {
                if (filledContent) {
                    this.drawBarcode(ctx, element, filledContent, x, y, w, h);
                }
            } else if (element.type === "text") {
                this.drawText(ctx, element, filledContent, x, y, w, h);
            }
        }
    }

    public async renderToDataURL(
        layout: StickerLayout,
        data: StickerData,
        options?: DataUrlOptions
    ): Promise<string> {
        const format = (options?.format || "png").toLowerCase() as ImageFormat;
        const mime   = format === "jpg" ? "image/jpeg" : `image/${format}`;
        const canvas = options?.canvas || this.createCanvas();
        await this.renderToCanvas(layout, data, canvas);
        return canvas.toDataURL(mime, options?.quality);
    }

    public async exportToPNG(
        layout: StickerLayout,
        data: StickerData,
        options?: ExportPNGOptions
    ): Promise<Blob> {
        const canvas  = options?.canvas || this.createCanvas();
        const dataUrl = await this.renderToDataURL(layout, data, { format: "png", canvas });

        // Convert data URL → Blob without requiring fetch (works in all environments)
        const [header, base64] = dataUrl.split(",");
        const mime             = header.match(/:(.*?);/)?.[1] ?? "image/png";
        const binary           = atob(base64);
        const bytes            = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new Blob([bytes], { type: mime });
    }

    public async exportImages(
        layout: StickerLayout,
        dataList: StickerData[],
        options?: DataUrlOptions
    ): Promise<string[]> {
        const results: string[] = [];
        for (const data of dataList) {
            results.push(await this.renderToDataURL(layout, data, options));
        }
        return results;
    }

    private drawBarcode(
        ctx: CanvasRenderingContext2D,
        el: StickerElement,
        data: string,
        x: number,
        y: number,
        w: number,
        h: number
    ): void {
        const tempCanvas = this.createCanvas();
        try {
            JsBarcode(tempCanvas, data, {
                format:       el.barcodeFormat || "CODE128",
                displayValue: true,
                margin:       0,
                background:   el.style?.backgroundColor || "#ffffff",
                lineColor:    el.style?.color           || "#000000",
            });
            ctx.drawImage(tempCanvas, x, y, w, h);
        } catch {
            // Invalid data for the chosen format — draw a visible error placeholder
            ctx.save();
            ctx.strokeStyle = "#cc0000";
            ctx.lineWidth   = 1;
            ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
            ctx.fillStyle   = "#cc0000";
            ctx.font        = `9px sans-serif`;
            ctx.textBaseline = "middle";
            ctx.fillText("Invalid barcode data", x + 4, y + h / 2);
            ctx.restore();
        }
    }

    private drawText(
        ctx: CanvasRenderingContext2D,
        el: StickerElement,
        text: string,
        x: number,
        y: number,
        w: number,
        h: number
    ): void {
        const style      = el.style || {};
        const fontSize   = style.fontSize   || 12;              // pt
        const fontSizePx = fontSize * (96 / 72);               // pt → px at 96 DPI baseline
        const fontFamily = style.fontFamily || "sans-serif";
        const fontWeight = style.fontWeight || "normal";
        const lineHeight = fontSizePx * (style.lineHeight ?? 1.25);
        const shouldWrap = style.wordWrap !== false; // default: true

        ctx.font      = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
        ctx.fillStyle = style.color || "#000";
        ctx.textAlign = (style.textAlign as CanvasTextAlign) || "left";

        let drawX = x;
        if (style.textAlign === "center") drawX = x + w / 2;
        if (style.textAlign === "right")  drawX = x + w;

        const lines = this.wrapText(ctx, text, w, shouldWrap);

        const blockHeight = lines.length * lineHeight;
        let blockStartY: number;

        if (style.verticalAlign === "middle") {
            blockStartY = y + (h - blockHeight) / 2;
        } else if (style.verticalAlign === "bottom") {
            blockStartY = y + h - blockHeight;
        } else {
            blockStartY = y;
        }

        ctx.textBaseline = "top";
        lines.forEach((line, i) => {
            ctx.fillText(line, drawX, blockStartY + i * lineHeight);
        });
    }

    private wrapText(
        ctx: CanvasRenderingContext2D,
        text: string,
        maxWidth: number,
        wrap: boolean
    ): string[] {
        if (!wrap) return [text];

        // Support explicit newlines (\n) in content
        const paragraphs = text.split("\n");
        const lines: string[] = [];

        for (const paragraph of paragraphs) {
            const words = paragraph.split(" ");
            let current = "";

            for (const word of words) {
                const candidate = current ? `${current} ${word}` : word;
                if (ctx.measureText(candidate).width > maxWidth && current) {
                    lines.push(current);
                    current = word;
                } else {
                    current = candidate;
                }
            }
            if (current) lines.push(current);
        }

        return lines.length > 0 ? lines : [""];
    }

    private drawImage(
        ctx: CanvasRenderingContext2D,
        url: string,
        x: number,
        y: number,
        w: number,
        h: number
    ): Promise<void> {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload  = () => { ctx.drawImage(img, x, y, w, h); resolve(); };
            img.onerror = () => resolve(); // Don't block render if image fails
            img.src = url;
        });
    }

    private createCanvas(): HTMLCanvasElement {
        if (typeof document === "undefined") {
            throw new Error(
                "Canvas creation requires a DOM environment. " +
                "Pass a canvas explicitly via options.canvas when rendering server-side."
            );
        }
        return document.createElement("canvas");
    }

    /** Requires the optional peer dependency: `npm install jspdf` */
    public async exportToPDF(
        layout: StickerLayout,
        dataList: Record<string, any>[]
    ): Promise<PdfDoc> {
        try {
            const { exportToPDF } = await import("../pdf");
            return await exportToPDF(layout, dataList);
        } catch {
            throw new Error(
                "PDF export requires the optional dependency 'jspdf'. " +
                "Run: npm install jspdf"
            );
        }
    }

    /**
     * Returns one ZPL string per record — send each directly to a thermal printer.
     * `dpi` must match your printer's physical setting; wrong DPI scales everything incorrectly.
     */
    public exportToZPL(
        layout: StickerLayout,
        dataList: Record<string, any>[],
        options?: ZplOptions
    ): string[] {
        const dpi              = options?.dpi ?? 203;    // dots per inch
        const dpmm             = dpi / 25.4;             // dots per mm (derived from actual DPI)
        const qrErrorLevel     = options?.qrErrorCorrection ?? "M"; // ZPL ^BQ d-param

        // ^FH enables underscore-hex escaping in ^FD; needed when content has ^, ~, or _
        const escapeFieldData = (text: string): { prefix: string; value: string } => {
            const needsEscape = /[\^~_]/.test(text);
            if (!needsEscape) return { prefix: "", value: text };
            const escaped = text
                .replace(/_/g, "_5F")  // must be first to avoid double-escaping
                .replace(/\^/g, "_5E")
                .replace(/~/g,  "_7E");
            return { prefix: "^FH", value: escaped };
        };

        return dataList.map(data => {
            const widthDots  = toDots(layout.width,  layout.unit, dpmm);
            const heightDots = toDots(layout.height, layout.unit, dpmm);

            let zpl = "^XA\n";
            zpl += `^PW${widthDots}\n`;
            zpl += `^LL${heightDots}\n`;

            for (const element of layout.elements) {
                const filledContent = parseContent(
                    element.content,
                    data,
                    element.type === "qr" ? element.qrSeparator : undefined
                );
                const x = toDots(element.x, layout.unit, dpmm);
                const y = toDots(element.y, layout.unit, dpmm);

                if (element.type === "text") {
                    const fontSizePt     = element.style?.fontSize || 12;
                    // 1 pt = 1/72 inch; dots = pt * (dpi / 72)
                    const fontHeightDots = Math.round(fontSizePt * (dpi / 72));
                    const { prefix, value } = escapeFieldData(filledContent);

                    zpl += `^FO${x},${y}^A0N,${fontHeightDots},${fontHeightDots}${prefix}^FD${value}^FS\n`;

                } else if (element.type === "qr") {
                    const wDots = toDots(element.w, layout.unit, dpmm);

                    // QR magnification factor (1–10):
                    // A QR Version-1 code is 21x21 modules. The mag factor is
                    // how many printer dots each module occupies.
                    // mag = floor(elementWidthDots / 21), clamped to [1, 10].
                    const mag = Math.min(10, Math.max(1, Math.floor(wDots / 21)));

                    const { prefix, value } = escapeFieldData(filledContent);
                    zpl += `^FO${x},${y}^BQN,2,${mag},${qrErrorLevel}${prefix}^FD${qrErrorLevel}A,${value}^FS\n`;

                } else if (element.type === "barcode") {
                    const hDots  = toDots(element.h, layout.unit, dpmm);
                    const format = element.barcodeFormat || "CODE128";
                    const { prefix, value } = escapeFieldData(filledContent);
                    let barcodeCmd: string;
                    switch (format) {
                        case "EAN13":  barcodeCmd = `^BEN,${hDots},Y,N`;       break;
                        case "UPCA":   barcodeCmd = `^BUN,${hDots},Y,N,N`;     break;
                        case "CODE39": barcodeCmd = `^B3N,N,${hDots},Y,N`;     break;
                        case "ITF14":  barcodeCmd = `^BIN,${hDots},Y,N`;       break;
                        default:       barcodeCmd = `^BCN,${hDots},Y,N,N`;     break; // CODE128
                    }

                    zpl += `^FO${x},${y}${barcodeCmd}${prefix}^FD${value}^FS\n`;
                }
            }

            zpl += "^XZ";
            return zpl;
        });
    }
}
