import type { StickerData } from "../layout/schema";

/**
 * Replace `{{variableName}}` placeholders in a content string with values from data.
 *
 * - Missing keys resolve to an empty string (never `"undefined"`).
 * - Numeric/boolean values are coerced to string via `String()`.
 * - The optional `separator` is injected between adjacent `}}{{` pairs, which is
 *   used to build multi-field QR code payloads (e.g. `"{{id}}|{{name}}"`).
 */
export function parseContent(
    content: string,
    data: StickerData,
    separator?: string
): string {
    let processed = content;
    if (separator) {
        processed = processed.replace(/\}\}\s*\{\{/g, `}}${separator}{{`);
    }
    return processed.replace(/\{\{(.*?)\}\}/g, (_, key) => {
        const trimmedKey = String(key).trim();
        return data[trimmedKey] !== undefined ? String(data[trimmedKey]) : "";
    });
}
