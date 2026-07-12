# Contributing to QR Code Layout Generate Tool

Thank you for your interest in contributing! This document covers local setup, project structure, and the PR checklist.

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm 9+ (workspace support required)

### First-time setup

```bash
git clone https://github.com/shashi089/qr-code-label-designer.git
cd qr-code-label-designer

# Install all workspace dependencies
npm install

# Build the core and ui packages (examples depend on these)
npm run build:core
npm run build:ui
```

### Running examples

```bash
# React demo (workspace-linked)
npm run dev:react

# Next.js demo
npm run dev:next

# Vue demo
cd examples/vue-demo && npm install && npm run dev

# Svelte demo
cd examples/svelte-demo && npm install && npm run dev

# Angular demo
cd examples/angular-demo && npm install && npm start
```

### Running tests

```bash
# Core unit tests (vitest)
npm run test:core

# Watch mode
npm --workspace packages/core run test:watch
```

---

## Project Structure

```
qr-code-label-designer/
├── packages/
│   ├── core/                  # qrlayout-core — headless engine (render, PDF, ZPL, PNG)
│   ├── ui/                    # qrlayout-ui — drag-and-drop designer (vanilla TS)
│   ├── react-qr-label/        # React wrapper component
│   ├── vue-qr-label/          # Vue 3 wrapper component
│   ├── svelte-qr-label/       # Svelte 5 wrapper component
├── examples/
│   ├── react-demo/
│   ├── react-qr-label-demo/
│   ├── vue-demo/
│   ├── svelte-demo/
│   ├── angular-demo/
│   └── next-demo/
├── CHANGELOG.md
├── ROADMAP.md
└── CONTRIBUTING.md
```

### Key concepts

| Term | What it is |
|---|---|
| `StickerLayout` | JSON template with `{{variable}}` placeholders — the design |
| `StickerElement` | A single element: `"text"` or `"qr"`, with position / size / style |
| `StickerPrinter` | Headless renderer: `renderToCanvas`, `exportToPDF`, `exportToZPL`, `exportImages` |
| `QRLayoutDesigner` | Vanilla TypeScript drag-and-drop designer class |
| `toPx(value, unit)` | Converts mm/cm/in → CSS pixels at 96 DPI |
| `fontSize` | Always **points (pt)** across all three renderers (PNG/PDF/ZPL) |

---

## Which Package to Edit?

| What you're changing | Package |
|---|---|
| Rendering logic (canvas, PDF, ZPL) | `packages/core` |
| Designer UI (drag-drop, sidebar, panel) | `packages/ui` |
| React component wrapper | `packages/react-qr-label` |
| Vue component wrapper | `packages/vue-qr-label` |
| Svelte component wrapper | `packages/svelte-qr-label` |

---

## Before Submitting a PR

1. **Build affected packages** — `npm run build:core` / `npm run build:ui` as needed
2. **Run tests** — `npm run test:core` must pass (0 failures)
3. **TypeScript must be clean** — no new `tsc` errors in changed packages
4. **No `console.log` left in committed code**
5. **Update `CHANGELOG.md`** — add a line under `[Unreleased]`

### PR checklist

- [ ] Scoped to one concern (bug fix / feature / refactor — not all three)
- [ ] Tests added or updated for any changed `packages/core` logic
- [ ] No new TypeScript errors introduced
- [ ] `CHANGELOG.md` updated
- [ ] PR description explains the *why*, not just the *what*

---

## Coding Conventions

- **TypeScript** — all packages use TypeScript; `strict: false` but avoid `any` in new code
- **Comments** — only when the *why* is non-obvious; no multi-line blocks or docblock novels
- **`fontSize`** — always points (pt); canvas converts internally via `pt × (96/72)`
- **`toPx` / `toDots`** — use exported utilities from `packages/core/src/utils/`; never re-implement
- **`parseContent`** — use exported utility from `packages/core/src/utils/parse.ts`
- **No extra runtime deps in `packages/core`** — core must remain lightweight
- **Undo-safe mutations in `packages/ui`** — call `this.snapshot()` before any layout mutation

---

## Reporting Bugs

Open an issue at https://github.com/shashi089/qr-code-label-designer/issues with:

- Steps to reproduce
- Expected vs actual behaviour
- Browser + Node.js version
- Minimal code example

---

*Maintained by Shashidhar Naik — all contributions welcome!*
