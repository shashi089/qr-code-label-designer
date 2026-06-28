import { describe, it, expect } from "vitest";
import { StickerPrinter } from "../printer/StickerPrinter";
import type { StickerLayout } from "../layout/schema";

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const printer = new StickerPrinter();

const baseLayout: StickerLayout = {
    id: "test-layout",
    name: "Test Label",
    width: 100,
    height: 50,
    unit: "mm",
    elements: [],
};

const textElement = {
    id: "el-text",
    type: "text" as const,
    x: 5, y: 10, w: 80, h: 10,
    content: "Hello {{name}}",
    style: { fontSize: 12 },
};

const qrElement = {
    id: "el-qr",
    type: "qr" as const,
    x: 5, y: 5, w: 20, h: 20,
    content: "{{employeeId}}",
};

// ─── Basic structure ──────────────────────────────────────────────────────────

describe("exportToZPL — basic structure", () => {
    it("returns one ZPL string per record", () => {
        const result = printer.exportToZPL(baseLayout, [{}, {}, {}]);
        expect(result).toHaveLength(3);
    });

    it("each label starts with ^XA and ends with ^XZ", () => {
        const [label] = printer.exportToZPL(baseLayout, [{}]);
        expect(label.startsWith("^XA\n")).toBe(true);
        expect(label.endsWith("^XZ")).toBe(true);
    });

    it("emits ^PW with correct dot width for 100mm at 203 DPI", () => {
        // 100mm * (203/25.4) = 799.21... → 799
        const [label] = printer.exportToZPL(baseLayout, [{}]);
        expect(label).toContain("^PW799\n");
    });

    it("emits ^LL with correct dot height for 50mm at 203 DPI", () => {
        // 50mm * (203/25.4) = 399.61... → 400
        const [label] = printer.exportToZPL(baseLayout, [{}]);
        expect(label).toContain("^LL400\n");
    });

    it("returns an empty array when dataList is empty", () => {
        expect(printer.exportToZPL(baseLayout, [])).toEqual([]);
    });
});

// ─── Text elements ────────────────────────────────────────────────────────────

describe("exportToZPL — text element", () => {
    const layout: StickerLayout = { ...baseLayout, elements: [textElement] };

    it("emits ^FO, ^A0N, ^FD, ^FS for a text element", () => {
        const [label] = printer.exportToZPL(layout, [{ name: "Ravi" }]);
        expect(label).toContain("^FO");
        expect(label).toContain("^A0N");
        expect(label).toContain("^FDHello Ravi^FS");
    });

    it("substitutes {{variable}} with actual data", () => {
        const [label] = printer.exportToZPL(layout, [{ name: "Anita" }]);
        expect(label).toContain("^FDHello Anita^FS");
    });

    it("renders empty string for missing variable", () => {
        const [label] = printer.exportToZPL(layout, [{}]);
        expect(label).toContain("^FDHello ^FS");
    });

    it("calculates font height in dots from pt at 203 DPI (12pt → 34 dots)", () => {
        // 12 * (203/72) = 33.83... → 34
        const [label] = printer.exportToZPL(layout, [{ name: "X" }]);
        expect(label).toContain("^A0N,34,34");
    });

    it("uses correct x/y position in dots (5mm,10mm at 203 DPI → 40,80)", () => {
        // x: round(5 * 203/25.4) = round(39.96) = 40
        // y: round(10 * 203/25.4) = round(79.92) = 80
        const [label] = printer.exportToZPL(layout, [{ name: "X" }]);
        expect(label).toContain("^FO40,80");
    });
});

// ─── QR elements ─────────────────────────────────────────────────────────────

describe("exportToZPL — QR element", () => {
    const layout: StickerLayout = { ...baseLayout, elements: [qrElement] };

    it("emits ^BQN and ^FD with QR data", () => {
        const [label] = printer.exportToZPL(layout, [{ employeeId: "EMP-001" }]);
        expect(label).toContain("^BQN");
        expect(label).toContain("^FDMA,EMP-001^FS");
    });

    it("uses default error correction level M", () => {
        const [label] = printer.exportToZPL(layout, [{ employeeId: "X" }]);
        expect(label).toContain("^FDMA,X^FS");
    });

    it("respects custom error correction level H", () => {
        const [label] = printer.exportToZPL(layout, [{ employeeId: "X" }], { qrErrorCorrection: "H" });
        expect(label).toContain("^FDHA,X^FS");
    });

    it("calculates QR magnification from element width (20mm at 203 DPI → mag 7)", () => {
        // wDots = round(20 * 203/25.4) = round(159.84) = 160
        // mag = floor(160/21) = floor(7.619) = 7
        const [label] = printer.exportToZPL(layout, [{ employeeId: "X" }]);
        expect(label).toContain("^BQN,2,7,M");
    });
});

