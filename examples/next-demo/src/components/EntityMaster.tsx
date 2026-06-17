"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { StickerPrinter } from "qrlayout-core";
import type { StickerLayout } from "qrlayout-ui";
import { DataTable, type Column } from "@/components/DataTable";
import { ExportBar } from "@/components/ExportBar";
import {
  exportToBatchPDFViaApi,
  exportToPNG,
  exportToZPLViaApi,
} from "@/lib/exportUtils";
import { storage } from "@/lib/storage";
import type { EntityType } from "@/lib/types";

interface FormField {
  name: string;
  label: string;
  type?: "text" | "date";
  required?: boolean;
  placeholder?: string;
}

interface EntityMasterProps<T extends { id: string }> {
  entityType: EntityType;
  title: string;
  description: string;
  columns: Column<T>[];
  formFields: FormField[];
  getRecords: () => T[];
  addRecord: (record: T) => void;
  deleteRecord: (id: string) => void;
  buildRecord: (formData: Record<string, string>, editing: T | null) => T;
  exportBaseFilename: string;
  validate?: (formData: Record<string, string>) => boolean;
}

export function EntityMaster<T extends { id: string }>({
  entityType,
  title,
  description,
  columns,
  formFields,
  getRecords,
  addRecord,
  deleteRecord,
  buildRecord,
  exportBaseFilename,
  validate,
}: EntityMasterProps<T>) {
  const [records, setRecords] = useState<T[]>([]);
  const [labels, setLabels] = useState<StickerLayout[]>([]);
  const [selectedLayoutId, setSelectedLayoutId] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<T | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const printer = useRef(new StickerPrinter());

  useEffect(() => {
    storage.initializeDefaults();
    loadData();
  }, []);

  const loadData = () => {
    setRecords(getRecords());
    const entityLabels = storage
      .getLabels()
      .filter((l) => l.targetEntity === entityType);
    setLabels(entityLabels);
    if (entityLabels.length > 0 && !selectedLayoutId) {
      setSelectedLayoutId(entityLabels[0].id);
    }
  };

  const handleOpenModal = (record?: T) => {
    if (record) {
      setEditingRecord(record);
      const initial: Record<string, string> = {};
      formFields.forEach((field) => {
        initial[field.name] = String(
          (record as Record<string, unknown>)[field.name] ?? "",
        );
      });
      setFormData(initial);
    } else {
      setEditingRecord(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setFormData({});
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate && !validate(formData)) return;

    const record = buildRecord(formData, editingRecord);
    addRecord(record);
    loadData();
    handleCloseModal();
  };

  const handleDelete = (record: T) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      deleteRecord(record.id);
      loadData();
      setSelectedIds((prev) => prev.filter((id) => id !== record.id));
    }
  };

  const getSelectedRecords = () =>
    records.filter((r) => selectedIds.includes(r.id));

  const getActiveLayout = () => labels.find((l) => l.id === selectedLayoutId);

  const handleExportPNG = async () => {
    const layout = getActiveLayout();
    const selected = getSelectedRecords();
    if (!layout) return;
    await exportToPNG({
      layout,
      items: selected,
      printer: printer.current,
      baseFilename: exportBaseFilename,
    });
  };

  const handleExportPDF = async () => {
    const layout = getActiveLayout();
    const selected = getSelectedRecords();
    if (!layout) return;
    await exportToBatchPDFViaApi({
      layout,
      items: selected,
      baseFilename: exportBaseFilename,
    });
  };

  const handleExportZPL = async () => {
    const layout = getActiveLayout();
    const selected = getSelectedRecords();
    if (!layout) return;
    await exportToZPLViaApi({
      layout,
      items: selected,
      baseFilename: exportBaseFilename,
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500">{description}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              className="cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-4 pr-10 text-gray-700 shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedLayoutId}
              onChange={(e) => setSelectedLayoutId(e.target.value)}
            >
              <option value="" disabled>
                Select layout template
              </option>
              {labels.map((label) => (
                <option key={label.id} value={label.id}>
                  {label.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
              <svg
                className="h-4 w-4 fill-current"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Record</span>
          </button>
        </div>
      </div>

      <ExportBar
        selectedCount={selectedIds.length}
        hasLayout={!!selectedLayoutId}
        onExportPNG={handleExportPNG}
        onExportPDF={handleExportPDF}
        onExportZPL={handleExportZPL}
      />

      <DataTable
        data={records}
        columns={columns}
        keyField="id"
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRecord ? "Edit Record" : "Add Record"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="cursor-pointer rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 p-6">
              {formFields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                  <input
                    type={field.type ?? "text"}
                    required={field.required}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                    value={formData[field.name] ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    placeholder={field.placeholder}
                  />
                </div>
              ))}

              <div className="mt-2 flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 cursor-pointer rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
