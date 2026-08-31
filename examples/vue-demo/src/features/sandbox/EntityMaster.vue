<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  Plus,
  X,
  Printer,
  FileText,
  Image as ImageIcon,
  Info,
  Code,
  Copy,
  Check,
  Terminal,
  Eye,
} from 'lucide-vue-next';
import { storage } from '../../services/storage';
import Table, { type Column } from '../../components/Table.vue';
import { StickerPrinter, type StickerLayout } from 'vue-qr-label';
import { exportToPNG, exportToBatchPDF, exportToZPLFile } from '../../services/exportUtils';

interface Props {
  layout: StickerLayout;
}

const props = defineProps<Props>();

interface EntityMeta {
  label: string;
  columns: Column<any>[];
  getItems: () => any[];
  addItem: (item: any) => void;
  deleteItem: (id: string) => void;
  defaultFormValues: Record<string, string>;
  fields: { name: string; label: string; placeholder?: string; type?: string }[];
}

const ENTITY_METADATA: Record<string, EntityMeta> = {
  employee: {
    label: 'Employee',
    columns: [
      { header: 'Employee ID', accessorKey: 'employeeId' },
      { header: 'Full Name', accessorKey: 'fullName' },
      { header: 'Department', accessorKey: 'department' },
      { header: 'Join Date', accessorKey: 'joinDate' },
    ],
    getItems: () => storage.getEmployees(),
    addItem: (item) => storage.addEmployee(item),
    deleteItem: (id) => storage.deleteEmployee(id),
    defaultFormValues: { fullName: '', employeeId: '', department: '', joinDate: new Date().toISOString().split('T')[0] || '' },
    fields: [
      { name: 'fullName', label: 'Full Name', placeholder: 'e.g. Kashinath Hosapeti', type: 'text' },
      { name: 'employeeId', label: 'Employee ID', placeholder: 'e.g. EMP-001', type: 'text' },
      { name: 'department', label: 'Department', placeholder: 'e.g. Engineering', type: 'text' },
      { name: 'joinDate', label: 'Join Date', type: 'date' },
    ]
  },
  machine: {
    label: 'Machine',
    columns: [
      { header: 'Machine Code', accessorKey: 'machineCode' },
      { header: 'Machine Name', accessorKey: 'machineName' },
      { header: 'Location', accessorKey: 'location' },
      { header: 'Model', accessorKey: 'model' },
    ],
    getItems: () => storage.getMachines(),
    addItem: (item) => storage.addMachine(item),
    deleteItem: (id) => storage.deleteMachine(id),
    defaultFormValues: { machineName: '', machineCode: '', location: '', model: '' },
    fields: [
      { name: 'machineName', label: 'Machine Name', placeholder: 'e.g. CNC Milling Machine', type: 'text' },
      { name: 'machineCode', label: 'Machine Code', placeholder: 'e.g. MC-101', type: 'text' },
      { name: 'location', label: 'Location', placeholder: 'e.g. Shop Floor A', type: 'text' },
      { name: 'model', label: 'Model', placeholder: 'e.g. XYZ-2000', type: 'text' },
    ]
  }
};

const targetEntity = computed<string>(() => props.layout.targetEntity || 'employee');
const meta = computed<EntityMeta>(() => {
  const entity = targetEntity.value;
  return (ENTITY_METADATA[entity] || ENTITY_METADATA.employee)!;
});

const items = ref<any[]>([]);
const selectedIds = ref<string[]>([]);
const isModalOpen = ref(false);
const editingItem = ref<any | null>(null);
const formData = ref<Record<string, string>>({});

// Developer panel state
const showDevPanel = ref(false);
const codeTab = ref<'vue' | 'headless' | 'json'>('vue');
const copied = ref(false);

const printer = new StickerPrinter();

function loadData() {
  items.value = meta.value.getItems();
}

watch(
  () => [props.layout.id, targetEntity.value],
  () => {
    loadData();
    selectedIds.value = [];
  },
  { immediate: true }
);

function handleOpenModal(item?: any) {
  if (item) {
    editingItem.value = item;
    formData.value = { ...item };
  } else {
    editingItem.value = null;
    formData.value = { ...meta.value.defaultFormValues };
  }
  isModalOpen.value = true;
}

function handleCloseModal() {
  isModalOpen.value = false;
  editingItem.value = null;
  formData.value = {};
}

function handleSave() {
  const hasRequired = meta.value.fields.every(f => !f.placeholder || formData.value[f.name]);
  if (!hasRequired) return;

  const newItem = {
    id: editingItem.value?.id || crypto.randomUUID(),
    ...formData.value
  };

  meta.value.addItem(newItem);
  loadData();
  handleCloseModal();
}

