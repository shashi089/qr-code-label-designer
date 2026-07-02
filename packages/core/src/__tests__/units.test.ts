import { describe, it, expect } from "vitest";
import { toPx, toDots } from "../utils/units";

// ─── toPx ────────────────────────────────────────────────────────────────────

describe("toPx", () => {
    it("converts mm to px (25.4 mm = 96 px)", () => {
        expect(toPx(25.4, "mm")).toBeCloseTo(96, 5);
    });

    it("converts cm to px (2.54 cm = 96 px)", () => {
        expect(toPx(2.54, "cm")).toBeCloseTo(96, 5);
    });

    it("converts inches to px (1 in = 96 px)", () => {
        expect(toPx(1, "in")).toBe(96);
    });

    it("leaves px values unchanged", () => {
        expect(toPx(150, "px")).toBe(150);
    });

    it("defaults to px for an unknown unit", () => {
        expect(toPx(72, "pt")).toBe(72);
    });

    it("handles zero value for all units", () => {
        expect(toPx(0, "mm")).toBe(0);
        expect(toPx(0, "cm")).toBe(0);
        expect(toPx(0, "in")).toBe(0);
        expect(toPx(0, "px")).toBe(0);
    });

    it("converts 100 mm correctly", () => {
        // 100mm * 96 / 25.4 ≈ 377.95px
        expect(toPx(100, "mm")).toBeCloseTo(377.95, 1);
    });
});

// ─── toDots ──────────────────────────────────────────────────────────────────

describe("toDots", () => {
    // dpmm at 203 DPI = 203 / 25.4 ≈ 7.9921
    const dpmm203 = 203 / 25.4;
    // dpmm at 300 DPI = 300 / 25.4 ≈ 11.8110
    const dpmm300 = 300 / 25.4;

    it("converts mm at 203 DPI (25.4 mm = 203 dots)", () => {
        expect(toDots(25.4, "mm", dpmm203)).toBe(203);
    });

    it("converts cm at 203 DPI (2.54 cm = 203 dots)", () => {
        expect(toDots(2.54, "cm", dpmm203)).toBe(203);
    });

    it("converts inches at 203 DPI (1 in = 203 dots)", () => {
        expect(toDots(1, "in", dpmm203)).toBe(203);
    });

    it("converts px at 203 DPI (96 px = 203 dots, since 96px = 1 inch)", () => {
        expect(toDots(96, "px", dpmm203)).toBe(203);
    });

    it("uses 300 DPI correctly (1 inch = 300 dots)", () => {
        expect(toDots(1, "in", dpmm300)).toBe(300);
    });

    it("rounds fractional dots to nearest integer", () => {
        // 1mm at 203 DPI = 7.9921... → rounds to 8
        expect(toDots(1, "mm", dpmm203)).toBe(8);
    });

    it("returns 0 for zero value", () => {
        expect(toDots(0, "mm", dpmm203)).toBe(0);
    });

    it("defaults to mm behaviour for unknown unit", () => {
        // unknown unit treated as mm
        expect(toDots(25.4, "pt", dpmm203)).toBe(203);
    });

    it("scales proportionally — 300 DPI produces more dots than 203 DPI", () => {
        const dots203 = toDots(50, "mm", dpmm203);
        const dots300 = toDots(50, "mm", dpmm300);
        expect(dots300).toBeGreaterThan(dots203);
    });
});
