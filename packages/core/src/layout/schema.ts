export type Unit = "mm" | "px" | "cm" | "in";

export type ElementType = "text" | "qr" | "barcode";

/**
 * - `CODE128`  — universal logistics, GS1, shipping
 * - `EAN13`    — retail (requires exactly 12 data digits; check digit auto-calculated)
 * - `UPCA`     — US retail (requires exactly 11 data digits)
 * - `CODE39`   — legacy MRO / industrial (alphanumeric + ` - . $ / + %`)
 * - `ITF14`    — carton / pallet shipping (requires exactly 13 data digits)
 */
export type BarcodeFormat = "CODE128" | "EAN13" | "UPCA" | "CODE39" | "ITF14";

export interface ElementStyle {
    fontFamily?: string;
    /** Font size in points (pt). Canvas renderer converts pt → px at 96 DPI baseline. */
    fontSize?: number;
    fontWeight?: string | number;
    color?: string;
    textAlign?: "left" | "center" | "right";
    verticalAlign?: "top" | "middle" | "bottom";
    lineHeight?: number;
    wordWrap?: boolean;
    backgroundColor?: string;
}

/**
 * A single visual element on a label.
 *
 * `content` supports `{{variableName}}` placeholders replaced at render time.
 * For QR elements with multiple fields: `"{{id}}{{name}}"` + `qrSeparator: "|"` → `"EMP-001|John Doe"`.
 */
export interface StickerElement {
    id: string;
    type: ElementType;
    x: number;
    y: number;
    w: number;
    h: number;
    content: string;
    /** For QR elements — string injected between adjacent `{{}}` pairs. */
    qrSeparator?: string;
    /** For barcode elements — defaults to `"CODE128"` when omitted. */
    barcodeFormat?: BarcodeFormat;
    style?: ElementStyle;
}

/** Flat key-value record bound to one label at render time. Keys match `{{variableName}}` placeholders. */
export type StickerData = Record<string, unknown>;

/**
 * Top-level label template. Save to a database or JSON file to reuse across print jobs.
 * At print time, pass it with an array of `StickerData` records to `StickerPrinter`.
 */
export interface StickerLayout {
    id: string;
    name: string;
    width: number;
    height: number;
    unit: Unit;
    elements: StickerElement[];
    /** Reference to an entity schema key — used by the designer to surface field suggestions. */
    targetEntity?: string;
    backgroundColor?: string;
    backgroundImage?: string;
}

export type ImageFormat = "png" | "jpeg" | "jpg" | "webp";
