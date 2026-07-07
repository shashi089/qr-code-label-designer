# qrlayout-ui

**An embeddable, framework-agnostic drag-and-drop QR label designer for React, Angular, Vue, Svelte, and plain HTML.**

[![npm version](https://img.shields.io/npm/v/qrlayout-ui.svg)](https://www.npmjs.com/package/qrlayout-ui)
[![npm downloads](https://img.shields.io/npm/dm/qrlayout-ui.svg)](https://www.npmjs.com/package/qrlayout-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](../../LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue.svg)](https://www.typescriptlang.org/)
[![GitHub Stars](https://img.shields.io/github/stars/shashi089/qr-code-layout-generate-tool?style=social)](https://github.com/shashi089/qr-code-layout-generate-tool/stargazers)

Drop a professional label designer into your app in minutes. Supports drag-and-drop element placement, live preview, dark mode, data binding with `{{variables}}`, and layout export to JSON.

Part of the [QR Layout Tool](https://github.com/shashi089/qr-code-layout-generate-tool) monorepo.

---

## 🚀 Live Demos & Examples

Try the designer — no signup needed:

| Framework | Live Demo | Source Code |
| :--- | :--- | :--- |
| **React** | [▶ Open Demo](https://qr-layout-designer.netlify.app/) | [Source](https://github.com/shashi089/qr-code-layout-generate-tool/tree/main/examples/react-demo) |
| **Angular** | [▶ Open Demo](https://qr-layout-designer-angular-demo.netlify.app/) | [Source](https://github.com/shashi089/qr-code-layout-generate-tool/tree/main/examples/angular-demo) |
| **Svelte 5** | [▶ Open Demo](https://qr-layout-designer-svelte.netlify.app/) | [Source](https://github.com/shashi089/qr-code-layout-generate-tool/tree/main/examples/svelte-demo) |
| **Vue 3** | [▶ Open Demo](https://qr-layout-designer-vue.netlify.app/) | [Source](https://github.com/shashi089/qr-code-layout-generate-tool/tree/main/examples/vue-demo) |

![QR Layout Designer Screenshot](https://github.com/shashi089/qr-code-layout-generate-tool/raw/main/assets/layout_designer.png)

---

## ✨ Features

- **Framework Independent**: Built with vanilla TypeScript — mount it inside React, Vue, Angular, Svelte, or a plain HTML page.
- **Drag & Drop Designer**: Visual placement and resizing of text and QR code elements on a canvas.
- **Live Preview**: Preview your label with real sample data as you design.
- **Data Binding**: Bind any field like `{{name}}`, `{{id}}`, or `{{department}}` from your entity schema.
- **Multi-Variable QR**: Set a separator (e.g. `|`) on QR elements to automatically join multiple fields into one scan.
- **Rich Text Styling**: Customize font size, weight, and horizontal/vertical alignment directly in the designer. Font family, color, word-wrap, and line height are supported by the engine and can be set via JSON (`initialLayout` or saved layout) — see the [core README](../core/README.md#stickerelement-schema) for all style properties.
- **Undo / Redo**: 20-step history with Ctrl+Z / Ctrl+Y keyboard shortcuts and header buttons.
- **Keyboard Shortcuts**: Delete/Backspace removes element, Arrow keys nudge 1 unit, Shift+Arrow nudges 5 units, Ctrl+D duplicates, Escape deselects.
- **Label Size Presets**: Dropdown with 7 common sizes (Badge 100×60 mm, Shipping Label 4"×6", Brother QL, and more) — resets inputs on apply.
- **Snap-to-Grid**: Optional 1-unit grid snapping for drag and resize, with a live dot-grid overlay on the canvas.
- **Element Alignment Toolbar**: 6 icon buttons (Align Left / Center / Right | Top / Center / Bottom) in the property panel — all recorded in the undo stack.
- **Dark Mode**: Built-in light and dark themes that follow your app's color scheme.
- **Flexible Units**: Design in millimeters, centimeters, inches, or pixels.
- **JSON Output**: Save the layout as a compact JSON object to your backend or `localStorage`.
- **Rendering via `qrlayout-core`**: The same layout JSON drives PNG, PDF, and ZPL export — design once, output anywhere.

---

## 📦 Installation

```bash
npm install qrlayout-ui qrlayout-core
```

---

## 🚀 Getting Started

### Step 1 — Import the CSS

Add this to your project's entry point (e.g., `main.ts`, `index.js`, `App.tsx`):

```javascript
import "qrlayout-ui/style.css";
```

### Step 2 — Mount the Designer

```typescript
import { QRLayoutDesigner } from "qrlayout-ui";

const designer = new QRLayoutDesigner({
  element: document.getElementById("designer-container"),

  // Optional: entity schema for {{variable}} data binding
  entitySchemas: {
    employee: {
      label: "Employee",
      fields: [
        { name: "name",       label: "Full Name"    },
        { name: "id",         label: "Employee ID"  },
        { name: "department", label: "Department"   },
      ],
      sampleData: {
        name: "Alice Johnson",
        id: "EMP-001",
        department: "Engineering"
      }
    }
  },

  // Optional: load an existing saved layout
  initialLayout: {
    id: "1",
    name: "My Badge",
    targetEntity: "employee",
    width: 100,
    height: 60,
    unit: "mm",
    backgroundColor: "#ffffff",
    elements: []
  },

  // Fires when the user clicks "Save Layout"
  onSave: (layout) => {
    localStorage.setItem("my-layout", JSON.stringify(layout));
    console.log("Layout saved:", layout);
  }
});
```

### Step 3 — Size the Container

The designer fills 100% of its parent element. Give the container a fixed size:

```css
#designer-container {
  width: 100%;
  height: 100vh;   /* full-screen */
}
```

Or embed it inside a modal/panel:

```css
#designer-container {
  width: 100%;
  height: 700px;
}
```

### Step 4 — Cleanup on Unmount

```javascript
designer.destroy();
```

---

## ⚙️ Options Reference

| Option | Type | Required | Description |
|---|---|---|---|
| `element` | `HTMLElement` | ✅ | The DOM element to mount the designer into |
| `entitySchemas` | `Record<string, Schema>` | ❌ | Entity field definitions for `{{field}}` binding and live preview |
| `initialLayout` | `StickerLayout` | ❌ | Layout to pre-load on mount |
| `onSave` | `(layout: StickerLayout) => void` | ❌ | Callback when "Save Layout" is clicked |

---

## 💾 Layout Persistence & Printing Workflow

The `onSave` callback gives you the complete layout as a **plain JSON object**. That JSON is your single source of truth — store it anywhere, load it back anytime, and pass it with real data to `qrlayout-core` for printing.

### The Full Cycle

```
  ┌──────────────────────┐
  │   qrlayout-ui        │  ← User designs the label visually
  │   (Designer)         │
  └──────────┬───────────┘
             │ onSave(layout JSON)
             ▼
  ┌──────────────────────┐
  │   Your Backend /     │  ← Save layout JSON to your DB, file, or localStorage
  │   Database           │
  └──────────┬───────────┘
             │ Load layout JSON + real employee/machine data
             ▼
  ┌──────────────────────┐
  │   qrlayout-core      │  ← Merge data into template, export PNG / PDF / ZPL
  │   (StickerPrinter)   │
  └──────────────────────┘
```

### Step 1 — Save the Layout to Your Database

```typescript
const designer = new QRLayoutDesigner({
  element: document.getElementById("designer"),
  onSave: async (layout) => {
    // layout is a plain JSON object — save it wherever you like
    await fetch("/api/layouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(layout)
    });
  }
});
```

### Step 2 — Load the Layout Back (with `initialLayout`)

```typescript
// Fetch a saved layout from your backend
const saved = await fetch("/api/layouts/employee-badge").then(r => r.json());

const designer = new QRLayoutDesigner({
  element: document.getElementById("designer"),
  initialLayout: saved,   // ← the JSON you saved earlier
  onSave: (layout) => { /* update in DB */ }
});
```

### Step 3 — Print with Real Data (via `qrlayout-core`)

```typescript
import { StickerPrinter } from "qrlayout-core";
import { exportToPDF } from "qrlayout-core/pdf"; // requires: npm install jspdf

const printer = new StickerPrinter();

// Fetch layout + real records from your backend
const layout  = await fetch("/api/layouts/employee-badge").then(r => r.json());
const records = await fetch("/api/employees").then(r => r.json());

// ── PNG — one file per record (Blob download) ─────────────────
for (const record of records) {
  const blob = await printer.exportToPNG(layout, record);
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: `${record.id}.png` });
  a.click();
  URL.revokeObjectURL(url);
}

// ── PDF — all records in one file ────────────────────────────
const pdf = await printer.exportToPDF(layout, records);
pdf.save("batch-badges.pdf");

// ── ZPL — for Zebra / thermal printers ───────────────────────
const zplPages = printer.exportToZPL(layout, records);
// Send zplPages[0] to your thermal printer via socket or API
```

---

> [!NOTE]
> **About the live demo applications** — The demo apps ([React](https://qr-layout-designer.netlify.app/), [Angular](https://qr-layout-designer-angular-demo.netlify.app/), [Svelte](https://qr-layout-designer-svelte.netlify.app/), [Vue](https://qr-layout-designer-vue.netlify.app/)) ship with a small set of **pre-built sample layouts and employee/machine records** so you can explore all features immediately without any setup.
>
> All demo data is stored **exclusively in your browser's `localStorage`**. Nothing is sent to or stored on any server. Clearing your browser storage resets the demo to its defaults. Your designs and data never leave your browser.

---

## 🔌 Integration Examples


### React (TypeScript)

```tsx
import { useEffect, useRef } from 'react';
import { QRLayoutDesigner } from 'qrlayout-ui';
import 'qrlayout-ui/style.css';

const LabelDesigner = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const designer = new QRLayoutDesigner({
      element: containerRef.current,
      onSave: (layout) => console.log('Saved:', layout)
    });

    return () => designer.destroy();
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100vh' }} />;
};

export default LabelDesigner;
```

### Vue 3 (Composition API)

```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { QRLayoutDesigner } from 'qrlayout-ui';
import 'qrlayout-ui/style.css';

const container = ref(null);
let designer = null;

onMounted(() => {
  designer = new QRLayoutDesigner({
    element: container.value,
    onSave: (layout) => console.log('Saved:', layout)
  });
});

onUnmounted(() => {
  if (designer) designer.destroy();
});
</script>

<template>
  <div ref="container" style="width: 100%; height: 100vh;" />
</template>
```

### Angular (v17+ Standalone Component)

```typescript
import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { QRLayoutDesigner } from 'qrlayout-ui';
import 'qrlayout-ui/style.css';

@Component({
  standalone: true,
  selector: 'app-label-designer',
  template: '<div #container style="width: 100%; height: 100vh;"></div>'
})
export class LabelDesignerComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef;
  private designer?: QRLayoutDesigner;

  ngOnInit() {
    this.designer = new QRLayoutDesigner({
      element: this.container.nativeElement,
      onSave: (layout) => console.log('Saved:', layout)
    });
  }

  ngOnDestroy() {
    this.designer?.destroy();
  }
}
```

### Svelte 5 (Runes)

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { QRLayoutDesigner } from 'qrlayout-ui';
  import 'qrlayout-ui/style.css';

  let container = $state<HTMLDivElement | null>(null);
  let designer: QRLayoutDesigner | null = null;

  onMount(() => {
    if (!container) return;

    designer = new QRLayoutDesigner({
      element: container,
      onSave: (layout) => console.log('Saved:', layout)
    });

    return () => designer?.destroy();
  });
</script>

<div bind:this={container} style="width: 100%; height: 100vh;" />
```

### Vanilla JavaScript / HTML

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/qrlayout-ui/dist/style.css">
  <style>
    #designer { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="designer"></div>

  <script type="module">
    import { QRLayoutDesigner } from 'qrlayout-ui';

    const designer = new QRLayoutDesigner({
      element: document.getElementById('designer'),
      onSave: (layout) => {
        localStorage.setItem('layout', JSON.stringify(layout));
      }
    });
  </script>
</body>
</html>
```

---

## 🔗 Related

- **[`qrlayout-core`](../core/README.md)** — Use the same layout JSON to render PNG, PDF, or ZPL without the UI
- **[GitHub Repository](https://github.com/shashi089/qr-code-layout-generate-tool)** — Full monorepo, issue tracker, and discussions

---

## 📄 License

MIT © [Shashidhar Naik](https://github.com/shashi089)

---

<p align="center">
  <b>If this saved you time, please ⭐ the <a href="https://github.com/shashi089/qr-code-layout-generate-tool">GitHub repository</a> — it helps others find the project!</b>
</p>
