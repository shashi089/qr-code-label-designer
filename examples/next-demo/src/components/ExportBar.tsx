"use client";

import { FileText, Image as ImageIcon, Info, Printer } from "lucide-react";

interface ExportBarProps {
  selectedCount: number;
  hasLayout: boolean;
  onExportPNG: () => void;
  onExportPDF: () => void;
  onExportZPL: () => void;
}

export function ExportBar({
  selectedCount,
  hasLayout,
  onExportPNG,
  onExportPDF,
  onExportZPL,
}: ExportBarProps) {
  if (selectedCount === 0) {
    return (
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
        <Info className="mt-0.5 shrink-0 text-indigo-600" size={20} />
        <div className="text-sm text-indigo-900">
          <p className="font-semibold">Batch export instructions</p>
          <ol className="ml-4 mt-1 list-decimal space-y-0.5 text-indigo-800">
            <li>
              Select a <strong>layout template</strong> from the dropdown above.
            </li>
            <li>Check one or more records in the table.</li>
            <li>
              Use <strong>PNG</strong> for instant browser preview, or{" "}
              <strong>PDF / ZPL</strong> via Next.js API routes (server-side).
            </li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-violet-100 bg-violet-50 p-4">
      <div className="flex items-center gap-2 text-violet-900">
        <span className="rounded bg-violet-100 px-2 py-0.5 text-sm font-semibold">
          {selectedCount}
        </span>
        <span className="font-medium">selected</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExportPNG}
          disabled={!hasLayout}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-indigo-200 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
          title="Download as PNG (client-side)"
        >
          <ImageIcon size={16} />
          PNG
        </button>
        <button
          onClick={onExportPDF}
          disabled={!hasLayout}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-red-200 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
          title="Download PDF via /api/export/pdf"
        >
          <FileText size={16} />
          PDF
        </button>
        <button
          onClick={onExportZPL}
          disabled={!hasLayout}
          className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
          title="Download ZPL via /api/export/zpl"
        >
          <Printer size={16} />
          ZPL
        </button>
      </div>
    </div>
  );
}