function handleDelete(item: any) {
  const identifier = item.fullName || item.machineName || 'this item';
  if (window.confirm(`Are you sure you want to delete ${identifier}?`)) {
    meta.value.deleteItem(item.id);
    loadData();
    selectedIds.value = selectedIds.value.filter((id: string) => id !== item.id);
  }
}

function getSelectedItems(): any[] {
  return items.value.filter((item: any) => selectedIds.value.includes(item.id));
}

async function handleExportPNG() {
  const selected = getSelectedItems();
  if (selected.length === 0) return;

  await exportToPNG({
    layout: props.layout,
    items: selected,
    printer,
    baseFilename: `${targetEntity.value}-label`
  });
}

async function handleExportPDF() {
  const selected = getSelectedItems();
  if (selected.length === 0) return;

  await exportToBatchPDF({
    layout: props.layout,
    items: selected,
    printer,
    baseFilename: `batch-${targetEntity.value}-labels`
  });
}

function handleExportZPL() {
  const selected = getSelectedItems();
  if (selected.length === 0) return;

  exportToZPLFile({
    layout: props.layout,
    items: selected,
    printer,
    baseFilename: `batch-${targetEntity.value}-labels`
  });
}

// --- Dynamic Code Generators ---
const vueCode = computed(() => `<script setup lang="ts">
import { ref } from 'vue';
import { QRLabelDesigner, type StickerLayout } from 'vue-qr-label';
import 'vue-qr-label/style.css';

// Visual design template JSON
const layout = ref<StickerLayout>(${JSON.stringify(props.layout, null, 2)});

const schemas = {
  ${targetEntity.value}: {
    label: '${meta.value.label} Master',
    fields: [
${meta.value.fields.map(f => `      { name: '${f.name}', label: '${f.label}' }`).join(',\n')}
    ],
    sampleData: {
${meta.value.fields.map(f => `      ${f.name}: '${f.placeholder ? f.placeholder.replace('e.g. ', '') : 'Value'}'`).join(',\n')}
    }
  }
};

function handleSave(savedLayout: StickerLayout) {
  console.log('Saved Layout:', savedLayout);
  layout.value = savedLayout;
}
<\/script>

<template>
  <div style="width: 100vw; height: 100vh; position: relative;">
    <QRLabelDesigner
      style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;"
      :initial-layout="layout"
      :entity-schemas="schemas"
      @save="handleSave"
    />
  </div>
</template>`);

const headlessCode = computed(() => `import { StickerPrinter } from 'vue-qr-label';
import { exportToPDF } from 'vue-qr-label/pdf'; // PDF sub-path export

const printer = new StickerPrinter();
const layout = ${JSON.stringify(props.layout, null, 2)};

// Your datasets to inject into variables like {{variableName}}
const dataset = [
  {
    id: '1',
${meta.value.fields.map(f => `    ${f.name}: '${f.placeholder ? f.placeholder.replace('e.g. ', '') : 'Value'}'`).join(',\n')}
  }
];

// ─── Render to PNG (works in browser) ────────────────────────
const dataUrl = await printer.renderToDataURL(layout, dataset[0], { format: 'png' });

// ─── Export Batch PDF (requires jspdf) ───────────────────────
const pdf = await exportToPDF(layout, dataset);
pdf.save('labels.pdf');

// ─── Export ZPL (send to Zebra/thermal socket) ───────────────
const zplArray = printer.exportToZPL(layout, dataset);
console.log(zplArray.join('\\n'));
`);

const activeCode = computed(() => {
  if (codeTab.value === 'vue') return vueCode.value;
  if (codeTab.value === 'headless') return headlessCode.value;
  return JSON.stringify(props.layout, null, 2);
});

function handleCopy() {
  navigator.clipboard.writeText(activeCode.value);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}

