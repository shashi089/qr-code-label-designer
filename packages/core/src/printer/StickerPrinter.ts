import { StickerLayout, StickerElement, StickerData, ImageFormat } from "../layout/schema";
import { generateQR } from "../qr/generator";
import type { PdfDoc } from "../pdf";

export interface DataUrlOptions {
    format?: ImageFormat;
    quality?: number;
    canvas?: HTMLCanvasElement;
}

export class StickerPrinter {

    // Helper to convert units to Pixels (Canvas) and Points (PDF)
    // We'll use 96 dpi for screen/canvas calculations
    private toPx(value: number, unit: string): number {
        switch (unit) {
            case "mm": return (value * 96) / 25.4;
            case "cm": return (value * 96) / 2.54;
            case "in": return value * 96;
            case "px": default: return value;
        }
    }

    // Parse variable content like "{{name}}"
    private parseContent(content: string, data: StickerData, separator?: string): string {
        let processed = content;
        if (separator) {
            // Replace spaces between braces or just consecutive braces with the separator
            processed = processed.replace(/\}\}\s*\{\{/g, `}}${separator}{{`);
        }
        return processed.replace(/\{\{(.*?)\}\}/g, (_, key) => {
            const trimmedKey = key.trim();
            return data[trimmedKey] !== undefined ? String(data[trimmedKey]) : "";
        });
    }

    // --- HTML Canvas Renderer (Preview & Image Export) ---