// ─── DPI scaling ─────────────────────────────────────────────────────────────

describe("exportToZPL — DPI scaling", () => {
    it("300 DPI produces larger dot values than 203 DPI for the same layout", () => {
        const [label203] = printer.exportToZPL(baseLayout, [{}], { dpi: 203 });
        const [label300] = printer.exportToZPL(baseLayout, [{}], { dpi: 300 });

        const pw203 = Number(/\^PW(\d+)/.exec(label203)?.[1]);
        const pw300 = Number(/\^PW(\d+)/.exec(label300)?.[1]);
        expect(pw300).toBeGreaterThan(pw203);
    });

    it("emits ^PW1181 for 100mm at 300 DPI", () => {
        // round(100 * 300/25.4) = round(1181.1) = 1181
        const [label] = printer.exportToZPL(baseLayout, [{}], { dpi: 300 });
        expect(label).toContain("^PW1181\n");
    });
});

// ─── ZPL escaping ────────────────────────────────────────────────────────────

describe("exportToZPL — field data escaping", () => {
    const layout: StickerLayout = {
        ...baseLayout,
        elements: [{ ...textElement, content: "{{val}}" }],
    };

    it("emits no ^FH for plain text (no special chars)", () => {
        const [label] = printer.exportToZPL(layout, [{ val: "Normal text 123" }]);
        expect(label).not.toContain("^FH");
    });

    it("escapes ^ with ^FH prefix and _5E", () => {
        const [label] = printer.exportToZPL(layout, [{ val: "A^B" }]);
        expect(label).toContain("^FH");
        expect(label).toContain("_5E");
    });

    it("escapes ~ with ^FH prefix and _7E", () => {
        const [label] = printer.exportToZPL(layout, [{ val: "A~B" }]);
        expect(label).toContain("^FH");
        expect(label).toContain("_7E");
    });

    it("escapes _ with ^FH prefix and _5F", () => {
        const [label] = printer.exportToZPL(layout, [{ val: "part_number" }]);
        expect(label).toContain("^FH");
        expect(label).toContain("_5F");
    });

    it("encodes _ before ^ to prevent double-escaping", () => {
        // "a_^b" → "_" becomes "_5F", then "^" becomes "_5E"
        // result should be "a_5F_5Eb", not "a_5E5Fb"
        const [label] = printer.exportToZPL(layout, [{ val: "a_^b" }]);
        expect(label).toContain("a_5F_5Eb");
    });
});

// ─── Multi-record ─────────────────────────────────────────────────────────────

describe("exportToZPL — multiple records", () => {
    const layout: StickerLayout = {
        ...baseLayout,
        elements: [{ ...textElement, content: "{{name}}" }],
    };

    it("each record produces independent ZPL with its own data", () => {
        const [l1, l2, l3] = printer.exportToZPL(layout, [
            { name: "Alice" },
            { name: "Bob" },
            { name: "Charlie" },
        ]);
        expect(l1).toContain("^FDAlice^FS");
        expect(l2).toContain("^FDBob^FS");
        expect(l3).toContain("^FDCharlie^FS");
    });
});

// ─── Unit variants ────────────────────────────────────────────────────────────

describe("exportToZPL — layout unit variants", () => {
    it("produces the same dot count for equivalent sizes in different units", () => {
        const mmLayout: StickerLayout = { ...baseLayout, width: 25.4, height: 25.4, unit: "mm" };
        const inLayout: StickerLayout = { ...baseLayout, width: 1, height: 1, unit: "in" };

        const [mmLabel] = printer.exportToZPL(mmLayout, [{}]);
        const [inLabel] = printer.exportToZPL(inLayout, [{}]);

        const mmPW = /\^PW(\d+)/.exec(mmLabel)?.[1];
        const inPW = /\^PW(\d+)/.exec(inLabel)?.[1];
        expect(mmPW).toBe(inPW);
    });
});
