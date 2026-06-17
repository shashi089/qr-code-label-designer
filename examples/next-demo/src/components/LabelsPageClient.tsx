"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Layout, Plus, Smartphone } from "lucide-react";
import type { StickerLayout } from "qrlayout-ui";
import { DataTable, type Column } from "@/components/DataTable";
import { storage } from "@/lib/storage";

export function LabelsPageClient() {
  const router = useRouter();
  const [labels, setLabels] = useState<StickerLayout[]>([]);

  useEffect(() => {
    storage.initializeDefaults();
    setLabels(storage.getLabels());
  }, []);

  const handleDelete = (label: StickerLayout) => {
    if (confirm(`Delete template "${label.name}"?`)) {
      storage.deleteLabel(label.id);
      setLabels(storage.getLabels());
    }
  };

  const columns: Column<StickerLayout>[] = [
    {
      header: "Template Name",
      accessorKey: "name",
      render: (_val, item) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <Layout size={20} />
          </div>
          <div className="font-semibold text-gray-900">{item.name}</div>
        </div>
      ),
    },
    {
      header: "Target Entity",
      accessorKey: "targetEntity",
      render: (val) => (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
          <Smartphone size={12} />
          {String(val || "none")}
        </span>
      ),
    },
    {
      header: "Dimensions",
      accessorKey: "width",
      render: (_val, item) => (
        <span className="font-mono text-sm text-gray-600">
          {item.width}
          {item.unit} × {item.height}
          {item.unit}
        </span>
      ),
    },
    {
      header: "Elements",
      accessorKey: "elements",
      render: (val) => (
        <span className="rounded border border-gray-100 bg-gray-50 px-2 py-1 text-sm text-gray-600">
          {Array.isArray(val) ? val.length : 0} items
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Label Templates
          </h1>
          <p className="mt-1 text-gray-500">
            Design badges, session signs, and booth labels for your event
          </p>
        </div>
        <button
          onClick={() => router.push("/labels/designer")}
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-md active:scale-95"
        >
          <Plus size={20} />
          <span>Create New Label</span>
        </button>
      </div>

      <DataTable
        data={labels}
        columns={columns}
        keyField="id"
        onEdit={(label) => router.push(`/labels/designer?id=${label.id}`)}
        onDelete={handleDelete}
      />
    </div>
  );
}
