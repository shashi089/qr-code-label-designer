# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added (Phase 1.3 — Developer Experience)
- `packages/vue-qr-label` — new Vue 3 Composition API wrapper package
  - `<QRLabelDesigner :initial-layout :entity-schemas @save />` component
  - Reactive re-mount when `initialLayout` or `entitySchemas` change; callback updates without re-creating
  - Vite library build with `@vitejs/plugin-vue` + `vite-plugin-dts`
- `packages/svelte-qr-label` — new Svelte 5 rune-based wrapper package
  - `<QRLabelDesigner {entitySchemas} onsave={fn} />` component
  - Uses `$effect` for reactive lifecycle; cleanup returned from effect handles unmount
  - Vite library build with `@sveltejs/vite-plugin-svelte` + `vite-plugin-dts`
- `CONTRIBUTING.md` — local setup, package map, PR checklist, coding conventions
- Root `package.json` scripts: `build:vue`, `build:svelte`, `build:all`, `publish:vue`, `publish:svelte`

### Added (Phase 1.2 — Designer UX)
- **Undo / Redo** (`Ctrl+Z` / `Ctrl+Y`) — 20-step snapshot stack; undo/redo buttons in header; property inputs use focus/blur snapshot pattern
- **Keyboard shortcuts** — `Delete`/`Backspace` deletes element, Arrow nudges 1 unit, `Shift+Arrow` nudges 5 units, `Ctrl+D` duplicates, `Escape` deselects
- **Label size presets** dropdown in Layout Settings (7 common mm and inch sizes)
- **Snap-to-grid** toggle in canvas toolbar — snaps drag and resize to 1-unit grid; indigo dot grid overlay scales with canvas
- **Element alignment toolbar** in property panel — 6 icon buttons: Left / Center-H / Right | Top / Center-V / Bottom; all actions are recorded in undo stack

### Added (Phase 1.1 — Core Engine Hardening)
- `parseContent` and `toPx` / `toDots` extracted into `src/utils/` — now exported from the package for reuse
- Vitest test suite for `qrlayout-core` — 54 tests covering `parseContent`, unit conversion, and ZPL generation
- `test` and `test:watch` npm scripts in `qrlayout-core`
- Full TSDoc on all public interfaces and types in `schema.ts`
- GitHub Actions CI workflow (`.github/workflows/ci.yml`) — type-checks and runs tests on every push and PR

### Changed
- `pdf.ts` now imports `parseContent` from the shared utils module instead of defining its own copy
- Removed orphaned `packages/react-qr-label-designer` folder (no source code; was only stale build artefacts)
- Canvas renderer now converts `fontSize` pt → px using `pt × (96/72)` — all three renderers (PNG, PDF, ZPL) now consistently treat `fontSize` as points

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

[Unreleased]: https://github.com/shashi089/qr-code-layout-generate-tool/compare/HEAD
