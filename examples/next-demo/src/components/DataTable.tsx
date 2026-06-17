"use client";

import { useMemo } from "react";
import { Edit2, Trash2 } from "lucide-react";

export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  render?: (value: unknown, item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function DataTable<T>({
  data,
  columns,
  onEdit,
  onDelete,
  keyField,
  selectedIds,
  onSelectionChange,
}: DataTableProps<T>) {
  const isSelectionEnabled = !!onSelectionChange;
  const allIds = useMemo(
    () => data.map((d) => String(d[keyField])),
    [data, keyField],
  );
  const isAllSelected =
    isSelectionEnabled &&
    selectedIds?.length === data.length &&
    data.length > 0;
  const isIndeterminate =
    isSelectionEnabled &&
    (selectedIds?.length ?? 0) > 0 &&
    (selectedIds?.length ?? 0) < data.length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    onSelectionChange(e.target.checked ? allIds : []);
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    if (!onSelectionChange || !selectedIds) return;
    onSelectionChange(
      checked
        ? [...selectedIds, id]
        : selectedIds.filter((selectedId) => selectedId !== id),
    );
  };

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white py-12">
        <p className="text-gray-500">No records found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead className="bg-gray-50 text-sm uppercase tracking-wider text-gray-600">
            <tr>
              {isSelectionEnabled && (
                <th className="w-10 border-b border-gray-200 px-6 py-3">
                  <input
                    type="checkbox"
                    className="cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = !!isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="border-b border-gray-200 px-6 py-3 font-semibold"
                >
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="border-b border-gray-200 px-6 py-3 text-right font-semibold">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => {
              const id = String(item[keyField]);
              const isSelected = selectedIds?.includes(id);

              return (
                <tr
                  key={id}
                  className={`transition-colors hover:bg-gray-50 ${isSelected ? "bg-indigo-50/50" : ""}`}
                >
                  {isSelectionEnabled && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={isSelected}
                        onChange={(e) =>
                          handleSelectRow(id, e.target.checked)
                        }
                      />
                    </td>
                  )}
                  {columns.map((col, idx) => (
                    <td key={idx} className="px-6 py-4 text-sm text-gray-700">
                      {col.render
                        ? col.render(item[col.accessorKey], item)
                        : String(item[col.accessorKey])}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="space-x-2 px-6 py-4 text-right">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="cursor-pointer rounded-lg p-1.5 text-indigo-600 transition-colors hover:bg-indigo-50 hover:text-indigo-800"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="cursor-pointer rounded-lg p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-gray-100 md:hidden">
        {data.map((item) => {
          const id = String(item[keyField]);
          const isSelected = selectedIds?.includes(id);

          return (
            <div key={id} className={`p-4 ${isSelected ? "bg-indigo-50/50" : ""}`}>
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {isSelectionEnabled && (
                    <input
                      type="checkbox"
                      className="cursor-pointer rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={isSelected}
                      onChange={(e) => handleSelectRow(id, e.target.checked)}
                    />
                  )}
                  <div className="flex flex-col gap-1">
                    {columns.map((col, idx) => (
                      <div
                        key={idx}
                        className={
                          idx === 0
                            ? "font-semibold text-gray-900"
                            : "text-sm text-gray-600"
                        }
                      >
                        {idx > 0 && (
                          <span className="mr-1 font-medium text-gray-400">
                            {col.header}:
                          </span>
                        )}
                        {col.render
                          ? col.render(item[col.accessorKey], item)
                          : String(item[col.accessorKey])}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="cursor-pointer rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item)}
                      className="cursor-pointer rounded-lg p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
