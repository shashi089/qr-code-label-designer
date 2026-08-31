<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, ref, watch } from 'vue';
import { Edit2, Trash2 } from 'lucide-vue-next';

export interface Column<T> {
  header: string;
  accessorKey: keyof T;
  render?: (value: any, item: T) => string;
}

interface Props {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  selectedIds?: string[];
  showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selectedIds: () => [],
  showActions: true
});

const emit = defineEmits<{
  (e: 'edit', item: T): void;
  (e: 'delete', item: T): void;
  (e: 'update:selectedIds', selectedIds: string[]): void;
  (e: 'selectionChange', selectedIds: string[]): void;
}>();

const headerCheckboxRef = ref<HTMLInputElement | null>(null);

const allIds = computed<string[]>(() => props.data.map((d: T) => String(d[props.keyField])));
const isAllSelected = computed<boolean>(() => {
  return props.data.length > 0 && props.selectedIds.length === props.data.length;
});
const isIndeterminate = computed<boolean>(() => {
  return props.selectedIds.length > 0 && props.selectedIds.length < props.data.length;
});

watch(isIndeterminate, (val: boolean) => {
  if (headerCheckboxRef.value) {
    headerCheckboxRef.value.indeterminate = val;
  }
});

function handleSelectAll(e: Event) {
  const target = e.target as HTMLInputElement;
  const newSelection = target.checked ? [...allIds.value] : [];
  emit('update:selectedIds', newSelection);
  emit('selectionChange', newSelection);
}

function handleSelectRow(id: string, checked: boolean) {
  let newSelection: string[];
  if (checked) {
    newSelection = [...props.selectedIds, id];
  } else {
    newSelection = props.selectedIds.filter((selectedId: string) => selectedId !== id);
  }
  emit('update:selectedIds', newSelection);
  emit('selectionChange', newSelection);
}

function isRowSelected(id: string): boolean {
  return props.selectedIds.includes(id);
}
</script>

<template>
  <div>
    <div v-if="data.length === 0" class="flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
      <p class="text-gray-500">No records found</p>
    </div>

    <div v-else class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <!-- Table View - Hidden on mobile, shown on md+ -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
            <tr>
              <th class="px-6 py-3 border-b border-gray-200 w-10">
                <input
                  ref="headerCheckboxRef"
                  type="checkbox"
                  class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  :checked="isAllSelected"
                  @change="handleSelectAll"
                />
              </th>
              <th
                v-for="(col, idx) in columns"
                :key="idx"
                class="px-6 py-3 font-semibold border-b border-gray-200"
              >
                {{ col.header }}
              </th>
              <th v-if="showActions" class="px-6 py-3 font-semibold border-b border-gray-200 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="item in data"
              :key="String(item[keyField])"
              class="hover:bg-gray-50 transition-colors"
              :class="{ 'bg-emerald-50/50': isRowSelected(String(item[keyField])) }"
            >
              <td class="px-6 py-4">
                <input
                  type="checkbox"
                  class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  :checked="isRowSelected(String(item[keyField]))"
                  @change="(e: Event) => handleSelectRow(String(item[keyField]), (e.target as HTMLInputElement).checked)"
                />
              </td>
              <td
                v-for="(col, idx) in columns"
                :key="idx"
                class="px-6 py-4 text-sm text-gray-700"
              >
                <slot :name="`col-${String(col.accessorKey)}`" :item="item" :value="item[col.accessorKey]">
                  {{ col.render ? col.render(item[col.accessorKey], item) : String(item[col.accessorKey] ?? '') }}
                </slot>
              </td>
              <td v-if="showActions" class="px-6 py-4 text-right space-x-2">
                <button
                  @click="emit('edit', item)"
                  class="text-emerald-600 hover:text-emerald-800 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <Edit2 :size="16" />
                </button>
                <button
                  @click="emit('delete', item)"
                  class="text-red-600 hover:text-red-800 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <Trash2 :size="16" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Card View - Shown on small screens, hidden on md+ -->
      <div class="md:hidden divide-y divide-gray-100">
        <div
          v-for="item in data"
          :key="String(item[keyField])"
          class="p-4"
          :class="{ 'bg-emerald-50/50': isRowSelected(String(item[keyField])) }"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <input
                type="checkbox"
                class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                :checked="isRowSelected(String(item[keyField]))"
                @change="(e: Event) => handleSelectRow(String(item[keyField]), (e.target as HTMLInputElement).checked)"
              />
              <div class="flex flex-col gap-1">
                <div
                  v-for="(col, idx) in columns"
                  :key="idx"
                  :class="idx === 0 ? 'font-semibold text-gray-900' : 'text-sm text-gray-600'"
                >
                  <span v-if="idx > 0" class="text-gray-400 font-medium mr-1">{{ col.header }}:</span>
                  <slot :name="`col-${String(col.accessorKey)}`" :item="item" :value="item[col.accessorKey]">
                    {{ col.render ? col.render(item[col.accessorKey], item) : String(item[col.accessorKey] ?? '') }}
                  </slot>
                </div>
              </div>
            </div>
            <div v-if="showActions" class="flex gap-1 shrink-0">
              <button
                @click="emit('edit', item)"
                class="text-emerald-600 p-2 rounded-lg hover:bg-emerald-50 cursor-pointer"
              >
                <Edit2 :size="18" />
              </button>
              <button
                @click="emit('delete', item)"
                class="text-red-600 p-2 rounded-lg hover:bg-red-50 cursor-pointer"
              >
                <Trash2 :size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
