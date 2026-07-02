/**
 * Convert a layout-unit value to pixels (96 DPI baseline for canvas rendering).
 *
 * @param value - The numeric value in the given unit.
 * @param unit  - Layout unit: "mm" | "cm" | "in" | "px".
 */
export function toPx(value: number, unit: string): number {
    switch (unit) {
        case "mm": return (value * 96) / 25.4;
        case "cm": return (value * 96) / 2.54;
        case "in": return value * 96;
        case "px":
        default:   return value;
    }
}

/**
 * Convert a layout-unit value to printer dots for ZPL output.
 *
 * @param value - The numeric value in the given unit.
 * @param unit  - Layout unit: "mm" | "cm" | "in" | "px".
 * @param dpmm  - Dots per millimetre, derived from printer DPI: `dpmm = dpi / 25.4`.
 */
export function toDots(value: number, unit: string, dpmm: number): number {
    let mm: number;
    switch (unit) {
        case "mm": mm = value; break;
        case "cm": mm = value * 10; break;
        case "in": mm = value * 25.4; break;
        case "px": mm = value * (25.4 / 96); break;
        default:   mm = value;
    }
    return Math.round(mm * dpmm);
}
