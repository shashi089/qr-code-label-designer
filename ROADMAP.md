# QR Code Layout Generate Tool — Roadmap

> **Vision:** The open-source standard for QR label generation — usable as an npm library today, and the engine powering a full desktop print application tomorrow.

---

## Progress Overview

| Phase | Title | Status |
|-------|-------|--------|
| **1.1** | Core Engine Hardening | ✅ Complete |
| **1.2** | Designer UX — Must-Fix Issues | ✅ Complete |
| **1.3** | Developer Experience Improvements | ✅ Complete |
| **2** | Feature Completeness | 🔲 Pending |
| **3** | Desktop Application | 🔲 Pending |
| **4** | Ecosystem & Community | 🔲 Pending |

---

## Understanding the Template Concept

Before the roadmap, here is a plain-English explanation of how the system works.

### What is a Template / Layout?

A **template** (called `StickerLayout` in the code) is a JSON object that describes **how a label looks** — its size, and what elements are on it (text, QR code, etc.).

**The key idea:** element content uses `{{variableName}}` placeholders instead of real values.

```
┌─────────────────────────────────────┐
│  [100mm × 60mm Label Template]      │
│                                     │
│  Name:  {{ fullName }}              │ ← placeholder, not real data
│  ID:    {{ employeeId }}            │
│                                     │
│  ┌──────┐                           │
│  │  QR  │  ← encodes {{ employeeId }}
│  └──────┘                           │
└─────────────────────────────────────┘
```

### How Data Merges Into the Template

When you want to print, you pass **bulk records** (an array of data objects). The system fills in every `{{placeholder}}` from the matching field in each record and produces one output per record.

```
Template:  "Name: {{ fullName }}  ID: {{ employeeId }}"

Record 1:  { fullName: "Ravi Kumar",   employeeId: "EMP-001" }
Record 2:  { fullName: "Anita Sharma", employeeId: "EMP-002" }
Record 3:  { fullName: "John Doe",     employeeId: "EMP-003" }

Output:
  Label 1 → "Name: Ravi Kumar    ID: EMP-001"  → PNG / PDF page / ZPL command
  Label 2 → "Name: Anita Sharma  ID: EMP-002"  → PNG / PDF page / ZPL command
  Label 3 → "Name: John Doe      ID: EMP-003"  → PNG / PDF page / ZPL command
```

### Full Workflow (Current npm Library)

```
  DESIGN ONCE                 SAVE                    PRINT MANY
──────────────           ──────────────           ──────────────────────
 Open Designer    →    onSave(layout)    →    printer.exportToZPL(
 Drag elements         Store as JSON           layout,          ← same template
 Add {{fields}}        in DB or file           [rec1, rec2, rec3] ← any records
 Set sizes/fonts                               )
 Preview with                                  // returns one ZPL string per record
 sample data
```

### Future Desktop App (Next Repo)

```
  OPEN EXCEL FILE          DESIGN LAYOUT         PRINT / EXPORT
─────────────────      ─────────────────      ────────────────────
 Upload .xlsx      →   Columns become    →   Select rows
 See rows/columns      available fields       Click Print
                        e.g. col "Name"        → ZPL to thermal printer
                        becomes {{Name}}       → PDF download
                                               → PNG batch
```

The same `qrlayout-core` engine that powers the npm library **will power the desktop app** — the desktop app is just a new frontend on top of the same rendering and export pipeline.

---

## Current Package Architecture

```
qr-code-label-designer/ (this repo)
├── packages/
│   ├── qrlayout-core      → headless engine (render, PDF, ZPL, PNG)
│   ├── qrlayout-ui        → visual drag-and-drop designer (vanilla TS)
│   ├── react-qr-label     → React wrapper component
│   ├── vue-qr-label       → Vue 3 wrapper component
│   └── svelte-qr-label    → Svelte 5 wrapper component
└── examples/
    ├── react-demo
    ├── react-qr-label-demo
    ├── angular-demo
    ├── vue-demo
    ├── svelte-demo
    └── next-demo
```

---

## Phase 1 — Solid Foundation *(v1.2 — Current focus)*

**Goal:** Make the existing packages reliable, well-tested, and easy to adopt. Everything in Phase 2 and beyond depends on this being stable.

---

### 1.1 — Core Engine Hardening ✅ Complete

