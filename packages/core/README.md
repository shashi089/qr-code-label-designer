# qrlayout-core

**A framework-agnostic QR code label rendering engine for Node.js and the browser.**

[![npm version](https://img.shields.io/npm/v/qrlayout-core.svg)](https://www.npmjs.com/package/qrlayout-core)
[![npm downloads](https://img.shields.io/npm/dm/qrlayout-core.svg)](https://www.npmjs.com/package/qrlayout-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue.svg)](https://www.typescriptlang.org/)
[![GitHub Stars](https://img.shields.io/github/stars/shashi089/qr-code-label-designer?style=social)](https://github.com/shashi089/qr-code-label-designer/stargazers)

Create pixel-perfect QR code layouts and export them to **PNG**, **PDF**, or **ZPL** (Zebra thermal printers). Define your template once, render it anywhere.

> [!TIP]
> This package is the **headless rendering engine** — no UI required. For the interactive visual layout designer, use **[`qrlayout-ui`](../ui/README.md)** alongside this package.
> Works seamlessly with **React, Vue, Angular, Svelte, and Vanilla JS/Node.js**.

---

## Live Demos

| Framework | Live Demo | Source Code |
| :--- | :--- | :--- |
| **React** | [▶ Open Demo](https://qr-layout-designer.netlify.app/) | [Source](https://github.com/shashi089/qr-code-label-designer/tree/main/examples/react-demo) |
| **Angular** | [▶ Open Demo](https://qr-layout-designer-angular-demo.netlify.app/) | [Source](https://github.com/shashi089/qr-code-label-designer/tree/main/examples/angular-demo) |
| **Svelte 5** | [▶ Open Demo](https://qr-layout-designer-svelte.netlify.app/) | [Source](https://github.com/shashi089/qr-code-label-designer/tree/main/examples/svelte-demo) |
| **Vue 3** | [▶ Open Demo](https://qr-layout-designer-vue.netlify.app/) | [Source](https://github.com/shashi089/qr-code-label-designer/tree/main/examples/vue-demo) |

---

## Features

- **Industrial Precision** — Define layouts in `mm`, `cm`, `in`, or `px`; renders accurately regardless of screen DPI.
- **ZPL Support** — Direct export to Zebra Programming Language for industrial thermal label printers.
- **Mail-Merge Batch Processing** — Define `{{variable}}` placeholders in your template, then generate hundreds of personalized labels in a single call.
- **Runs Everywhere** — Browser (Canvas), Node.js (Buffer), PDF (`jspdf`), or ZPL string — all from the same API.
- **Multi-Variable QR** — Use `qrSeparator` to join multiple fields into one QR code (e.g., `EMP-001|Alice|Engineering`).
- **Automatic Word Wrap** — Long text wraps within its element boundary in both PNG and PDF output. Control per-element with `style.wordWrap` and `style.lineHeight`.
- **Barcode Support** — `CODE128`, `EAN13`, `UPCA`, `CODE39`, and `ITF14` via `jsbarcode`; works across PNG, PDF, and ZPL.
- **Zero UI dependency** — Use this package alone for server-side generation, automations, or CLI tools.

---

## Installation

```bash
npm install qrlayout-core
```

---

## Quick Start

### 1. Define a Layout Template

```typescript
import { type StickerLayout } from "qrlayout-core";

const template: StickerLayout = {
  id: "employee-badge",
  name: "Employee Badge",
  width: 100,
  height: 60,
  unit: "mm",
  elements: [
    {
      id: "employee-name",
      type: "text",
      x: 5, y: 5, w: 90, h: 12,
      content: "{{name}}",
      style: { fontSize: 16, fontWeight: "bold", textAlign: "center" }
    },
    {
      id: "dept-label",
      type: "text",
      x: 5, y: 18, w: 90, h: 8,
      content: "{{department}}",
      style: { fontSize: 10, textAlign: "center", color: "#555555" }
    },
    {
      id: "id-qr",
      type: "qr",
      x: 35, y: 28, w: 30, h: 30,
      content: "{{id}}",
      qrSeparator: "|"
    }
  ]
};
```

### 2. Render to Canvas (Browser Preview)

```typescript
import { StickerPrinter } from "qrlayout-core";

const printer = new StickerPrinter();
const data = { name: "Alice Johnson", department: "Engineering", id: "EMP-001" };
const canvas = document.getElementById("preview") as HTMLCanvasElement;

await printer.renderToCanvas(template, data, canvas);
```

### 3. Batch Export to ZPL (Thermal Printer)

```typescript
import { StickerPrinter } from "qrlayout-core";

const printer = new StickerPrinter();

const employees = [
  { name: "Alice Johnson",   department: "Engineering",  id: "EMP-001" },
  { name: "Bob Kumar",       department: "HR",            id: "EMP-002" },
  { name: "Charlie Pereira", department: "Warehouse",     id: "EMP-003" },
];

const zplPages = printer.exportToZPL(template, employees);
console.log(zplPages[0]);
```

### 4. Export to PNG

```typescript
// Blob (for download or File API)
const blob = await printer.exportToPNG(template, data);
const url  = URL.createObjectURL(blob);
const a    = document.createElement("a");
a.href     = url;
a.download = "badge-emp-001.png";
a.click();
URL.revokeObjectURL(url);

// Data URL (for <img src> or canvas)
const dataUrl = await printer.renderToDataURL(template, data, { format: "png" });
```

---

## PDF Export

PDF support is an optional add-on to keep the core bundle lean.

```bash
npm install jspdf
```

```typescript
import { exportToPDF } from "qrlayout-core/pdf";

const pdf = await exportToPDF(template, employees);
pdf.save("all-badges.pdf");

// Or via StickerPrinter
const pdf = await printer.exportToPDF(template, employees);
pdf.save("all-badges.pdf");
```

> [!NOTE]
> Text in PDF output automatically wraps within each element's width — the same as PNG.
> To disable wrapping for a specific element, set `style.wordWrap: false`.

---

## ZPL Export (Zebra Printers)

> [!IMPORTANT]
> Always pass the `dpi` option matching your printer's **physical DPI setting**.
> Using the wrong DPI causes all element positions, widths, heights, and font sizes
> to print at the wrong scale on the physical label.

```typescript
import { StickerPrinter } from "qrlayout-core";

const printer = new StickerPrinter();

// 203 DPI — standard desktop Zebra printers (default)
const zpl203 = printer.exportToZPL(template, employees);

// 300 DPI — mid-range / high-quality printers
const zpl300 = printer.exportToZPL(template, employees, { dpi: 300 });

// 600 DPI with high QR error correction (for harsh environments)
const zpl600 = printer.exportToZPL(template, employees, { dpi: 600, qrErrorCorrection: "H" });
```

### ZPL Options

| Option | Type | Default | Description |
|---|---|---|---|
| `dpi` | `number` | `203` | Printer resolution. Must match the printer's physical DPI. Common values: `203`, `300`, `600`. |
| `qrErrorCorrection` | `L \| M \| Q \| H` | `"M"` | QR code error correction level. `H` recovers ~30% of data; use for labels that may be dirty or worn. |

### Printer Reference

| DPI | `dpmm` | Typical Zebra models |
|---|---|---|
| `203` (default) | ~8.0 dots/mm | ZT230, ZD420, GX430t, most desktop models |
| `300` | ~11.8 dots/mm | ZT410, ZD620, ZD510 |
| `600` | ~23.6 dots/mm | ZT610, ZT620, ZD621 |

> [!NOTE]
> If your data contains `^` or `~` characters (ZPL control characters), `exportToZPL()` automatically escapes them using ZPL's `^FH` hex-encoding mechanism. You do not need to sanitize your data before passing it in.

---

## API Reference

### `StickerLayout` Schema

| Attribute | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique identifier for the layout |
| `name` | `string` | ✅ | Human-readable layout name |
| `width`, `height` | `number` | ✅ | Physical dimensions |
| `unit` | `mm \| cm \| in \| px` | ✅ | Unit of measurement |
| `elements` | `StickerElement[]` | ✅ | Array of visual elements |
| `backgroundColor` | `string` | ❌ | Background fill color (hex) |
| `backgroundImage` | `string` | ❌ | Background image URL |

### `StickerElement` Schema

| Attribute | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Unique element identifier |
| `type` | `text \| qr \| barcode` | ✅ | Component type |
| `content` | `string` | ✅ | Static text or `{{variable}}` template |
| `x`, `y` | `number` | ✅ | Position from top-left origin (in layout units) |
| `w`, `h` | `number` | ✅ | Width and height (in layout units) |
| `qrSeparator` | `string` | ❌ | Joins consecutive `{{variables}}` in a single QR scan |
| `barcodeFormat` | `CODE128 \| EAN13 \| UPCA \| CODE39 \| ITF14` | ❌ | Required when `type` is `barcode` |
| `style.fontSize` | `number` | ❌ | Font size in **points (pt)**. Consistent across PNG, PDF, and ZPL. Default: `12`. |
| `style.fontWeight` | `normal \| bold` | ❌ | Font weight |
| `style.textAlign` | `left \| center \| right` | ❌ | Horizontal text alignment |
| `style.verticalAlign` | `top \| middle \| bottom` | ❌ | Vertical text alignment |
| `style.fontFamily` | `string` | ❌ | CSS font family (e.g. `'Inter, sans-serif'`) |
| `style.color` | `string` | ❌ | Text color (hex, e.g. `'#333333'`) |
| `style.backgroundColor` | `string` | ❌ | Element background fill color (hex) |
| `style.wordWrap` | `boolean` | ❌ | Wrap text when it exceeds element width. Default: `true`. |
| `style.lineHeight` | `number` | ❌ | Line height multiplier. Default: `1.25`. |

### `StickerPrinter` Methods

| Method | Returns | Description |
|---|---|---|
| `renderToCanvas(layout, data, canvas)` | `Promise<void>` | Render a single label onto an existing HTML Canvas element |
| `renderToDataURL(layout, data, options?)` | `Promise<string>` | Export as a data URL string. Supports `png`, `jpeg`, `webp`. |
| `exportToPNG(layout, data, options?)` | `Promise<Blob>` | Export a single label as a PNG Blob |
| `exportImages(layout, dataList, options?)` | `Promise<string[]>` | Batch-export multiple records as data URL strings |
| `exportToPDF(layout, dataList)` | `Promise<jsPDF>` | Batch-export all records as a multi-page PDF. Requires `jspdf`. |
| `exportToZPL(layout, dataList, options?)` | `string[]` | Batch-export all records as ZPL strings |

---

## Use Cases

| Industry | Application |
| :--- | :--- |
| 🏭 Manufacturing & Warehousing | Packing slips, shipping labels, bin location tags |
| 🎟️ Events & Conferences | Attendee badges with QR check-in codes |
| 🏥 Healthcare | Patient wristbands, asset tracking, specimen labels |
| 📦 Inventory & Retail | SKU labels, price tags, product QR codes |
| 🏢 HR & Access Control | Employee ID cards, visitor passes |
| 🔧 Maintenance & MRO | Machine asset tags with scannable maintenance links |

---

## Related

- **[`qrlayout-ui`](../ui/README.md)** — The visual drag-and-drop designer built on top of this engine
- **[GitHub Repository](https://github.com/shashi089/qr-code-label-designer)** — Full monorepo, examples, and issue tracker

---

## 🤝 Contributors

- [@JayanthVishnu](https://github.com/JayanthVishnu)
- [@arun270892](https://github.com/arun270892)

---

## License

MIT © [Shashidhar Naik](https://github.com/shashi089)

---

> Found this useful? Please [⭐ star the repository](https://github.com/shashi089/qr-code-label-designer) — it helps others discover the project!

