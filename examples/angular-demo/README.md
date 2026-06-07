# QR Layout Demo Application (Angular)

A comprehensive Angular application demonstrating the capabilities of the `qrlayout-ui` and `qrlayout-core` packages. This demo showcases a full-featured QR code badge implementation with design, management, and export capabilities for both employees and machines.

### 🌐 Live Demo
You can view the live application deployed on Netlify here:
👉 **[QR Layout Designer - Angular Demo](https://qr-layout-designer-angular-demo.netlify.app/)**

---

## Features

### 1. Label Designer (`labels/designer`)
- **Visual Editor**: Drag-and-drop interactive workspace to design custom badge/sticker layouts.
- **Rich Elements**: Drag, resize, and position labels, QR codes, texts, etc.
- **Customization**: Fine-tune properties like text content, font size, margins, canvas height/width, padding, and positioning.
- **Persistence**: Easily save and load layouts locally using `localStorage`.

### 2. Master Data Management
- **Employee Master**: CRUD operations to manage employee details (Name, ID, Department, Designation, etc.).
- **Machine Master**: CRUD operations to manage machine profiles (Name, ID, Department, Line, Status, etc.).
- **Search & Filtering**: Search and filter options to manage large datasets.

### 3. Batch Export & Printing
- **Template Selection**: Select a custom template layout from your saved designs.
- **Individual/Batch Print**: Print high-quality labels for a single record or select multiple records for bulk action.
- **Export Options**:
    - **PNG**: Download high-resolution badge images.
    - **PDF**: Generate perfectly aligned printable PDF documents.
    - **ZPL**: Generate industrial-grade Zebra Programming Language (ZPL) printer code.

### 4. Storage Utility
- **Backup & Restore**: Export entire local database (layouts, employees, machines) as a JSON file, or restore/import a backup.
- **Reset Options**: Wipe storage completely or reset to default demo data.

---

## Tech Stack
- **Framework**: Angular 19 (Standalone components)
- **Styling**: Tailwind CSS 4 + `@tailwindcss/vite`
- **Icons**: Lucide Angular
- **Core Libraries**: `qrlayout-core`, `qrlayout-ui`

---

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- `npm`

### Installation

1. Navigate to the project root:
   ```bash
   cd examples/angular-demo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run start
   ```
   Open your browser and navigate to `http://localhost:4200/`.

---

## Usage Guide

### Designing a Badge
1. Navigate to the **"Labels"** tab.
2. Click **"New Layout"** to launch the designer.
3. Drag elements onto the canvas and adjust their properties in the sidebar panel.
4. Click **"Save Layout"** to persist your design.

### Managing Masters
1. Navigate to the **"Employees"** or **"Machines"** tab.
2. Use **"Add Employee"** or **"Add Machine"** to input records.
3. Edit or delete existing records dynamically from the table view.

### Batch Printing
1. Navigate to either the **"Employees"** or **"Machines"** tab.
2. Select a **Layout Template** from the dropdown selector at the top.
3. Check the boxes next to the records you wish to print.
4. Click **PNG**, **PDF**, or **ZPL** in the bulk actions bar to export the selected badges.

---

## Project Structure

```
src/app/
├── components/     # Application views and reusable controls
│   ├── designer/   # Custom drag-and-drop sticker builder workspace
│   ├── employees/  # Employee list and forms
│   ├── home/       # Home dashboard
│   ├── labels/     # Layout template catalog
│   ├── machines/   # Machine list and forms
│   ├── storage/    # Backup, import, and reset utilities
│   └── table/      # Reusable table control
├── services/       # Local database and layout services
├── app.routes.ts   # Client-side SPA routes
└── app.config.ts   # Configuration provider setup
```

---

## License
MIT
