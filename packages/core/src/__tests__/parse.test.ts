import { describe, it, expect } from "vitest";
import { parseContent } from "../utils/parse";

describe("parseContent", () => {
    it("replaces a single variable", () => {
        expect(parseContent("Hello {{name}}", { name: "Ravi" })).toBe("Hello Ravi");
    });

    it("replaces multiple variables", () => {
        const result = parseContent("{{first}} {{last}}", { first: "Anita", last: "Sharma" });
        expect(result).toBe("Anita Sharma");
    });

    it("returns empty string for a missing key", () => {
        expect(parseContent("ID: {{id}}", {})).toBe("ID: ");
    });

    it("trims whitespace around the key name", () => {
        expect(parseContent("{{ name }}", { name: "John" })).toBe("John");
    });

    it("passes through static text with no placeholders", () => {
        expect(parseContent("Static Label", {})).toBe("Static Label");
    });

    it("handles an empty content string", () => {
        expect(parseContent("", { name: "X" })).toBe("");
    });

    it("stringifies a numeric value (non-zero)", () => {
        expect(parseContent("Qty: {{qty}}", { qty: 42 })).toBe("Qty: 42");
    });

    it("renders zero as '0', not empty string", () => {
        expect(parseContent("Count: {{n}}", { n: 0 })).toBe("Count: 0");
    });

    it("renders boolean false as 'false'", () => {
        expect(parseContent("Active: {{flag}}", { flag: false })).toBe("Active: false");
    });

    it("treats undefined values as empty string", () => {
        const data: Record<string, unknown> = { name: undefined };
        expect(parseContent("{{name}}", data)).toBe("");
    });

    it("injects separator between adjacent {{}} pairs", () => {
        const result = parseContent("{{a}}{{b}}", { a: "X", b: "Y" }, "|");
        expect(result).toBe("X|Y");
    });

    it("separator is not injected when only one placeholder exists", () => {
        const result = parseContent("{{a}}", { a: "X" }, "|");
        expect(result).toBe("X");
    });

    it("handles content with multiple lines (literal \\n)", () => {
        const result = parseContent("Line1: {{a}}\nLine2: {{b}}", { a: "foo", b: "bar" });
        expect(result).toBe("Line1: foo\nLine2: bar");
    });

    it("leaves unmatched braces that are not double-wrapped untouched", () => {
        expect(parseContent("{single}", {})).toBe("{single}");
    });

    it("replaces the same placeholder used twice", () => {
        expect(parseContent("{{x}} and {{x}}", { x: "hello" })).toBe("hello and hello");
    });
});
