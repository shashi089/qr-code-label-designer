# QR Code Layout Generate Tool — Roadmap

> **Vision:** The open-source standard for QR label generation — usable as an npm library today, and the engine powering a full desktop print application tomorrow.

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
qr-code-layout-generate-tool/ (this repo)
├── packages/
│   ├── qrlayout-core      → headless engine (render, PDF, ZPL, PNG)
│   ├── qrlayout-ui        → visual drag-and-drop designer (vanilla TS)
│   └── react-qr-label     → React wrapper component
└── examples/
    ├── react-demo
    ├── angular-demo
    ├── vue-demo
    ├── svelte-demo
    └── next-demo
```

---

## Phase 1 — Solid Foundation  *(v1.2 — Current focus)*

**Goal:** Make the existing packages reliable, well-tested, and easy to adopt. Everything in Phase 2 and beyond depends on this being stable.

---

### 1.1 — Core Engine Hardening

- [ ] **Unit test suite for `qrlayout-core`**
  - Test `parseContent()` with single var, multi-var, missing var, nested `{{}}`, empty string
  - Test `toPx()` unit conversion for all 4 units (mm, cm, in, px)
  - Test `exportToZPL()` — verify `^FO`, `^A0N`, `^BQN` commands for both element types
  - Test `exportToPDF()` — verify page count matches record count
  - Tool: `vitest` (zero-config, works with existing Vite setup)

- [ ] **Fix `react-qr-label-designer` package** — it exists as a folder but is not published to npm. Either publish it or remove the folder to avoid confusion.

- [ ] **TSDoc comments on all public APIs**
  - `StickerPrinter` methods: `renderToDataURL`, `exportToPNG`, `exportToZPL`, `exportToPDF`
  - `QRLayoutDesigner` constructor options
  - All exported interfaces in `schema.ts`
  - Benefit: inline autocomplete docs in VS Code, no need to open README

- [ ] **`CHANGELOG.md`** — Start tracking changes per version. Follow Keep a Changelog format.

- [ ] **GitHub Actions CI** — Run `tsc --noEmit` + tests on every PR to `main`. Add badge to README.

---

### 1.2 — Designer UX — Must-Fix Issues

These are the issues that cause users to abandon the designer in the first 5 minutes.

- [ ] **Undo / Redo** (`Ctrl+Z` / `Ctrl+Y`)
  - Maintain a command history stack (20 steps)
  - Each move, resize, add, delete, style-change is one command
  - Without this, users are afraid to experiment — adoption drops

- [ ] **Keyboard shortcuts**
  - `Delete` / `Backspace` → remove selected element
  - `Arrow keys` → nudge selected element by 1 unit
  - `Shift + Arrow` → nudge by 5 units
  - `Ctrl + D` → duplicate element
  - `Escape` → deselect

- [ ] **Label size presets** — "New Label" dialog with common sizes:
  - 4" × 6" (standard shipping label)
  - 2" × 1" (small product / jewelry)
  - 3" × 2" (medium asset tag)
  - 100mm × 50mm (EU standard)
  - Custom (manual width/height input)

- [ ] **Snap-to-grid** — optional 1mm grid with visual dots, elements snap on drag

- [ ] **Element alignment toolbar** — when an element is selected show:
  - Align left / center / right (relative to label)
  - Align top / middle / bottom
  - This is the single most-requested feature in every label design tool

---

### 1.3 — Developer Experience Improvements

- [ ] **`create-qrlayout-app` scaffolder**
  ```bash
  npx create-qrlayout-app my-label-app --framework react
  ```
  Generates a project with the designer + export buttons pre-wired. Lowest-friction onboarding.

- [ ] **Vue and Svelte wrapper packages** (currently only React has one)
  - `vue-qr-label` — Vue 3 Composition API component
  - `svelte-qr-label` — Svelte 5 rune-based component
  - Convert the existing demo apps into proper published packages

- [ ] **`CONTRIBUTING.md`** — local setup steps, PR checklist, coding conventions

---

## Phase 2 — Feature Completeness  *(v1.3 — 3 months out)*

**Goal:** Close the biggest feature gaps that block real-world production use.

---

### 2.1 — Barcode Element (Highest Priority Feature)

QR codes are consumer-facing. Barcodes are industrial. Without barcode support, the tool cannot target logistics, retail, or manufacturing seriously.

**Add `type: "barcode"` to `StickerElement`:**

```typescript
// New element type
interface StickerElement {
  type: "text" | "qr" | "barcode";  // add "barcode"
  barcodeFormat?: BarcodeFormat;    // new field
  // ...existing fields
}

type BarcodeFormat =
  | "CODE128"   // universal logistics (GS1, shipping)
  | "EAN13"     // retail product labels
  | "UPCA"      // US retail
  | "CODE39"    // legacy MRO / industrial
  | "ITF14"     // carton / pallet shipping
  | "DATAMATRIX"; // pharma / small parts
