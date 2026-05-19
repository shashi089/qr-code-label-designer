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
const blob = await printer.exportToPNG(template, data);
const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = "badge-emp-001.png";
a.click();
```

---

## 📄 PDF Export (Optional)

PDF support is an optional add-on to keep the core bundle lean.

```bash
npm install jspdf
```

```typescript
import { exportToPDF } from "qrlayout-core/pdf";

const pdf = await exportToPDF(template, employees);
pdf.save("all-badges.pdf");
```

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
    backgroundColor: "#f0f4ff"         // ← JSON only
  }
}
```

### `StickerPrinter` Methods

| Method | Description |
|---|---|
| `renderToCanvas(layout, data, canvas)` | Render a single label onto an HTML Canvas element |
| `exportToPNG(layout, data)` | Export a single label to a PNG Blob |
| `exportToZPL(layout, dataArray)` | Batch export labels to an array of ZPL strings |

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
