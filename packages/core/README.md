# qrlayout-core

**A high-performance, framework-agnostic QR code label rendering engine for Node.js and the browser.**

[![npm version](https://img.shields.io/npm/v/qrlayout-core.svg)](https://www.npmjs.com/package/qrlayout-core)
[![npm downloads](https://img.shields.io/npm/dm/qrlayout-core.svg)](https://www.npmjs.com/package/qrlayout-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue.svg)](https://www.typescriptlang.org/)
[![GitHub Stars](https://img.shields.io/github/stars/shashi089/qr-code-layout-generate-tool?style=social)](https://github.com/shashi089/qr-code-layout-generate-tool/stargazers)

Create pixel-perfect QR code layouts and export them to **PNG**, **PDF**, or **ZPL** (Zebra thermal printers). Define your template once, render it anywhere.

> [!TIP]
> This package is the **headless rendering engine** — no UI required. For the interactive visual layout designer, use **[`qrlayout-ui`](../ui/README.md)** alongside this package.
> Works seamlessly with **React, Vue, Angular, Svelte, and Vanilla JS/Node.js**.

---

## 🚀 Live Demos & Examples

See it working in real applications today:

| Framework | Live Demo | Source Code |
| :--- | :--- | :--- |
| **React** | [▶ Open Demo](https://qr-layout-designer.netlify.app/) | [Source](https://github.com/shashi089/qr-code-layout-generate-tool/tree/main/examples/react-demo) |
| **Angular** | [▶ Open Demo](https://qr-layout-designer-angular-demo.netlify.app/) | [Source](https://github.com/shashi089/qr-code-layout-generate-tool/tree/main/examples/angular-demo) |
| **Svelte 5** | [▶ Open Demo](https://qr-layout-designer-svelte.netlify.app/) | [Source](https://github.com/shashi089/qr-code-layout-generate-tool/tree/main/examples/svelte-demo) |
| **Vue 3** | [▶ Open Demo](https://qr-layout-designer-vue.netlify.app/) | [Source](https://github.com/shashi089/qr-code-layout-generate-tool/tree/main/examples/vue-demo) |

---

## ✨ Core Features

- 📐 **Industrial Precision**: Define layouts in `mm`, `cm`, `in`, or `px` — renders accurately regardless of screen DPI.
- 🖨️ **ZPL Support**: Direct export to Zebra Programming Language for industrial thermal label printers.
- 📦 **Mail-Merge Batch Processing**: Define `{{variable}}` placeholders in your template, then generate hundreds of personalized labels in a single call.
- 🌐 **Runs Everywhere**: Browser (Canvas), Node.js (Buffer), PDF (`jspdf`), or ZPL string — all from the same API.
- 🔗 **Multi-Variable QR**: Use `qrSeparator` to join multiple fields into one QR code (e.g., `EMP-001|Alice|Engineering`).
- 📝 **Automatic Word Wrap**: Long text wraps within its element boundary in both PNG and PDF output. Control wrapping per-element with `style.wordWrap` and `style.lineHeight`.
- ⚡ **Zero UI dependency**: Use this package alone for server-side generation, automations, or CLI tools.

---

## 📦 Installation

```bash
npm install qrlayout-core
```

---

## ⌨️ Quick Start

### 1. Define a Layout Template

A layout is a plain JSON schema describing physical dimensions and visual elements.

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
      qrSeparator: "|"  // joins multiple {{fields}} with this separator
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

// Returns an array of ZPL strings, one per record
const zplPages = printer.exportToZPL(template, employees);

// Send zplPages[0] directly to a Zebra printer
console.log(zplPages[0]);
```

### 4. Export to PNG (Download)

```typescript
// Option A — get a Blob (for download or File API)
const blob = await printer.exportToPNG(template, data);
const url  = URL.createObjectURL(blob);
const a    = document.createElement("a");
a.href     = url;
a.download = "badge-emp-001.png";
a.click();
URL.revokeObjectURL(url);

// Option B — get a data URL string (for <img src> or canvas)
const dataUrl = await printer.renderToDataURL(template, data, { format: "png" });
```

---

## 📄 PDF Export (Optional)

PDF support is an optional add-on to keep the core bundle lean.

```bash
npm install jspdf
```

```typescript
// Via the sub-path export (tree-shakeable)
import { exportToPDF } from "qrlayout-core/pdf";

const pdf = await exportToPDF(template, employees);
pdf.save("all-badges.pdf");

// Or via the StickerPrinter class
const pdf = await printer.exportToPDF(template, employees);
pdf.save("all-badges.pdf");
```

> [!NOTE]
> Text in PDF output automatically wraps within each element's width — the same as PNG.
> To disable wrapping for a specific element, set `style.wordWrap: false` in that element's style.

---

## 🖨️ ZPL Export (Zebra Printers)

Export directly to ZPL for Zebra and compatible thermal label printers.

> [!IMPORTANT]
> Always pass the `dpi` option matching your printer's **physical DPI setting**.
> Using the wrong DPI causes all element positions, widths, heights, and font sizes
> to print at the wrong scale on the physical label.

```typescript
import { StickerPrinter } from "qrlayout-core";

const printer = new StickerPrinter();

// 203 DPI — standard desktop Zebra printers (default, no option needed)
const zpl203 = printer.exportToZPL(template, employees);

// 300 DPI — mid-range / high-quality printers
const zpl300 = printer.exportToZPL(template, employees, { dpi: 300 });

// 600 DPI with high QR error correction (for harsh environments)
const zpl600 = printer.exportToZPL(template, employees, { dpi: 600, qrErrorCorrection: "H" });

// Each call returns one ZPL string per record
console.log(zpl300[0]); // ^XA ... ^PW... ^LL... ^FO... ^XZ
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
> **Special characters in data:** If your data contains `^` or `~` characters (ZPL control characters),
> `exportToZPL()` automatically escapes them using ZPL's `^FH` hex-encoding mechanism.
> You do not need to sanitize your data before passing it in.

---

## 📖 API Reference

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

| Attribute | Type | Required | UI Designer | Description |
|---|---|---|---|---|
| `id` | `string` | ✅ | Auto-generated | Unique element identifier |
| `type` | `text \| qr` | ✅ | `+ Text` / `+ QR` buttons | Component type |
| `content` | `string` | ✅ | ✅ Content textarea | Static text or `{{variable}}` template |
| `x`, `y` | `number` | ✅ | ✅ Drag on canvas or number inputs | Position from top-left origin (in layout units) |
| `w`, `h` | `number` | ✅ | ✅ Resize handle or number inputs | Width and height (in layout units) |
| `qrSeparator` | `string` | ❌ | ✅ "Field Separator" input (QR only) | Joins consecutive `{{variables}}` in a single QR scan |
| `style.fontSize` | `number` | ❌ | ✅ "Font Size" input (text only) | Font size in pixels |
| `style.fontWeight` | `normal \| bold` | ❌ | ✅ "Font Weight" dropdown (text only) | Font weight |
| `style.textAlign` | `left \| center \| right` | ❌ | ✅ "Horizontal Align" toggle (text only) | Horizontal text alignment |
| `style.verticalAlign` | `top \| middle \| bottom` | ❌ | ✅ "Vertical Align" toggle (text only) | Vertical text alignment |
| `style.fontFamily` | `string` | ❌ | ❌ JSON only | CSS font family (e.g. `'Inter, sans-serif'`) |
| `style.color` | `string` | ❌ | ❌ JSON only | Text color (hex, e.g. `'#333333'`) |
| `style.backgroundColor` | `string` | ❌ | ❌ JSON only | Element background fill color (hex) |
| `style.wordWrap` | `boolean` | ❌ | ❌ JSON only | Wrap text to next line when it exceeds element width. Default: `true`. Set `false` for forced single-line. |
| `style.lineHeight` | `number` | ❌ | ❌ JSON only | Line height multiplier relative to `fontSize`. Default: `1.25`. E.g. `1.5` adds more space between lines. |

> [!NOTE]
> Properties marked **"JSON only"** are fully supported by the rendering engine but are not yet exposed in the `qrlayout-ui` designer panel. Set them directly in the layout JSON when loading via `initialLayout` or when saving/loading from your backend.

**JSON-only example:**
```typescript
{
  id: "label-header",
  type: "text",
  x: 5, y: 5, w: 90, h: 12,
  content: "{{name}}",
  style: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Inter, sans-serif",   // ← JSON only
    color: "#1a1a2e",                  // ← JSON only
    backgroundColor: "#f0f4ff",        // ← JSON only
    wordWrap: true,                    // ← JSON only (default: true)
    lineHeight: 1.4                    // ← JSON only (default: 1.25)
  }
}
```

### `StickerPrinter` Methods

| Method | Returns | Description |
|---|---|---|
| `renderToCanvas(layout, data, canvas)` | `Promise<void>` | Render a single label onto an existing HTML Canvas element |
| `renderToDataURL(layout, data, options?)` | `Promise<string>` | Export as a data URL string — use as `<img src>` or pass to canvas. Supports `png`, `jpeg`, `webp`. |
| `exportToPNG(layout, data, options?)` | `Promise<Blob>` | Export a single label as a PNG `Blob` — ideal for download or the File API |
| `exportImages(layout, dataList, options?)` | `Promise<string[]>` | Batch-export multiple records as data URL strings (one per record) |
| `exportToPDF(layout, dataList)` | `Promise<jsPDF>` | Batch-export all records as a multi-page PDF. Requires `jspdf`. |
| `exportToZPL(layout, dataList, options?)` | `string[]` | Batch-export all records as ZPL strings. Pass `{ dpi: 300 }` to match your printer's resolution. Supports `qrErrorCorrection` and automatic `^`/`~` escaping. |

---

## 🎯 Common Use Cases

| Industry | Application |
| :--- | :--- |
| 🏭 Manufacturing & Warehousing | Packing slips, shipping labels, bin location tags |
| 🎟️ Events & Conferences | Attendee badges with QR check-in codes |
| 🏥 Healthcare | Patient wristbands, asset tracking, specimen labels |
| 📦 Inventory & Retail | SKU labels, price tags, product QR codes |
| 🏢 HR & Access Control | Employee ID cards, visitor passes |
| 🔧 Maintenance & MRO | Machine asset tags with scannable maintenance links |

---

## 🔗 Related

- **[`qrlayout-ui`](../ui/README.md)** — The visual drag-and-drop designer built on top of this engine
- **[GitHub Repository](https://github.com/shashi089/qr-code-layout-generate-tool)** — Full monorepo, examples, and issue tracker

---

## 📄 License

MIT © [Shashidhar Naik](https://github.com/shashi089)

---

<p align="center">
  <b>Found this useful? Please ⭐ the <a href="https://github.com/shashi089/qr-code-layout-generate-tool">GitHub repository</a> — it helps others discover the project!</b>
</p>