```

**Implementation plan:**
- Canvas render: use `jsbarcode` library (4KB, zero dependencies)
- PDF export: render barcode to canvas data URL → `doc.addImage()`
- ZPL export: native ZPL barcode commands (`^BCN` for Code 128, `^BEN` for EAN-13)
- Designer UI: "Add Barcode" button + format selector in property panel

---

### 2.2 — Image / Logo Element

Enables company logos, product photos, and compliance symbols on labels.

**Add `type: "image"` to `StickerElement`:**

```typescript
interface StickerElement {
  type: "text" | "qr" | "barcode" | "image";  // add "image"
  imageSrc?: string;   // static URL or data URL (logo)
  imageVar?: string;   // dynamic: "{{productPhoto}}" from data
}
```

- Canvas: `ctx.drawImage()` — already supported by current rendering pipeline
- PDF: `doc.addImage()` — already supported
- ZPL: Convert image to ZPL bitmap using `^GF` (Graphic Field) command
- Designer UI: Upload button or paste URL in property panel

---

### 2.3 — Shape / Border Elements

Labels without borders look unfinished. This is a small effort with big visual impact.

**Add `type: "rect"` and `type: "line"` to `StickerElement`:**

- Canvas: `ctx.strokeRect()`, `ctx.beginPath()`, `ctx.lineTo()`
- PDF: `doc.rect()`, `doc.line()`
- ZPL: `^GB` (Graphic Box) command — already a native ZPL command

---

### 2.4 — CSV / Excel Data Import

Currently users must write code to pass data arrays. This Phase adds file-based data input directly in the designer preview and in a new batch-export panel.

- **CSV import:** use `papaparse` (5KB, zero deps) — parse `.csv` → array of records
- **Excel import:** use `xlsx` (SheetJS) — parse `.xlsx` / `.xls` → array of records
- **UI flow:**
  1. Upload file button in export panel
  2. Preview first 5 rows in a table
  3. Map column names to `{{variable}}` fields (auto-match by name)
  4. Click "Export All" → batch PDF / PNG / ZPL

This is the **exact same workflow the desktop app will use** — implementing it here first means the core is already built when you start the desktop repo.

---

### 2.5 — ZPL Live Preview Panel

The current workflow requires users to send ZPL to a physical printer to verify output. This adds instant browser-side preview using the free Labelary API.

- Add a "Printer View" toggle in the designer
- When toggled, send current ZPL string to `api.labelary.com` and display the returned PNG
- This closes the "what will it actually look like on the printer?" anxiety
- Falls back to canvas preview when offline or API is unavailable

---

### 2.6 — Multi-label Per Page (Sheet Layout)

For Avery-style label sheets (e.g., 3-across × 10-down = 30 labels per page).

```typescript
interface SheetLayout {
  pageWidth: number;
  pageHeight: number;
  unit: Unit;
  columns: number;
  rows: number;
  marginTop: number;
  marginLeft: number;
  gapH: number;
  gapV: number;
  labelLayout: StickerLayout;  // the per-label template
}
```

- PDF export: renders labels in a grid, packs multiple records per page
- PNG export: renders the entire sheet as one image
- Common presets: Avery 5160 (3×10), Avery 5163 (2×5), custom

---

## Phase 3 — Desktop Application  *(Separate Repo — 6+ months)*

**Goal:** A standalone cross-platform desktop app built on top of the npm packages from this repo.

> This is a new repository. The packages in this repo (`qrlayout-core`, `qrlayout-ui`) become the npm dependencies of the desktop app — they are not duplicated.

---

### 3.1 — Technology Stack Decision

| Option | Pros | Cons |
|--------|------|------|
| **Electron + React** | Full web tech, easy to reuse existing UI package | Large bundle size (~150MB) |
| **Tauri + React** | Tiny bundle (~10MB), Rust backend is fast | Rust learning curve for contributors |
| **Tauri** (Recommended) | Best performance, best file system access for Excel/CSV, smallest download | — |

**Recommended:** Tauri for the desktop shell + React UI that reuses `qrlayout-ui` and `qrlayout-core` directly.

---

### 3.2 — Desktop App Core Features

#### Excel / CSV Data Source
```
User action:                  App does:
─────────────────────         ─────────────────────────────────
Open .xlsx file       →       Parse all sheets, show sheet picker
Select a sheet        →       Display rows in a spreadsheet-like table
                              Column headers become available {{fields}}