- [x] **Unit test suite for `qrlayout-core`**
  - 54 tests across 3 files using `vitest`
  - `parse.test.ts` — 15 tests: `parseContent()` single/multi var, missing key, whitespace trim, zero/false values, separator injection
  - `units.test.ts` — 16 tests: `toPx()` and `toDots()` for all 4 units at 203 and 300 DPI
  - `zpl.test.ts` — 23 tests: ZPL structure, dot calculations, text/QR commands, `^FH` escaping, DPI scaling, multi-record, unit equivalence

- [x] **`parseContent` and `toPx`/`toDots` extracted into `src/utils/`**
  - `src/utils/parse.ts` — shared by both `StickerPrinter` and `pdf.ts` (was duplicated)
  - `src/utils/units.ts` — pure functions, exported from the package

- [x] **`fontSize` pt/px inconsistency fixed**
  - Canvas renderer now converts pt → px using `fontSize * (96/72)` — matches PDF and ZPL output scale
  - All three renderers (Canvas PNG, PDF, ZPL) now consistently treat `fontSize` as **points (pt)**

- [x] **TSDoc comments on all public APIs**
  - All interfaces and types in `schema.ts` fully documented
  - `StickerPrinter` methods already had TSDoc — retained and improved

- [x] **`CHANGELOG.md`** created at repo root with full version history

- [x] **GitHub Actions CI** (`.github/workflows/ci.yml`)
  - Runs on every push and PR to `main`
  - Steps: install → build core → type-check ui + react-qr-label → run tests

- [x] **Removed orphaned `packages/react-qr-label-designer`** folder (no source code; only stale build artefacts)

- [x] **`test` / `test:watch` scripts** added to `packages/core/package.json`

- [x] **`test:core` script** added to root `package.json`

---

### 1.2 — Designer UX — Must-Fix Issues ✅ Complete

- [x] **Undo / Redo** (`Ctrl+Z` / `Ctrl+Y`)
  - 20-step snapshot stack; undo/redo buttons in header (disabled when stack is empty)
  - Covers: add, delete, drag, resize, duplicate, nudge, align, text-align, style changes
  - Property inputs use focus/blur pattern: snapshot captured when field is focused, pushed on blur

- [x] **Keyboard shortcuts** (blocked when an `<input>` / `<textarea>` / `<select>` has focus)
  - `Delete` / `Backspace` → remove selected element
  - `Arrow keys` → nudge selected element by 1 unit
  - `Shift + Arrow` → nudge by 5 units
  - `Ctrl + D` → duplicate element (offset by 5 units)
  - `Escape` → deselect
  - `Ctrl+Z` / `Ctrl+Y` (Ctrl+Shift+Z) → undo / redo
  - Shortcut hint bar displayed in the canvas toolbar

- [x] **Label size presets** — "Size Preset" dropdown in Layout Settings:
  - Badge — 100 × 60 mm
  - EU Standard — 100 × 50 mm
  - Mini Tag — 50 × 25 mm
  - Brother QL — 62 × 29 mm
  - Shipping Label — 4" × 6"
  - Asset Tag — 3" × 2"
  - Small Label — 2" × 1"
  - Resets to "Custom" after applying; updates width/height/unit inputs

- [x] **Snap-to-grid** — toggle checkbox in canvas toolbar
  - Snaps drag and resize to 1-unit grid
  - Visual dot grid overlay on canvas (indigo dots, CSS `::before` pseudo-element)
  - Grid spacing scales with `pxPerUnit` (responsive to canvas zoom)

- [x] **Element alignment toolbar** — appears in the right sidebar when any element is selected
  - 6 icon buttons: Align Left, Center-H, Align Right | Align Top, Center-V, Align Bottom
  - Each action is recorded in the undo stack

---

### 1.3 — Developer Experience Improvements ✅ Complete

- [x] **`vue-qr-label`** — Vue 3 Composition API wrapper (`packages/vue-qr-label`)
  - `<QRLabelDesigner :initial-layout="layout" :entity-schemas="schemas" @save="onSave" />`
  - Destroys and re-creates the designer when `initialLayout` or `entitySchemas` change
  - Updates `onSave` callback without re-creating (avoids canvas flicker)
  - Builds with Vite + `@vitejs/plugin-vue` + `vite-plugin-dts`
  - Re-exports `StickerPrinter`, `StickerLayout`, `StickerElement`, `EntitySchema`

