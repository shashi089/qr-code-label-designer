# QR Layout Tool

**The open-source QR code label designer for developers. Design once, print everywhere.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/qrlayout-core.svg?label=qrlayout-core)](https://www.npmjs.com/package/qrlayout-core)
[![npm version](https://img.shields.io/npm/v/qrlayout-ui.svg?label=qrlayout-ui)](https://www.npmjs.com/package/qrlayout-ui)
[![npm downloads](https://img.shields.io/npm/dm/qrlayout-core.svg?label=core+downloads)](https://www.npmjs.com/package/qrlayout-core)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-blue.svg)](https://www.typescriptlang.org/)
[![GitHub Stars](https://img.shields.io/github/stars/shashi089/qr-code-label-designer?style=social)](https://github.com/shashi089/qr-code-label-designer/stargazers)

---

## Live Demos

| Framework | Live Demo | Source Code |
| :--- | :--- | :--- |
| **React** | [▶ Open Demo](https://qr-layout-designer.netlify.app/) | [Source](https://github.com/shashi089/qr-code-label-designer/tree/main/examples/react-demo) |
| **Angular** | [▶ Open Demo](https://qr-layout-designer-angular-demo.netlify.app/) | [Source](https://github.com/shashi089/qr-code-label-designer/tree/main/examples/angular-demo) |
| **Svelte 5** | [▶ Open Demo](https://qr-layout-designer-svelte.netlify.app/) | [Source](https://github.com/shashi089/qr-code-label-designer/tree/main/examples/svelte-demo) |
| **Vue 3** | [▶ Open Demo](https://qr-layout-designer-vue.netlify.app/) | [Source](https://github.com/shashi089/qr-code-label-designer/tree/main/examples/vue-demo) |

![QR Layout Designer Screenshot](./assets/layout_designer.png)

---

## What Is This?

**QR Layout Tool** is a complete solution for building applications that generate dynamic, printable QR code labels, stickers, and badges. Unlike basic QR generators that produce a single image, this tool gives you a full layout engine with a visual designer, data binding, and multi-format export.

It is split into two focused npm packages:

| Package | Purpose |
| :--- | :--- |
| [`qrlayout-core`](https://www.npmjs.com/package/qrlayout-core) | Headless rendering engine — use in any JS/TS project |
| [`qrlayout-ui`](https://www.npmjs.com/package/qrlayout-ui) | Embeddable drag-and-drop visual designer |

---

## Quick Start

### Headless (Core only)

```bash
npm install qrlayout-core
```

```typescript
import { StickerPrinter } from "qrlayout-core";

const printer = new StickerPrinter();

const layout = {
  id: "badge",
  name: "Employee Badge",
  width: 100, height: 60, unit: "mm",
  elements: [
    { id: "name", type: "text", x: 5, y: 5, w: 90, h: 12, content: "{{name}}", style: { fontSize: 16, fontWeight: "bold" } },
    { id: "qr",   type: "qr",   x: 35, y: 20, w: 30, h: 30, content: "{{id}}" }
  ]
};

const zplPages = printer.exportToZPL(layout, [
  { name: "Alice",   id: "EMP-001" },
  { name: "Bob",     id: "EMP-002" },
  { name: "Charlie", id: "EMP-003" },
]);
```

### Embedded Visual Designer

```bash
npm install qrlayout-ui qrlayout-core
```

```typescript
import { QRLayoutDesigner } from "qrlayout-ui";
import "qrlayout-ui/style.css";

const designer = new QRLayoutDesigner({
  element: document.getElementById("editor"),
  onSave: (layout) => {
    fetch("/api/layouts", { method: "POST", body: JSON.stringify(layout) });
  }
});
```

### PDF Export (optional)

```bash
npm install jspdf
```

```typescript
import { exportToPDF } from "qrlayout-core/pdf";

const pdf = await exportToPDF(layout, [data1, data2]);
pdf.save("badges.pdf");
```

---

## How It Works

The layout JSON from `qrlayout-ui` is your single source of truth — store it in your database, load it back anytime, and pass it with real records to `qrlayout-core` to generate labels.

```typescript
// Save from the designer
onSave: async (layout) => {
  await fetch("/api/layouts", { method: "POST", body: JSON.stringify(layout) });
}

// Later — fetch and print
const layout  = await fetch("/api/layouts/employee-badge").then(r => r.json());
const records = await fetch("/api/employees").then(r => r.json());

const printer = new StickerPrinter();
const pdf = await printer.exportToPDF(layout, records);
pdf.save("badges.pdf");
```

---

## Use Cases

| Industry | Example |
| :--- | :--- |
| 🏭 Manufacturing & Warehousing | ZPL shipping labels for Zebra printers |
| 🎟️ Events & Conferences | Personalized attendee badge generation |
| 🏥 Healthcare | Patient wristbands and asset tagging |
| 📦 Inventory & Retail | SKU labels with QR codes linking to product pages |
| 🏢 HR & Access Control | Employee ID cards and visitor passes |
| 🔧 MRO / Maintenance | Machine asset tags with scannable maintenance history links |

---

## Project Structure

```
qr-code-label-designer/
├── packages/
│   ├── core/             # qrlayout-core — headless rendering engine
│   ├── ui/               # qrlayout-ui  — visual drag-and-drop designer
│   ├── react-qr-label/
│   ├── vue-qr-label/
│   └── svelte-qr-label/
└── examples/
    ├── react-demo/
    ├── angular-demo/
    ├── svelte-demo/
    └── vue-demo/
```

---

## Packages

| Package | Version | Description | Docs |
| :--- | :--- | :--- | :--- |
| **`qrlayout-core`** | [![npm](https://img.shields.io/npm/v/qrlayout-core.svg)](https://www.npmjs.com/package/qrlayout-core) | Headless rendering & logic engine | [README](./packages/core/README.md) |
| **`qrlayout-ui`** | [![npm](https://img.shields.io/npm/v/qrlayout-ui.svg)](https://www.npmjs.com/package/qrlayout-ui) | Interactive visual designer | [README](./packages/ui/README.md) |
| **`react-qr-label`** | [![npm](https://img.shields.io/npm/v/react-qr-label.svg)](https://www.npmjs.com/package/react-qr-label) | React component wrapper | [README](./packages/react-qr-label/README.md) |
| **`vue-qr-label`** | [![npm](https://img.shields.io/npm/v/vue-qr-label.svg)](https://www.npmjs.com/package/vue-qr-label) | Vue 3 component wrapper | [README](./packages/vue-qr-label/README.md) |
| **`svelte-qr-label`** | [![npm](https://img.shields.io/npm/v/svelte-qr-label.svg)](https://www.npmjs.com/package/svelte-qr-label) | Svelte 5 component wrapper | [README](./packages/svelte-qr-label/README.md) |

---

## Development

```bash
git clone https://github.com/shashi089/qr-code-label-designer.git
cd qr-code-label-designer
npm install

npm run dev:ui      # UI dev server
npm run build:core  # Build core
npm run build:ui    # Build UI
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

---

## Contributing

Contributions, bug reports, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Found a bug or have an idea? [Open an Issue →](https://github.com/shashi089/qr-code-label-designer/issues)

---

## Author

**Shashidhar Naik** — [@shashi089](https://github.com/shashi089)

## 🤝 Contributors

- [@JayanthVishnu](https://github.com/JayanthVishnu)
- [@arun270892](https://github.com/arun270892)

---

## License

MIT © [Shashidhar Naik](https://github.com/shashi089)

---

> Found this useful? Please [⭐ star the repository](https://github.com/shashi089/qr-code-label-designer) — it helps others discover the project!

