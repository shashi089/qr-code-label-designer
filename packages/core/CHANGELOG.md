# Changelog — qrlayout-core

All notable changes to this package are documented here.  
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.1.8] — 2026-06-04

### 🐛 Bug Fixes
- **Text overflow fixed (Canvas)** — Text elements no longer silently overflow their bounding box. The Canvas renderer now wraps long text automatically using `ctx.measureText()` to break words at the element's `w` boundary.
- **Text overflow fixed (PDF)** — The PDF renderer now calls `doc.splitTextToSize(text, w)` (jsPDF's built-in word-wrap) before drawing text, ensuring text wraps within the element width in exported PDFs.
- **Vertical alignment corrected for multi-line text** — When text wraps into multiple lines, `verticalAlign: "middle"` and `"bottom"` now correctly align the **entire text block**, not just the first line. Applies to both Canvas and PDF renderers.
- **Explicit newline support in Canvas** — Content containing `\n` characters is now split into separate lines in the Canvas renderer.
- **ZPL DPI no longer hardcoded** — `exportToZPL()` previously hardcoded 203 DPI (`dpmm = 8`) for all element positions, label sizes, and font heights. This caused incorrect physical label sizing on 300 DPI and 600 DPI Zebra printers. DPI is now passed as an option (`{ dpi: 300 }`) and defaults to `203` for full backward compatibility. The font-size-to-dots conversion (`pt * 2.82`) was also corrected to use `pt * (dpi / 72)` so it scales correctly at any DPI.
- **ZPL special character escaping** — If data values contained `^` or `~` (ZPL's command/tilde delimiters), the generated ZPL would be silently corrupted — the printer would interpret the character as a new command, garbling the rest of the field. Fixed by detecting these characters and emitting `^FH` (Field Hexadecimal) before the field, then encoding `^` → `_5E`, `~` → `_7E`, and literal `_` → `_5F`. Escape is applied automatically and only when the data actually requires it.
- **ZPL QR magnification corrected** — The magnification factor (`^BQ` 3rd param) was previously a coarse threshold (`w > 200 → 6, w > 100 → 4`). This did not account for DPI and produced incorrect QR module sizes. Fixed using the proper formula: `mag = floor(widthInDots / 21)` clamped to `[1, 10]`, where 21 is the minimum QR module count (Version 1).
- **ZPL QR error correction level made explicit** — `^BQ` previously omitted the `d` (error correction level) parameter and the `^FD` data used a hardcoded `QA,` prefix (Quartile error correction). The error level is now consistent between `^BQ` and `^FD`, configurable via `options.qrErrorCorrection`, and defaults to `M` (Medium, 15% recovery) which is appropriate for most labels.

### ✨ New Features
- **`StickerPrinter.exportToPNG(layout, data, options?)`** — New method that exports a single label as a native `Blob` (PNG format). Ideal for file downloads, the File API, or `FormData` uploads. Previously the only way to get image output was `renderToDataURL()` which returns a string. Both are now available.
- **`exportToZPL()` DPI option** — Third parameter `options?: ZplOptions` added to `exportToZPL()`. Pass `{ dpi: 300 }` or `{ dpi: 600 }` to match your printer's physical resolution. Accepts any number for custom DPI values.
- **`ZplOptions` interface** — Exported TypeScript type for the ZPL options object. Includes `dpi` with JSDoc listing common Zebra printer DPI values and typical models.
- **`ElementStyle.wordWrap`** (`boolean`, default `true`) — New optional style property. Set `wordWrap: false` on any text element to force single-line rendering and disable automatic wrapping. Existing layouts that omit this property are unaffected (wrapping is enabled by default, fixing the overflow bug).
- **`ElementStyle.lineHeight`** (`number`, default `1.25`) — New optional style property. Controls the line height multiplier relative to `fontSize`. Example: `fontSize: 12, lineHeight: 1.5` produces 18px between lines. Works in both Canvas and PDF output.
- **`ExportPNGOptions` interface** — Exported type for the new `exportToPNG()` options object (`{ canvas?: HTMLCanvasElement }`).

### 📄 Documentation
- **Methods table corrected** — README API reference now lists all 6 real `StickerPrinter` methods (`renderToCanvas`, `renderToDataURL`, `exportToPNG`, `exportImages`, `exportToPDF`, `exportToZPL`) with correct signatures and return types.
- **New ZPL Export section added** — Dedicated README section explains DPI options, shows examples for 203/300/600 DPI, and includes a printer model reference table.
- **PNG export example corrected** — README Quick Start section now shows both `exportToPNG()` (Blob) and `renderToDataURL()` (string) with correct usage patterns.
- **`wordWrap` and `lineHeight` documented** — Added to the `StickerElement` schema table in README with descriptions and examples.
- **Core Features list updated** — Added Automatic Word Wrap bullet.

### ♻️ Internal Improvements
- `drawText()` refactored — Extracted word-wrap logic into a dedicated private `wrapText()` helper for clarity and testability.
- `exportToZPL()` refactored — DPI-derived values now computed from a single `dpi` variable; no more magic numbers in the function body.
- Improved JSDoc on all public methods.

### ✅ Backward Compatibility
All existing public API signatures are **unchanged**. This is a fully backward-compatible patch release:
- `renderToCanvas()`, `renderToDataURL()`, `exportImages()`, `exportToPDF()` — same signatures, same return types.
- `exportToZPL()` — the new `options` parameter is **optional**. Existing calls without it default to `203 DPI`, identical behaviour to v1.1.7.
- `wordWrap` and `lineHeight` are **optional** style properties — existing layouts without them behave as if `wordWrap: true, lineHeight: 1.25`.
- No removed exports, no renamed methods, no new required parameters.

---

## [1.1.7] — 2026-05-19

### Changed
- Version bump. ZPL and PDF enhancements (internal improvements to ZPL generation and PDF export reliability).

---

## [1.1.6] — 2026-03-16

### Changed
- Package version bump aligned with tooling and example updates.

---

## [1.1.5] — 2026-02-24

### Changed
- Version bump. Internal updates.

---

## [1.1.4] — 2026-02-16

### Changed
- Version bump aligned with Svelte and Vue demo additions.

---

## [1.1.3] — 2026-02-09

### Changed
- README updates and improvements.

---

## [1.1.2] — 2026-02-03

### Changed
- README improvements and export format corrections for the React demo integration.

---

## [1.1.1] — 2026-01-27

### Changed
- Version bump. Svelte demo added to examples. README updates.

---

## [1.1.0] — 2026-01-19

### Added
- Sample data editor panel support (data-driven preview).
- Drag-and-drop stability improvements in the designer.

### Changed
- README restructured with clearer Quick Start guide.

---

## [1.0.9] — 2026-01-09

### Changed
- Internal package restructure. Updated export paths and file names.

---

## [1.0.8] — 2026-01-08

### Added
- `qrlayout-ui` package introduced as a companion designer package.
- Initial `StickerPrinter` class with `renderToCanvas`, `renderToDataURL`, `exportImages`, `exportToPDF`, `exportToZPL`.
- Multi-variable QR support via `qrSeparator`.
- Background image and background color support on `StickerLayout`.

### Changed
- README expanded with API reference tables.

---

## [1.0.0] — 2025-12-31

### Added
- Initial release.
- `StickerLayout` and `StickerElement` schema types.
- Canvas rendering engine (`renderToCanvas`).
- PDF export via optional `jspdf` dependency (`exportToPDF`).
- ZPL export for Zebra thermal printers (`exportToZPL`).
- `{{variable}}` template placeholder system (`parseContent`).
- Unit support: `mm`, `cm`, `in`, `px`.