- [x] **`svelte-qr-label`** — Svelte 5 rune-based wrapper (`packages/svelte-qr-label`)
  - `<QRLabelDesigner {entitySchemas} onsave={handleSave} />`
  - Uses `$effect` for reactive re-mounting on prop changes; cleanup returned from `$effect` handles unmount
  - Builds with Vite + `@sveltejs/vite-plugin-svelte` + `vite-plugin-dts`
  - Re-exports same types as the Vue wrapper

- [x] **`CONTRIBUTING.md`** — at repo root
  - Local setup commands
  - Which package to edit for each change type
  - PR checklist (tests, TypeScript, CHANGELOG, scope)
  - Coding conventions (fontSize in pt, undo-safe mutations, no re-implementing utils)

---

## Phase 2 — Feature Completeness *(v1.3 — 3 months out)* 🔲 Pending

**Goal:** Close the biggest feature gaps that block real-world production use.

---

### 2.1 — Barcode Element *(Highest Priority Feature)*

QR codes are consumer-facing. Barcodes are industrial. Without barcode support, the tool cannot target logistics, retail, or manufacturing seriously.

- [ ] **Add `type: "barcode"` to `StickerElement`**

```typescript
type BarcodeFormat =
  | "CODE128"   // universal logistics (GS1, shipping)
  | "EAN13"     // retail product labels
  | "UPCA"      // US retail
  | "CODE39"    // legacy MRO / industrial
  | "ITF14"     // carton / pallet shipping
  | "DATAMATRIX"; // pharma / small parts
```

- [ ] Canvas render: use `jsbarcode` library (4KB, zero dependencies)
- [ ] PDF export: render barcode to canvas data URL → `doc.addImage()`
- [ ] ZPL export: native ZPL barcode commands (`^BCN` for Code 128, `^BEN` for EAN-13)
- [ ] Designer UI: "Add Barcode" button + format selector in property panel

---

### 2.2 — Image / Logo Element

- [ ] **Add `type: "image"` to `StickerElement`**
  - Static URL or data URL (logo)
  - Dynamic: `{{productPhoto}}` from data
- [ ] Canvas: `ctx.drawImage()` — already supported by current pipeline
- [ ] PDF: `doc.addImage()` — already supported
- [ ] ZPL: Convert image to ZPL bitmap using `^GF` (Graphic Field) command
- [ ] Designer UI: Upload button or paste URL in property panel

---

### 2.3 — Shape / Border Elements

- [ ] **Add `type: "rect"` and `type: "line"` to `StickerElement`**
- [ ] Canvas: `ctx.strokeRect()`, `ctx.beginPath()`, `ctx.lineTo()`
- [ ] PDF: `doc.rect()`, `doc.line()`
- [ ] ZPL: `^GB` (Graphic Box) — native ZPL command

---

### 2.4 — CSV / Excel Data Import

- [ ] **CSV import:** use `papaparse` (5KB, zero deps)
- [ ] **Excel import:** use `xlsx` (SheetJS)
- [ ] **UI flow:** upload → preview 5 rows → map columns to `{{variables}}` → export all

> This is the same workflow the desktop app will use — implementing it here first means the core is already built when you start the desktop repo.

---

### 2.5 — ZPL Live Preview Panel

- [ ] Add "Printer View" toggle in the designer
- [ ] Send current ZPL string to Labelary API and display the returned PNG
- [ ] Fallback to canvas preview when offline or API unavailable

---

### 2.6 — Multi-label Per Page (Sheet Layout)

- [ ] **New `SheetLayout` type:** rows × columns, margin, gap
- [ ] PDF export: renders labels in a grid (Avery 5160 = 3×10)
- [ ] PNG export: renders the entire sheet as one image
- [ ] Common presets: Avery 5160, Avery 5163, custom

---

## Phase 3 — Desktop Application *(Separate Repo — 6+ months)* 🔲 Pending

**Goal:** A standalone cross-platform desktop app built on top of the npm packages from this repo.

> This is a **new repository**. The packages in this repo (`qrlayout-core`, `qrlayout-ui`) become npm dependencies of the desktop app — they are not duplicated.

---

### 3.1 — Technology Stack

**Recommended: Tauri + React**

