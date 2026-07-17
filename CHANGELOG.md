# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- `packages/vue-qr-label` — Vue 3 Composition API wrapper
  - `<QRLabelDesigner :initial-layout :entity-schemas @save />` component
  - Reactive re-mount when `initialLayout` or `entitySchemas` change; callback updates without re-creating
- `packages/svelte-qr-label` — Svelte 5 rune-based wrapper
  - `<QRLabelDesigner {entitySchemas} onsave={fn} />` component
  - Uses `$effect` for reactive lifecycle; cleanup on unmount
- `CONTRIBUTING.md`
- Root `package.json` scripts: `build:vue`, `build:svelte`, `build:all`, `publish:vue`, `publish:svelte`
- **Undo / Redo** (`Ctrl+Z` / `Ctrl+Y`) — 20-step snapshot stack; property inputs use focus/blur snapshot pattern
- **Keyboard shortcuts** — `Delete`/`Backspace`, Arrow nudge, `Shift+Arrow` ×5, `Ctrl+D` duplicate, `Escape` deselect
- **Label size presets** dropdown (7 common mm and inch sizes)
- **Snap-to-grid** — 1-unit grid with dot overlay that scales with canvas zoom
- **Element alignment toolbar** — 6 directions; all actions recorded in undo stack
- `parseContent` and `toPx` / `toDots` extracted into `src/utils/` and exported from the package
- Vitest test suite for `qrlayout-core` — 54 tests covering `parseContent`, unit conversion, and ZPL generation
- `test` and `test:watch` scripts in `qrlayout-core`
- GitHub Actions CI (`.github/workflows/ci.yml`) — type-check and test on every push and PR
- **Barcode element** (`type: "barcode"`) — `CODE128`, `EAN13`, `UPCA`, `CODE39`, `ITF14` via `jsbarcode`; canvas, PDF, ZPL, and designer UI all supported

### Changed
- `pdf.ts` imports `parseContent` from shared utils instead of its own copy
- Canvas renderer converts `fontSize` pt → px via `pt × (96/72)` — all three renderers now consistently treat `fontSize` as points
- Removed orphaned `packages/react-qr-label-designer` (stale build artefacts, no source)

---

## qrlayout-core

### [1.1.8] — 2025-06

#### Fixed
- ZPL: special characters `^`, `~`, `_` in field data now correctly escape using `^FH` + hex encoding, preventing broken ZPL streams

#### Added
- ZPL: `qrErrorCorrection` option (`L` | `M` | `Q` | `H`) on `exportToZPL`
- PDF: background colour and background image rendering

---

### [1.1.7] — 2025-05

#### Added
- `exportToPDF` — multi-page PDF via optional `jspdf` peer dependency
- `exportImages` — batch data-URL generation for list previews

---

### [1.1.0] — 2025-04

#### Added
- Initial public release of `qrlayout-core`
- `StickerPrinter` with `renderToCanvas`, `renderToDataURL`, `exportToPNG`, `exportToZPL`
- `{{variable}}` template substitution via `parseContent`
- Unit conversion: `mm`, `cm`, `in`, `px` → canvas pixels and ZPL dots
- `generateQR` with in-memory cache

---

## qrlayout-ui

### [1.1.1] — 2025-06

#### Fixed
- Mobile sidebar collapse layout

#### Added
- Dark mode toggle

---

### [1.1.0] — 2025-05

#### Added
- Initial public release of `qrlayout-ui`
- Drag-and-drop label designer (vanilla TypeScript, no framework required)
- Live preview with sample data
- Entity schema field suggestion pills
- `onSave` callback returns `StickerLayout` JSON

---

## react-qr-label

### [0.1.1] — 2025-06

#### Fixed
- Peer dependency range updated to `react >= 18.0.0`

---

### [0.1.0] — 2025-05

#### Added
- Initial public release of `react-qr-label`
- `QRLabelDesigner` React component wrapping `qrlayout-ui`
- `exportToPDF` re-export helper

---

[Unreleased]: https://github.com/shashi089/qr-code-label-designer/compare/HEAD
