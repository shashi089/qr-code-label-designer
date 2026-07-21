# Roadmap

## Status

| Phase | Title | Status |
|-------|-------|--------|
| 1.1 | Core Engine Hardening | ✅ Done |
| 1.2 | Designer UX | ✅ Done |
| 1.3 | Developer Experience | ✅ Done |
| 2 | Feature Completeness | 🔄 In Progress |
| 3 | Desktop Application | 🔲 Pending |
| 4 | Ecosystem & Community | 🔲 Pending |

---

## Package Structure

```
qr-code-label-designer/
├── packages/
│   ├── qrlayout-core      → headless engine (render, PDF, ZPL, PNG)
│   ├── qrlayout-ui        → drag-and-drop designer (vanilla TS)
│   ├── react-qr-label     → React wrapper
│   ├── vue-qr-label       → Vue 3 wrapper
│   └── svelte-qr-label    → Svelte 5 wrapper
└── examples/
    ├── react-demo
    ├── react-qr-label-demo
    ├── angular-demo
    ├── vue-demo
    ├── svelte-demo
    └── next-demo
```

---

## Phase 1 — Foundation ✅

### 1.1 — Core Engine Hardening

- [x] Unit test suite — 54 tests across `parse`, `units`, `zpl`
- [x] `parseContent` and `toPx`/`toDots` extracted into `src/utils/`
- [x] `fontSize` pt/px inconsistency fixed across all three renderers
- [x] GitHub Actions CI (install → build → type-check → test)
- [x] `CHANGELOG.md` created

### 1.2 — Designer UX

- [x] Undo / Redo (`Ctrl+Z` / `Ctrl+Y`) — 20-step snapshot stack
- [x] Keyboard shortcuts — `Delete`, `Arrow`, `Shift+Arrow`, `Ctrl+D`, `Escape`
- [x] Label size presets dropdown
- [x] Snap-to-grid with visual dot overlay
- [x] Element alignment toolbar (6 directions)

### 1.3 — Developer Experience

- [x] `vue-qr-label` — Vue 3 Composition API wrapper
- [x] `svelte-qr-label` — Svelte 5 rune-based wrapper
- [x] `CONTRIBUTING.md`

---

## Phase 2 — Feature Completeness 🔲

### 2.1 — Barcode Element ✅ Done

- [x] `type: "barcode"` in `StickerElement` with `BarcodeFormat` — `CODE128`, `EAN13`, `UPCA`, `CODE39`, `ITF14`
- [x] Canvas render via `jsbarcode`
- [x] PDF export via canvas → `doc.addImage()`
- [x] ZPL export via native commands (`^BCN`, `^BEN`, etc.)
- [x] Designer UI — "Add Barcode" button + format selector

### 2.2 — Image / Logo Element

- [ ] `type: "image"` — static URL or `{{dynamicField}}`
- [ ] Canvas: `ctx.drawImage()`
- [ ] PDF: `doc.addImage()`
- [ ] ZPL: `^GF` (Graphic Field)
- [ ] Designer UI — upload or paste URL

### 2.3 — Shape / Border Elements

- [ ] `type: "rect"` and `type: "line"`
- [ ] Canvas, PDF, ZPL (`^GB`) support

### 2.4 — CSV / Excel Data Import

- [ ] CSV via `papaparse`, Excel via `xlsx`
- [ ] Upload → preview rows → map columns to `{{variables}}` → export

### 2.5 — ZPL Live Preview

- [ ] Labelary API integration in the designer
- [ ] Fallback to canvas preview when offline

### 2.6 — Multi-label Per Page

- [ ] `SheetLayout` type — rows × columns, margin, gap
- [ ] PDF and PNG sheet export
- [ ] Common presets (Avery 5160, 5163)

---

## Phase 3 — Desktop Application 🔲

Separate repo. Uses `qrlayout-core` and `qrlayout-ui` as npm dependencies.

**Stack: Tauri + React** (vs Electron — smaller bundle, native file system access)

- [ ] Excel / CSV file open (native dialog via Tauri)
- [ ] Embedded layout designer with column names as entity fields
- [ ] Local layout library (JSON files in app data folder)
- [ ] Print panel — filter rows, export PDF / PNG / ZPL
- [ ] Direct Zebra printer connection by IP or USB

---

## Phase 4 — Ecosystem 🔲

- [ ] Docs site (`docs.qrlayout.dev`) — VitePress
- [ ] Template gallery — 20+ curated layouts in `/templates/`, PR submissions
- [ ] CLI — `npx qrlayout generate --layout label.json --data records.csv --format zpl`
- [ ] Publish `vue-qr-label`, `svelte-qr-label`, `angular-qr-label` packages

| Package | Status |
|---------|--------|
| `react-qr-label` | ✅ Published |
| `vue-qr-label` | Package ready — publish pending |
| `svelte-qr-label` | Package ready — publish pending |
| `angular-qr-label` | Demo only |
| `qrlayout-cli` | Not started |

---

*Contributions welcome — see `CONTRIBUTING.md` for setup.*
