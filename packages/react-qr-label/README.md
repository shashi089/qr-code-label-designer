# React QR Label Designer Component (`react-qr-label`)

A professional, embeddable drag-and-drop QR code & barcode label designer for React. Design custom label templates visually, bind dynamic schema variables, and bulk-print to PDF, PNG, or ZPL (Zebra thermal printers).

[![npm version](https://img.shields.io/npm/v/react-qr-label.svg?style=flat-square)](https://www.npmjs.com/package/react-qr-label)
[![npm downloads](https://img.shields.io/npm/dm/react-qr-label.svg?style=flat-square)](https://www.npmjs.com/package/react-qr-label)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

---

`react-qr-label` is the official React wrapper for the **QRLayout ecosystem**. It equips your React applications with an interactive, responsive WYSIWYG editor for designing custom barcode, text, and QR code sticker templates. Users can layout elements, bind dynamic database tags (like `{{sku}}` or `{{price}}`), run real-time previews with sample data, and export templates to standard JSON format.

With the companion headless printing engine included in the library, you can merge your JSON templates with live records to generate batch files for standard printing or industrial logistics.

### 🔗 Key Resources
- 🌐 **Live Showcase Application:** [react-qr-label-designer.netlify.app](https://react-qr-label-designer.netlify.app/)
- 📦 **NPM Package:** [npmjs.com/package/react-qr-label](https://www.npmjs.com/package/react-qr-label)
- 🖥️ **Monorepo Source:** [GitHub Repository](https://github.com/shashi089/qr-code-layout-generate-tool)

---

## 📖 Table of Contents
1. [Key Features](#-key-features)
2. [Installation](#-installation)
3. [Quick Start (Getting Started)](#-quick-start-getting-started)
   - [1. Import Stylesheet](#1-import-stylesheet)
   - [2. Component Integration](#2-component-integration)
4. [Component Props Reference](#-component-props-reference)
5. [Save & Bulk Printing Workflow](#-save--bulk-printing-workflow)
   - [Bulk Export to PDF](#bulk-export-to-pdf)
   - [Bulk Export to ZPL (Thermal Printing)](#bulk-export-to-zpl-thermal-printing)
6. [Type Definitions (TypeScript)](#-type-definitions-typescript)
7. [Industry Use Cases](#-industry-use-cases)
8. [License](#-license)

---

## ✨ Key Features

* 🎨 **Visual Drag & Drop WYSIWYG Editor:** Position, resize, and configure text blocks, barcodes, and QR codes directly on a fluid, adjustable canvas.
* ⚡ **Dynamic Variables & Data Binding:** Inject template tags (e.g. `{{fullName}}`, `{{sku}}`, `{{price}}`) that dynamically resolve during preview and batch print.
* 🔗 **Multi-Field QR Codes:** Merge multiple data columns into a single QR scan value with customizable separators (e.g., `id|name|dept`).
* 🖨️ **Multi-Format Export Engine:** Batch print your designs to high-resolution **PDF documents**, **PNG images**, or raw **ZPL command streams** for Zebra industrial thermal printers.
* 🌓 **Integrated Dark Mode:** Modern dark mode that adapts to system-level settings automatically or can be toggled via design controls.
* 🏎️ **Performance Optimized:** Leverages React ref patterns to prevent canvas re-renders when updating state, protecting history stack and drag positions.
* 📏 **Flexible Dimensioning:** Create sticker layouts measured in millimeters (`mm`), centimeters (`cm`), inches (`in`), or pixels (`px`).

---

## 🚀 Installation

Install the package and its peer dependencies via npm, yarn, or pnpm:

```bash
npm install react-qr-label
```

*(Note: `qrlayout-core` and `qrlayout-ui` are direct dependencies and are installed automatically).*

---

## 💻 Quick Start (Getting Started)

### 1. Import Stylesheet
Import the required CSS styles in your entry file (e.g., `main.tsx`, `index.tsx`, or `App.tsx`):

```typescript
import 'react-qr-label/style.css';
```

### 2. Component Integration
Mount the interactive designer in any React page. The canvas container is fluid, adapting to its parent wrapper's width and height.

```tsx
import { useState } from 'react';
import { QRLabelDesigner, type StickerLayout, type EntitySchema } from 'react-qr-label';
import 'react-qr-label/style.css';

export default function LabelDesignerPage() {
  // Define default starting layout
  const [layout, setLayout] = useState<StickerLayout>({
    id: 'badge-template-1',
    name: 'Standard Employee ID Badge',
    width: 100,
    height: 60,
    unit: 'mm',
    backgroundColor: '#ffffff',
    targetEntity: 'employee',
    elements: []
  });

  // Provide fields available for variables drag-and-drop mapping
  const entitySchemas: Record<string, EntitySchema> = {
    employee: {
      label: 'Employee Database Fields',
      fields: [
        { name: 'fullName', label: 'Full Name' },
        { name: 'employeeId', label: 'Employee ID' },
        { name: 'department', label: 'Department' }
      ],
      sampleData: {
        fullName: 'Jane Doe',
        employeeId: 'EMP-9021',
        department: 'Operations'
      }
    }
  };

  const handleSave = (savedLayout: StickerLayout) => {
    // Persist this JSON configuration object to your backend database
    console.log('Saved Layout Configuration:', savedLayout);
    setLayout(savedLayout);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <QRLabelDesigner
        initialLayout={layout}
        entitySchemas={entitySchemas}
        onSave={handleSave}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
    </div>
  );
}
```

---

## ⚙️ Component Props Reference

The `<QRLabelDesigner />` component accepts the following props:

| Prop | Type | Required | Default | Description |
| :--- | :--- | :---: | :---: | :--- |
| `initialLayout` | `StickerLayout` | ❌ | `undefined` | The initial layout template structure JSON to pre-render. |
| `entitySchemas` | `Record<string, EntitySchema>` | ❌ | `undefined` | Available entity data structures, showing autocomplete variables and mapping test-data. |
| `onSave` | `(layout: StickerLayout) => void` | ❌ | `undefined` | Callback function fired when the user triggers the "Save Layout" button in the toolbar. |
| `className` | `string` | ❌ | `undefined` | Optional class applied to the designer outer container. |
| `style` | `React.CSSProperties` | ❌ | `{ width: '100%', height: '100%' }` | Custom style specifications for the designer wrapper. |

---

## 💾 Save & Bulk Printing Workflow

The WYSIWYG editor produces a lightweight, database-friendly JSON layout object. To perform bulk-printing or document assembly (mail-merge style) on your database records, use the headless `StickerPrinter` engine or PDF modules:

```typescript
import { StickerPrinter } from 'react-qr-label';
```

### Bulk Export to PDF
Generate print-ready multi-page PDF documents. 
> [!NOTE]
> PDF generation requires the peer library `jspdf`. Please install it in your project: `npm install jspdf`.

**Option A: Using the `StickerPrinter` class:**
```typescript
import { StickerPrinter } from 'react-qr-label';

const printer = new StickerPrinter();
const pdf = await printer.exportToPDF(layoutJSON, databaseRecords);
pdf.save('bulk-labels.pdf');
```

**Option B: Importing the utility sub-path directly:**
```typescript
import { exportToPDF } from 'react-qr-label/pdf';

const pdf = await exportToPDF(layoutJSON, databaseRecords);
pdf.save('bulk-labels.pdf');
```

### Bulk Export to ZPL (Thermal Printing)
For industrial applications, Zebra thermal printers (and other ZPL-compatible devices) can print layouts at high speeds without standard printer drivers. You can export layout templates directly to raw ZPL instructions:

```typescript
import { StickerPrinter } from 'react-qr-label';

const printer = new StickerPrinter();

// Export layout configuration combined with dynamic array data
const zplPages = printer.exportToZPL(layoutJSON, databaseRecords, { dpi: 203 });

// Join all label pages into a single print job command string
const rawPrintJob = zplPages.join('\n');

// Send rawPrintJob straight to the thermal printer socket (typically port 9100)
```

---

## 📦 Type Definitions (TypeScript)

Full TypeScript typings are exported out of the box to support type safety:

```typescript
export interface StickerLayout {
  id: string;
  name: string;
  width: number;
  height: number;
  unit: 'mm' | 'cm' | 'in' | 'px';
  backgroundColor?: string;
  targetEntity?: string;
  elements: StickerElement[];
}

export interface StickerElement {
  id: string;
  type: 'text' | 'qr';
  x: number;
  y: number;
  w: number;
  h: number;
  content: string;
  qrSeparator?: string;
  style?: {
    fontSize?: number;
    fontWeight?: 'normal' | 'bold';
    textAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
  };
}

export interface EntityField {
  name: string;
  label: string;
}

export interface EntitySchema {
  label: string;
  fields: EntityField[];
  sampleData: Record<string, any>;
}
```

---

## 🎯 Industry Use Cases

* **🏭 Warehousing & Shipping Labels:** Generate ZPL layouts for Zebra printers to output thermal stickers for packages, boxes, and warehouse bins.
* **🏷️ Retail SKU Price Tags:** Build compact price tags containing dynamic item details, barcoded prices, and discount percentages.
* **🎟️ Event Attendance & Visitor Badges:** Design employee identity passes and attendee badges dynamically mapped to registration databases.
* **🔧 Asset & Hardware Inspection Tags:** Generate weather-resistant asset tags equipped with QR codes pointing to online maintenance manuals.

---

## 📄 License
MIT © [Shashidhar Naik](https://github.com/shashi089)