| Option | Pros | Cons |
|--------|------|------|
| **Tauri + React** | Tiny bundle (~10MB), fast Rust backend, best file system access | Rust required for native features |
| Electron + React | Full web tech, easy reuse | Large bundle (~150MB) |

---

### 3.2 — Desktop App Core Features

- [ ] **Excel / CSV Data Source**
  - File open dialog (native OS via Tauri)
  - Parse `.xlsx` with SheetJS, `.csv` with PapaParse
  - Show data in sortable, filterable table
  - Column headers auto-map to `{{variableName}}` in the designer

- [ ] **Layout Designer (Embedded)**
  - Embed `qrlayout-ui` inside the Tauri window
  - Column names from Excel passed as `EntitySchema.fields`
  - Save layouts to local app data folder (JSON files)
  - Built-in template library (10–15 starter templates)

- [ ] **Local Layout Library**
  - Layouts stored as JSON in user's local app data directory
  - Import/export layout JSON files for sharing between users

- [ ] **Print Panel**
  - Select layout + loaded data
  - Filter/sort rows before printing
  - Export: PDF, PNG batch, ZPL file, or direct printer send

- [ ] **Direct Printer Connection** *(desktop-only feature)*
  - Connect to Zebra thermal printer by IP address or USB
  - Send ZPL directly from the app — no file download step
  - Test connection with a test label

---

### 3.3 — Desktop App Nice-to-Have

- [ ] Print history — log of every print job (layout, record count, timestamp)
- [ ] Template sharing — export/import layout JSON via email or file
- [ ] Auto-update — Tauri's built-in updater
- [ ] Offline-first — everything works without internet
- [ ] Multiple Excel files open — tab-based data source switcher

---

## Phase 4 — Ecosystem & Community *(Ongoing)* 🔲 Pending

**Goal:** Make this the default answer when a developer Googles "how to print labels from a web app."

---

### 4.1 — Documentation Site

- [ ] Build `docs.qrlayout.dev` using VitePress (free Netlify hosting)
- [ ] Key pages: "How to print labels from React", "Generate ZPL from JavaScript", API reference, Template gallery, Migration guide from Bartender / NiceLabel

### 4.2 — Template Gallery

- [ ] 20+ curated label templates in `/templates/` folder (JSON + screenshot)
- [ ] Community can submit templates via Pull Request
- [ ] Desktop app ships these built-in

### 4.3 — CLI Tool (`qrlayout-cli`)

- [ ] `npx qrlayout generate --layout label.json --data records.csv --format zpl --out ./output/`
- [ ] Enables CI/CD label pipelines and ERP webhook triggers

### 4.4 — Framework Wrappers (Publish All)

| Package | Status |
|---------|--------|
| `react-qr-label` | ✅ Published |
| `vue-qr-label` | ✅ Package created (Phase 1.3) — publish when ready |
| `svelte-qr-label` | ✅ Package created (Phase 1.3) — publish when ready |
| `angular-qr-label` | 🔲 Demo only — publish as package |
| `qrlayout-cli` | 🔲 Missing — create in Phase 4.3 |

---

## Roadmap Summary

| Phase | What | Status | Key Outcome |
|-------|------|--------|-------------|
| **1.1** | Tests, utils refactor, TSDoc, CI, CHANGELOG, fontSize fix | ✅ Done | Stable, trustworthy library |
| **1.2** | Undo/redo, keyboard shortcuts, label presets, snap-to-grid, alignment | ✅ Done | Designer users can work confidently |
| **1.3** | CONTRIBUTING.md, Vue/Svelte wrappers | ✅ Done | Lower onboarding friction |
| **2** | Barcode, image element, shapes, CSV/Excel import, ZPL preview, sheet layout | 🔲 Planned | Production-ready for logistics/retail/HR |
| **3** | Desktop app (Tauri) — Excel source, local layouts, direct ZPL print | 🔲 Planned | Standalone tool for non-developers |
| **4** | Docs site, template gallery, CLI, all framework wrappers | 🔲 Ongoing | Community and ecosystem |

---

## The Single Highest-Leverage Item Right Now

**Add barcode support (`CODE128` first).**

Every warehouse, ERP, retail POS, and logistics system expects linear barcodes. Adding `CODE128` alone would double the addressable use cases with about a week of implementation work. Every other improvement is additive; this one is multiplicative.

---

*Maintained by Shashidhar Naik — contributions welcome. See `CONTRIBUTING.md` for setup instructions.*
