/** Physical measurement unit used for all layout dimensions and element positions. */
export type Unit = "mm" | "px" | "cm" | "in";

/** The kind of content an element renders. */
export type ElementType = "text" | "qr";

/** Visual styling options for a text or QR element. */
export interface ElementStyle {
    /** Font family name, e.g. `"Arial"` or `"sans-serif"`. Defaults to `"sans-serif"`. */
    fontFamily?: string;
    /**
     * Font size in **points (pt)**. Defaults to `12`.
     * All three renderers (Canvas PNG, PDF, ZPL) treat this value as pt.
     * The canvas renderer converts pt → px internally using a 96 DPI baseline (`pt × 96/72`).
     */
    fontSize?: number;
    /** CSS-compatible font weight: `"normal"`, `"bold"`, or a numeric value like `700`. */
    fontWeight?: string | number;
    /** CSS colour string for the text fill, e.g. `"#000000"`. Defaults to `"#000"`. */
    color?: string;

    /** Horizontal text alignment within the element bounds. Defaults to `"left"`. */
    textAlign?: "left" | "center" | "right";
    /** Vertical alignment of the text block within the element bounds. Defaults to `"top"`. */
    verticalAlign?: "top" | "middle" | "bottom";

    /**
     * Line height multiplier relative to `fontSize`. Defaults to `1.25`.
     * @example fontSize=12, lineHeight=1.5 → 18pt line height (rendered as ~24px on canvas).
     */
    lineHeight?: number;

    /**
     * Whether long text wraps to the next line when it exceeds the element width.
     * Defaults to `true`. Set to `false` to force single-line rendering (text clips).
     */
    wordWrap?: boolean;

    /** Background fill colour for the element bounding box, e.g. `"#ffffff"`. */
    backgroundColor?: string;
}

/**
 * A single visual element placed on a label — either a text block or a QR code.
 *
 * **Position & size** values use the parent `StickerLayout`'s `unit`.
 *
 * **Template variables** in `content` use the `{{variableName}}` syntax and are
 * replaced at render time with values from the `StickerData` record.
 *
 * @example
 * // Static text
 * { id: "t1", type: "text", x: 5, y: 5, w: 90, h: 10, content: "Hello World" }
 *
 * // Dynamic text bound to data
 * { id: "t2", type: "text", x: 5, y: 5, w: 90, h: 10, content: "Name: {{fullName}}" }
 *
 * // QR code encoding two fields separated by a pipe
 * { id: "q1", type: "qr", x: 70, y: 5, w: 25, h: 25,
 *   content: "{{employeeId}}{{department}}", qrSeparator: "|" }
 */
export interface StickerElement {
    /** Unique identifier for this element within the layout. */
    id: string;
    /** Element kind — determines the renderer used at print time. */
    type: ElementType;

    /** Horizontal position from the left edge of the label (in layout units). */
    x: number;
    /** Vertical position from the top edge of the label (in layout units). */
    y: number;
    /** Element width (in layout units). */
    w: number;
    /** Element height (in layout units). */
    h: number;

    /**
     * The content string for this element. Can be:
     * - Static text: `"Batch #42"`
     * - A single template variable: `"{{partNumber}}"`
     * - Mixed: `"Part: {{partNumber}} — Qty: {{qty}}"`
     * - Multi-field for QR codes: `"{{id}}{{name}}"` (use `qrSeparator` to delimit)
     */
    content: string;

    /**
     * For QR elements only — a string injected between adjacent `{{}}` pairs.
     * @example qrSeparator: "|"  →  "{{id}}{{name}}" encodes as "EMP-001|John Doe"
     */
    qrSeparator?: string;

    /** Optional styling overrides for text elements. */
    style?: ElementStyle;
}

/**
 * A flat key-value record of data bound to one label at render time.
 * Keys match the `{{variableName}}` placeholders used in element `content` strings.
 *
 * @example { fullName: "Ravi Kumar", employeeId: "EMP-001", department: "Engineering" }
 */
export type StickerData = Record<string, unknown>;

/**
 * The top-level template that defines a label's physical dimensions and all its elements.
 *
 * Save this object to a database or JSON file to reuse the same design across many print jobs.
 * At print time, pass it together with an array of `StickerData` records to
 * `StickerPrinter.exportToZPL`, `exportToPDF`, or `exportImages`.
 *
 * @example
 * const layout: StickerLayout = {
 *   id: "badge-v1", name: "Employee Badge",
 *   width: 100, height: 60, unit: "mm",
 *   elements: [
 *     { id: "name", type: "text", x: 5, y: 5, w: 90, h: 10, content: "{{fullName}}" },
 *     { id: "qr",   type: "qr",   x: 75, y: 5, w: 20, h: 20, content: "{{employeeId}}" },
 *   ],
 * };
 */
export interface StickerLayout {
    /** Unique identifier — used when persisting and retrieving layouts from a database. */
    id: string;
    /** Human-readable display name shown in designer UIs and file exports. */
    name: string;
    /** Label width in the chosen `unit`. */
    width: number;
    /** Label height in the chosen `unit`. */
    height: number;
    /** Physical measurement unit applied to all dimensions and element positions. */
    unit: Unit;
    /** Ordered list of elements rendered onto the label surface. */
    elements: StickerElement[];
    /**
     * Optional reference to an entity schema key (e.g. `"employee"`, `"machine"`).
     * Used by the designer UI to surface the correct data-field suggestions.
     */
    targetEntity?: string;
    /** Optional CSS colour applied as the label background fill, e.g. `"#ffffff"`. */
    backgroundColor?: string;
    /** Optional URL or data URL for a background image rendered behind all elements. */
    backgroundImage?: string;
}

/** Image output format for canvas-based PNG/JPEG/WebP exports. */
export type ImageFormat = "png" | "jpeg" | "jpg" | "webp";