    public async renderToCanvas(
        layout: StickerLayout,
        data: StickerData,
        canvas: HTMLCanvasElement,
        isJpg: boolean = false
    ): Promise<void> {
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context not available");

        // Setup Canvas Size
        canvas.width = this.toPx(layout.width, layout.unit);
        canvas.height = this.toPx(layout.height, layout.unit);

        // Clear & Background
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let bg = layout.backgroundColor;
        if (!bg && isJpg) {
            bg = "#ffffff";
        }
        
        if (bg) {
            ctx.fillStyle = bg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        if (layout.backgroundImage) {
            await this.drawImage(ctx, layout.backgroundImage, 0, 0, canvas.width, canvas.height);
        }

        // Render Elements
        for (const element of layout.elements) {
            const x = this.toPx(element.x, layout.unit);
            const y = this.toPx(element.y, layout.unit);
            const w = this.toPx(element.w, layout.unit);
            const h = this.toPx(element.h, layout.unit);

            const filledContent = this.parseContent(
                element.content,
                data,
                element.type === "qr" ? element.qrSeparator : undefined
            );

            if (element.type === "qr") {
                if (filledContent) {
                    const qrUrl = await generateQR(filledContent);
                    await this.drawImage(ctx, qrUrl, x, y, w, h);
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
        const mime = (format === "jpg" || format === "jpeg") ? "image/jpeg" : `image/${format}`;
        const canvas = options?.canvas || this.createCanvas();
        await this.renderToCanvas(layout, data, canvas, format === "jpg" || format === "jpeg");
        return canvas.toDataURL(mime, options?.quality);
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

    private drawText(ctx: CanvasRenderingContext2D, el: StickerElement, text: string, x: number, y: number, w: number, h: number) {
        const style = el.style || {};
        const fontSize = style.fontSize || 12;
        const fontFamily = style.fontFamily || "sans-serif";
        const fontWeight = style.fontWeight || "normal";

        ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
        ctx.fillStyle = style.color || "#000";

        // Handle Vertical Alignment (textBaseline)
        ctx.textBaseline = style.verticalAlign === "middle" ? "middle" : (style.verticalAlign === "bottom" ? "bottom" : "top");
        ctx.textAlign = (style.textAlign as CanvasTextAlign) || "left";

        // Handle Horizontal Alignment X adjustment
        let drawX = x;
        if (style.textAlign === "center") drawX = x + w / 2;
        if (style.textAlign === "right") drawX = x + w;

        // Handle Vertical Alignment Y adjustment
        let drawY = y;
        if (style.verticalAlign === "middle") drawY = y + h / 2;
        if (style.verticalAlign === "bottom") drawY = y + h;

        ctx.fillText(text, drawX, drawY);
    }

    private drawImage(ctx: CanvasRenderingContext2D, url: string, x: number, y: number, w: number, h: number): Promise<void> {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                ctx.drawImage(img, x, y, w, h);
                resolve();
            };
            img.onerror = () => resolve(); // Don't block if image fails
            img.src = url;
        });
    }

    private createCanvas(): HTMLCanvasElement {
        if (typeof document === "undefined") {
            throw new Error("Canvas creation requires a DOM environment. Pass a canvas explicitly when rendering server-side.");
        }
        return document.createElement("canvas");
    }

    // --- PDF Exporter ---

    public async exportToPDF(
        layout: StickerLayout,
        dataList: Record<string, any>[]
    ): Promise<PdfDoc> {
        try {
            const { exportToPDF } = await import("../pdf");
            return await exportToPDF(layout, dataList);
        } catch (err) {
            throw new Error("PDF export requires optional dependency 'jspdf'. Install it to use exportToPDF().");
        }
    }

    // --- ZPL Exporter ---

    public exportToZPL(
        layout: StickerLayout,
        dataList: Record<string, any>[],
        options?: { dpi?: 203 | 300 }
    ): string[] {
        const dpi = options?.dpi || 203;
        // dots per mm: 203dpi = 8 dpmm, 300dpi = 11.811 dpmm
        const dpmm = dpi === 300 ? 11.811 : 8;

        /** Convert any supported unit to Zebra dots */
        const toDots = (val: number, unit: string): number => {
            let mm = 0;
            switch (unit) {
                case "mm": mm = val; break;
                case "cm": mm = val * 10; break;
                case "in": mm = val * 25.4; break;
                case "px": mm = val * (25.4 / 96); break;
                default:   mm = val;
            }
            return Math.round(mm * dpmm);
        };

        /**
         * Escape text for ZPL ^FD field:
         *  - Replace newline characters with ZPL line-break escape \&
         *  - Escape ^ and ~ which are ZPL control characters
         */
        const escapeZPL = (text: string): string =>
            text
                .replace(/\^/g, "^5E")   // escape caret
                .replace(/~/g,  "^7E")   // escape tilde
                .replace(/\r?\n/g, "\\&"); // newline → ZPL line break

        /**
         * Estimate the number of wrapped lines for a block of text.
         * Used to improve vertical alignment accuracy for multi-line fields.
         */
        const estimateLineCount = (text: string, fontDots: number, widthDots: number): number => {
            const charsPerLine = Math.max(1, Math.floor(widthDots / (fontDots * 0.6)));
            const explicitLines = text.split(/\r?\n/).length;
            const wrappedLines = text.split(/\r?\n/).reduce((sum, line) => {
                return sum + Math.max(1, Math.ceil(line.length / charsPerLine));
            }, 0);
            return Math.max(explicitLines, wrappedLines);
        };

        const results: string[] = [];

        for (const data of dataList) {
            const heightDots = toDots(layout.height, layout.unit);
            const widthDots  = toDots(layout.width,  layout.unit);

            // --- ZPL Header ---
            // ^XA        Start format
            // ^LH0,0     Label home at top-left (explicit origin)
            // ^CI28      Enable UTF-8 character set
            // ^PW        Print width in dots
            // ^LL        Label length in dots
            let zpl = [
                "^XA",
                "^LH0,0",
                "^CI28",
                `^PW${widthDots}`,
                `^LL${heightDots}`,
            ].join("\n") + "\n";

            for (const element of layout.elements) {
                const filledContent = this.parseContent(
                    element.content,
                    data,
                    element.type === "qr" ? element.qrSeparator : undefined
                );

                const x = toDots(element.x, layout.unit);
                const y = toDots(element.y, layout.unit);

                // ── TEXT ELEMENT ─────────────────────────────────────────────
                if (element.type === "text") {
                    const style = element.style || {};

                    // Font size: pt → dots  (1 pt = 1/72 inch)
                    const fontSizePt    = style.fontSize || 12;
                    const fontHeightDots = Math.round(fontSizePt * (dpi / 72));
                    // Keep aspect ratio 1:1 (square font cell) — standard for ^A0
                    const fontWidthDots  = fontHeightDots;

                    const wDots = toDots(element.w, layout.unit);
                    const hDots = toDots(element.h, layout.unit);

                    // ── Vertical alignment (multi-line aware) ─────────────────
                    // Estimate total rendered block height to compute proper Y offset
                    const lineCount   = estimateLineCount(filledContent, fontHeightDots, wDots);
                    const blockHeight = lineCount * fontHeightDots;

                    let drawY = y;
                    const vAlign = style.verticalAlign || "top";
                    if (vAlign === "middle") {
                        drawY = Math.max(y, Math.round(y + (hDots - blockHeight) / 2));
                    } else if (vAlign === "bottom") {
                        drawY = Math.max(y, Math.round(y + hDots - blockHeight));
                    }

                    // ── Horizontal alignment ──────────────────────────────────
                    // ^FB justification: L=Left  C=Center  R=Right  J=Justified
                    let alignZpl = "L";
                    if (style.textAlign === "center") alignZpl = "C";
                    if (style.textAlign === "right")  alignZpl = "R";
                    if (style.textAlign === "justify") alignZpl = "J";

                    // Sanitize content for ZPL field data
                    const safeContent = escapeZPL(filledContent);

                    // ── Emit ZPL commands (one per line for readability/debuggability) ──
                    // ^FO  – field origin (x, y)
                    // ^A0N – scalable font, Normal orientation, height, width
                    // ^FB  – field block: width, maxLines, lineSpacing, justify, hangingIndent
                    //         lineSpacing=0 means use default inter-line gap (font-height based)
                    // ^FD  – field data
                    // ^FS  – field separator
                    zpl += `^FO${x},${drawY}\n`;
                    zpl += `^A0N,${fontHeightDots},${fontWidthDots}\n`;
                    zpl += `^FB${wDots},${lineCount + 1},0,${alignZpl},0\n`;
                    zpl += `^FD${safeContent}^FS\n`;
                }

                // ── QR CODE ELEMENT ──────────────────────────────────────────
                else if (element.type === "qr") {
                    if (!filledContent) continue;

                    const wDots = toDots(element.w, layout.unit);

                    // Version-adaptive QR magnification
                    // QR version N has (21 + 4*(N-1)) modules per side
                    // We pick the version that fits the content length, then
                    // compute the largest magnification (1–10) that fits the element width.
                    const len = filledContent.length;
                    let version = 1;
                    if      (len > 500) version = 40;
                    else if (len > 320) version = 27;
                    else if (len > 120) version = 10;
                    else if (len >  80) version = 7;
                    else if (len >  50) version = 5;
                    else if (len >  30) version = 3;
                    else if (len >  15) version = 2;

                    const modulesPerSide = 21 + 4 * (version - 1);
                    const mag = Math.max(1, Math.min(10, Math.floor(wDots / modulesPerSide)));

                    // ^BQN – QR Code bar code, Normal orientation, Model 2, magnification
                    // ^FDQA, – Q = error correction level Q (~25%), A = auto mode
                    // Note: ^FH is NOT needed here; QR data is not hex-encoded
                    zpl += `^FO${x},${y}\n`;
                    zpl += `^BQN,2,${mag}\n`;
                    zpl += `^FDQA,${filledContent}^FS\n`;
                }
            }

            // --- ZPL Footer ---
            zpl += "^XZ\n";
            results.push(zpl);
        }

        return results;
    }

}

