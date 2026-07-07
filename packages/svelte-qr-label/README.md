# svelte-qr-label

**The official Svelte 5 component for the QR Layout Designer — drag-and-drop label design with PDF, PNG, and ZPL export.**

[![npm version](https://img.shields.io/npm/v/svelte-qr-label.svg)](https://www.npmjs.com/package/svelte-qr-label)
[![npm downloads](https://img.shields.io/npm/dm/svelte-qr-label.svg)](https://www.npmjs.com/package/svelte-qr-label)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue.svg)](https://www.typescriptlang.org/)
[![GitHub Stars](https://img.shields.io/github/stars/shashi089/qr-code-layout-generate-tool?style=social)](https://github.com/shashi089/qr-code-layout-generate-tool/stargazers)

Drop a fully featured label designer into your Svelte 5 app with a single component. Users can drag and drop elements, bind `{{variables}}` from your data schema, preview in real-time, and export to PDF, PNG, or ZPL for Zebra thermal printers.

Part of the [QR Layout Tool](https://github.com/shashi089/qr-code-layout-generate-tool) monorepo — also available for [React](../react-qr-label), [Vue 3](../vue-qr-label), and [vanilla JS](../ui).

---

## 🚀 Live Demo

Try the designer — no signup needed:

| Framework | Live Demo | Source Code |
| :--- | :--- | :--- |
| **Svelte 5** | [▶ Open Demo](https://qr-layout-designer-svelte.netlify.app/) | [Source](https://github.com/shashi089/qr-code-layout-generate-tool/tree/main/examples/svelte-demo) |

![QR Layout Designer Screenshot](https://github.com/shashi089/qr-code-layout-generate-tool/raw/main/assets/layout_designer.png)

---

## ✨ Features

- **Drag & Drop Designer** — visually place and resize text and QR code elements on a canvas
- **Live Preview** — see your label render with real sample data as you design
- **`{{variable}}` Data Binding** — bind fields like `{{name}}`, `{{id}}`, `{{department}}` from your entity schema
- **Multi-Variable QR** — join multiple fields into one QR scan with a configurable separator
- **Rich Text Styling** — font size, weight, alignment; color, font family, word wrap, and line height
- **Label Size Presets** — common shipping, badge, and tag sizes built in
- **Snap-to-Grid** — optional 1-unit grid snapping while dragging
- **Alignment Toolbar** — align selected elements to the label edges or center
- **Undo / Redo** — 20-step history (Ctrl+Z / Ctrl+Y)
- **Keyboard Shortcuts** — Delete, Arrow nudge, Shift+Arrow, Ctrl+D duplicate, Escape
- **Dark Mode** — built-in light and dark themes
- **Flexible Units** — design in mm, cm, in, or px
- **JSON Output** — saves a compact layout JSON you store in your backend

---

## 📦 Installation

```bash
npm install svelte-qr-label
```

`qrlayout-core` and `qrlayout-ui` are included as direct dependencies — no extra installs needed.

**Requirements:** Svelte 5.0+ as a peer dependency (already installed in any Svelte 5 app).

---

## 🚀 Quick Start

```svelte
<script lang="ts">
  import QRLabelDesigner from 'svelte-qr-label';
  import 'svelte-qr-label/style.css';
  import type { StickerLayout, EntitySchema } from 'svelte-qr-label';

  const schemas: Record<string, EntitySchema> = {
    employee: {
      label: 'Employee',
      fields: [
        { name: 'fullName',   label: 'Full Name'   },
        { name: 'employeeId', label: 'Employee ID' },
        { name: 'department', label: 'Department'  },
      ],
      sampleData: {
        fullName: 'Alice Johnson',
        employeeId: 'EMP-001',
        department: 'Engineering',
      },
    },
  };

  function handleSave(layout: StickerLayout) {
    // layout is a plain JSON object — save to your backend or localStorage
    console.log('Saved:', layout);
  }
</script>

<div style="width: 100vw; height: 100vh;">
  <QRLabelDesigner
    entitySchemas={schemas}
    onsave={handleSave}
  />
</div>
```

### Loading an existing layout

```svelte
<script lang="ts">
  import { QRLabelDesigner } from 'svelte-qr-label';
  import 'svelte-qr-label/style.css';
  import type { StickerLayout } from 'svelte-qr-label';

  // Load from your API or localStorage
  let savedLayout = $state<StickerLayout | undefined>(
    JSON.parse(localStorage.getItem('myLayout') ?? 'null') ?? undefined
  );

  function handleSave(layout: StickerLayout) {
    localStorage.setItem('myLayout', JSON.stringify(layout));
    savedLayout = layout;
  }
</script>

<QRLabelDesigner
  initialLayout={savedLayout}
  entitySchemas={schemas}
  onsave={handleSave}
/>
```

---

## ⚙️ Props

| Prop | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `initialLayout` | `StickerLayout` | ❌ | Layout to pre-load on mount. The designer re-creates itself when this changes. |
| `entitySchemas` | `Record<string, EntitySchema>` | ❌ | Field definitions for `{{variable}}` binding and live preview. The designer re-creates itself when this changes. |
| `onsave` | `(layout: StickerLayout) => void` | ❌ | Called when the user clicks "Save Layout". Uses Svelte 5's lowercase event convention. |

> **Svelte 5 note:** `onsave` follows Svelte 5's lowercase prop convention for event handlers. It updates reactively without re-creating the designer canvas.

---

## 💾 Save & Print Workflow

The designer produces a plain JSON layout object. Pass it with real data to `StickerPrinter` (re-exported from `svelte-qr-label`) to generate PDF, PNG, or ZPL output.

```
  User designs in <QRLabelDesigner />
          │ onsave={handleSave}
          ▼
  Save layoutJSON to your DB / localStorage
          │ load layoutJSON + real records
          ▼
  StickerPrinter → PDF / PNG / ZPL
```

### Export to PDF

> Requires `jspdf`: `npm install jspdf`

```typescript
import { StickerPrinter } from 'svelte-qr-label';

const printer = new StickerPrinter();
const pdf = await printer.exportToPDF(layoutJSON, records);
pdf.save('badges.pdf');
```

### Export to ZPL (Zebra thermal printers)

```typescript
import { StickerPrinter } from 'svelte-qr-label';

const printer = new StickerPrinter();

// Returns one ZPL string per record
const zplPages = printer.exportToZPL(layoutJSON, records, { dpi: 203 });

// Send to printer via socket on port 9100
```

### Export to PNG

```typescript
import { StickerPrinter } from 'svelte-qr-label';

const printer = new StickerPrinter();

for (const record of records) {
  const blob = await printer.exportToPNG(layoutJSON, record);
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `${record.id}.png`,
  });
  a.click();
}
```

---

## 📖 TypeScript Types

```typescript
interface StickerLayout {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: 'mm' | 'cm' | 'in' | 'px';
  backgroundColor?: string;
  targetEntity?: string;
  elements: StickerElement[];
}

interface StickerElement {
  id: string;
  type: 'text' | 'qr';
  x: number;
  y: number;
  w: number;
  h: number;
  content: string;        // static text or "{{variable}}" placeholder
  qrSeparator?: string;   // joins multiple {{fields}} in a QR code
  style?: {
    fontSize?: number;           // font size in pt — consistent across PNG, PDF, ZPL
    fontWeight?: 'normal' | 'bold';
    textAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    fontFamily?: string;         // e.g. 'Inter, sans-serif'
    color?: string;              // text color hex e.g. '#333333'
    backgroundColor?: string;   // element background hex
    wordWrap?: boolean;          // default: true
    lineHeight?: number;         // multiplier, default: 1.25
  };
}

interface EntitySchema {
  label: string;
  fields: EntityField[];
  sampleData: Record<string, string | number>;
}

interface EntityField {
  name: string;   // used in {{name}} placeholders
  label: string;  // shown in the designer UI
}
```

---

## 🎯 Use Cases

| Industry | Application |
| :--- | :--- |
| 🏭 Manufacturing & Warehousing | Packing slips, bin location tags, shipping labels |
| 🎟️ Events & Conferences | Attendee badges with QR check-in codes |
| 🏥 Healthcare | Patient wristbands, specimen labels, asset tracking |
| 📦 Inventory & Retail | SKU labels, price tags, product QR codes |
| 🏢 HR & Access Control | Employee ID cards, visitor passes |
| 🔧 Maintenance & MRO | Machine asset tags with scannable maintenance links |

---

## 🔗 Related Packages

| Package | Description |
| :--- | :--- |
| [`qrlayout-core`](https://www.npmjs.com/package/qrlayout-core) | Headless engine — render PNG, PDF, ZPL without the UI |
| [`qrlayout-ui`](https://www.npmjs.com/package/qrlayout-ui) | Framework-agnostic designer (vanilla TS) |
| [`react-qr-label`](https://www.npmjs.com/package/react-qr-label) | React wrapper |
| [`vue-qr-label`](https://www.npmjs.com/package/vue-qr-label) | Vue 3 wrapper |

---

## 📄 License

MIT © [Shashidhar Naik](https://github.com/shashi089)

---

<p align="center">
  <b>Found this useful? Please ⭐ the <a href="https://github.com/shashi089/qr-code-layout-generate-tool">GitHub repository</a> — it helps others discover the project!</b>
</p>