const hasSelection = computed(() => selectedIds.value.length > 0);
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- Left/Main Content: Database grid & Batch Print -->
    <div :class="[showDevPanel ? 'lg:col-span-7' : 'lg:col-span-12', 'space-y-6 transition-all duration-300 w-full']">
      <!-- Header card -->
      <div class="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2 border border-emerald-100">
            Schema: {{ meta.label }}
          </span>
          <h3 class="text-xl font-bold text-gray-900">Sandbox Database</h3>
          <p class="text-sm text-gray-500">Inject test records into variables & batch export labels</p>
        </div>

        <div class="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <button
            @click="showDevPanel = !showDevPanel"
            class="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all border text-sm cursor-pointer"
            :class="[
              showDevPanel
                ? 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-xs'
            ]"
          >
            <Code :size="16" />
            <span>{{ showDevPanel ? 'Hide Dev Studio' : 'Show Dev Studio' }}</span>
          </button>

          <button
            @click="() => handleOpenModal()"
            class="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md cursor-pointer text-sm shrink-0"
          >
            <Plus :size="16" />
            <span>Add {{ meta.label }}</span>
          </button>
        </div>
      </div>

      <!-- Batch Action Bar -->
      <div
        v-if="hasSelection"
        class="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 animate-in slide-in-from-top-2"
      >
        <div class="flex items-center gap-2 text-teal-900">
          <span class="font-semibold bg-teal-100 px-2.5 py-1 rounded-lg text-sm text-teal-700">
            {{ selectedIds.length }} Selected
          </span>
          <span class="font-medium text-sm">ready for merge-print</span>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="handleExportPNG"
            class="flex items-center gap-2 bg-white text-gray-700 hover:text-emerald-600 border border-gray-200 hover:border-emerald-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Download PNG Images"
          >
            <ImageIcon :size="14" />
            <span>PNG</span>
          </button>
          <button
            @click="handleExportPDF"
            class="flex items-center gap-2 bg-white text-gray-700 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Download PDF"
          >
            <FileText :size="14" />
            <span>PDF</span>
          </button>
          <button
            @click="handleExportZPL"
            class="flex items-center gap-2 bg-white text-gray-700 hover:text-black border border-gray-200 hover:border-gray-400 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            title="Download ZPL file"
          >
            <Printer :size="14" />
            <span>ZPL</span>
          </button>
        </div>
      </div>
      <div v-else class="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-4 flex items-start gap-3">
        <Info class="text-emerald-600 shrink-0 mt-0.5" :size="18" />
        <p class="text-xs text-emerald-900 leading-relaxed">
          <strong>To print labels:</strong> Check the box next to one or more {{ meta.label.toLowerCase() }}s in the database grid below to open batch export controls.
        </p>
      </div>

      <!-- Table card -->
      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
        <Table
          :data="items"
          :columns="meta.columns"
          key-field="id"
          :selected-ids="selectedIds"
          @update:selected-ids="selectedIds = $event"
          @edit="handleOpenModal"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- Right Side: Developer Integration & Live Code Snippets -->
    <div v-if="showDevPanel" class="lg:col-span-5 space-y-6 animate-in slide-in-from-right-5 duration-300 w-full">
      <div class="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden flex flex-col h-[600px]">
        <div class="p-5 border-b border-gray-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Code class="text-emerald-600" :size="20" />
            <h3 class="font-bold text-gray-900">Developer Studio</h3>
          </div>
          <button
            @click="handleCopy"
            class="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-all font-medium cursor-pointer shadow-sm"
          >
            <template v-if="copied">
              <Check :size="14" class="text-emerald-600" />
              <span>Copied!</span>
            </template>
            <template v-else>
              <Copy :size="14" />
              <span>Copy Code</span>
            </template>
          </button>
        </div>

        <!-- Tab Navigation -->
        <div class="flex bg-gray-50 border-b border-gray-100 p-1">
          <button
            @click="codeTab = 'vue'"
            class="flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            :class="[codeTab === 'vue' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900']"
          >
            <Eye :size="13" />
            <span>Vue Embed</span>
          </button>
          <button
            @click="codeTab = 'headless'"
            class="flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            :class="[codeTab === 'headless' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900']"
          >
            <Terminal :size="13" />
            <span>Headless Print</span>
          </button>
          <button
            @click="codeTab = 'json'"
            class="flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            :class="[codeTab === 'json' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-900']"
          >
            <Code :size="13" />
            <span>Layout Schema</span>
          </button>
        </div>

        <!-- Live Editor Snippet -->
        <div class="flex-1 bg-gray-950 p-4 font-mono text-xs overflow-y-auto text-gray-300 select-all scrollbar-thin">
          <pre class="whitespace-pre">{{ activeCode }}</pre>
        </div>
      </div>
    </div>

    <!-- Modal Overlay -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all border border-gray-100">
        <!-- Modal Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900">
            {{ editingItem ? `Edit ${meta.label}` : `Add New ${meta.label}` }}
          </h3>
          <button
            @click="handleCloseModal"
            class="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X :size="18" />
          </button>
        </div>

        <!-- Modal Body -->
        <form @submit.prevent="handleSave" class="p-6 space-y-4">
          <div v-for="f in meta.fields" :key="f.name" class="space-y-1.5">
            <label class="block text-sm font-semibold text-gray-700">{{ f.label }}</label>
            <input
              :type="f.type || 'text'"
              :required="!!f.placeholder"
              class="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm shadow-xs"
              v-model="formData[f.name]"
              :placeholder="f.placeholder || ''"
            />
          </div>

          <!-- Modal Footer -->
          <div class="flex gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              @click="handleCloseModal"
              class="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold shadow-sm transition-colors text-sm cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