```

- File open dialog (native OS dialog via Tauri)
- Parse `.xlsx` with SheetJS, `.csv` with PapaParse (same libraries as Phase 2.4)
- Show data in a sortable, filterable table
- Column header names auto-map to `{{variableName}}` in the designer

#### Layout Designer (Embedded)
- Embed `qrlayout-ui` (the same npm package) inside the Electron/Tauri window
- Column names from the Excel file are passed as `EntitySchema.fields` — they appear as click-to-insert pills in the designer
- Save layouts to local app data folder (JSON files)
- Templates library: ship 10–15 built-in templates the user can start from

#### Local Layout Library
```
Saved Layouts
├── Employee Badge (100×60mm)       last used: 2 days ago
├── Shipping Label (4"×6")          last used: today
├── Asset Tag (50×25mm)             last used: 1 week ago
└── [+ New Layout]
```

- Layouts stored as JSON in the user's local app data directory
- Can import/export layout JSON files for sharing between users

#### Print Panel
```
┌─────────────────────────────────────────────────────┐
│  Layout:  [Employee Badge ▼]                        │
│  Data:    [employees.xlsx — 47 rows]                │
│                                                     │
│  ┌──────────────────┐  Filter rows by:              │
│  │  Preview         │  Department: [All ▼]          │
│  │  [Label render]  │  Status: [Active ▼]           │
│  └──────────────────┘                               │
│                                                     │
│  Export: [PDF ▼]  [Print (ZPL) ▼]  [PNG Batch]     │
└─────────────────────────────────────────────────────┘
```

- Select layout from local library
- Data already loaded from Excel file
- Filter/sort rows before printing
- Print actions:
  - **ZPL:** Send directly to network printer (IP:Port) or save as `.zpl` file
  - **PDF:** Save multi-page PDF, or send to system print dialog
  - **PNG:** Export one PNG per row into a folder

#### Direct Printer Connection (Desktop Only)
- Connect to Zebra thermal printer by IP address or USB
- Send ZPL directly from app — no file download step
- Test connection with a test label
- This is the feature that makes the desktop app worth having over the web version

---

### 3.3 — Desktop App — Extra Features (Nice to Have)

- [ ] **Print history** — log of every print job (layout used, record count, timestamp)
- [ ] **Template sharing** — export/import layout JSON; share via email or file
- [ ] **Auto-update** — Tauri's built-in updater, checks for new versions on launch
- [ ] **Offline-first** — everything works without internet (no cloud dependency)
- [ ] **Keyboard-driven workflow** — open file → design → print without touching the mouse
- [ ] **Multiple Excel files open** — tab-based data source switcher

---

## Phase 4 — Ecosystem & Community  *(Ongoing)*

**Goal:** Make this the default answer when a developer Googles "how to print labels from a web app."

---

### 4.1 — Documentation Site

- Build a `docs.qrlayout.dev` site using VitePress (free Netlify hosting)
- Key pages:
  - "How to print labels from React" — targets the most-searched phrase
  - "Generate ZPL from JavaScript" — currently uncontested keyword
  - API reference (auto-generated from TSDoc)
  - Template gallery
  - Migration guide: "Moving from Bartender / NiceLabel"

### 4.2 — Template Gallery

- 20+ curated label templates in the repo (`/templates/` folder)
- Each template is a `StickerLayout` JSON + a screenshot
- Community can submit templates via Pull Request
- Desktop app ships these built-in; web designer loads them from GitHub raw URLs

### 4.3 — CLI Tool (`qrlayout-cli`)

```bash
# Install once
npm install -g qrlayout-cli

# Generate labels from command line
qrlayout generate \
  --layout ./badge-template.json \
  --data   ./employees.csv \
  --format zpl \
  --out    ./output/

# Outputs: ./output/EMP-001.zpl, ./output/EMP-002.zpl, ...
```

- Enables CI/CD label pipelines (trigger prints from GitHub Actions, ERP webhooks)
- Same core engine — just a new CLI entry point over `qrlayout-core`

### 4.4 — Framework Wrappers (Publish All)

| Package | Status | Action |
|---------|--------|--------|
| `react-qr-label` | Published ✓ | Maintain |
| `vue-qr-label` | Demo only | Publish as proper package |
| `svelte-qr-label` | Demo only | Publish as proper package |
| `angular-qr-label` | Demo only | Publish as proper package |
| `qrlayout-cli` | Missing | Create (Phase 4.3) |

---

## Roadmap Summary Table

| Phase | What | When | Key Outcome |
|-------|------|------|-------------|
| **1** | Tests, undo/redo, keyboard shortcuts, label presets, TSDoc | Now — 3 months | Stable, trustworthy library |
| **2** | Barcode element, image element, shapes, CSV/Excel import, ZPL preview, sheet layout | 3–6 months | Production-ready for logistics/retail/HR |
| **3** | Desktop app (Tauri) — Excel data source, local layout library, direct ZPL print | 6–12 months | Standalone tool for non-developers |
| **4** | Docs site, template gallery, CLI, all framework wrappers published | Ongoing | Community and ecosystem |

---

## The Single Highest-Leverage Item Right Now

**Add barcode support (`CODE128` first).**

A label tool that only outputs QR codes cannot target warehousing, logistics, or retail — all of which require linear barcodes. Adding `CODE128` alone would double the addressable use cases with about a week of implementation work. Every other improvement is additive; this one is multiplicative.

---

*Maintained by Shashidhar Naik — contributions welcome. See `CONTRIBUTING.md` for setup instructions.*
