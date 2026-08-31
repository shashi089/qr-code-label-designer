<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { QRLabelDesigner, type EntitySchema, type StickerLayout } from 'vue-qr-label';
import 'vue-qr-label/style.css';
import './style.css';
import LabelList from './features/labels/LabelList.vue';
import LandingPage from './features/home/LandingPage.vue';
import DocsPage from './features/docs/DocsPage.vue';
import { storage } from './services/storage';
import { ArrowLeft, Home, Github, BookOpen, Layers } from 'lucide-vue-next';

// Sample Schema (mapped to designer variables)
const SAMPLE_SCHEMAS: Record<string, EntitySchema> = {
  employee: {
    label: "Employee Master",
    fields: [
      { name: "fullName", label: "Full Name" },
      { name: "employeeId", label: "Employee ID" },
      { name: "department", label: "Department" },
      { name: "joinDate", label: "Join Date" },
    ],
    sampleData: {
      fullName: "Arjun Mehta",
      employeeId: "EMP-001",
      department: "Operations",
      joinDate: "2023-01-10"
    }
  },
  machine: {
    label: "Machine Master",
    fields: [
      { name: "machineName", label: "Machine Name" },
      { name: "machineCode", label: "Machine Code" },
      { name: "location", label: "Location" },
      { name: "model", label: "Model" },
    ],
    sampleData: {
      machineName: "CNC Router X1",
      machineCode: "CNC-01",
      location: "Section A",
      model: "2024-Pro"
    }
  }
};

// Initial Default Layout for New Labels
const DEFAULT_NEW_LAYOUT: Omit<StickerLayout, 'id'> = {
  name: "New QR Label",
  targetEntity: "employee",
  width: 100,
  height: 60,
  unit: "mm",
  backgroundColor: "#ffffff",
  elements: []
};

type MainView = 'home' | 'docs' | 'labels';
type SubView = 'list' | 'designer';

const mainView = ref<MainView>('home');
const subView = ref<SubView>('list');
const labels = ref<StickerLayout[]>([]);
const editingLayout = ref<StickerLayout | null>(null);

onMounted(() => {
  storage.initializeDefaults();
  labels.value = storage.getLabels();
});

function handleCreateNew() {
  editingLayout.value = { ...DEFAULT_NEW_LAYOUT, id: crypto.randomUUID() } as StickerLayout;
  subView.value = 'designer';
}

function handleEdit(layout: StickerLayout) {
  editingLayout.value = layout;
  subView.value = 'designer';
}

function handleDelete(id: string) {
  storage.deleteLabel(id);
  labels.value = storage.getLabels();
}

function handleBackToList() {
  subView.value = 'list';
  editingLayout.value = null;
}

function handleMainViewChange(view: MainView) {
  mainView.value = view;
  subView.value = 'list';
}

function handleLoadPreset(presetId: string) {
  storage.initializeDefaults();
  const defaultLabels = storage.getLabels();
  const preset = defaultLabels.find(l => l.id === presetId);
  if (preset) {
    editingLayout.value = preset;
    subView.value = 'designer';
    mainView.value = 'labels';
  }
}

function handleSaveLayout(layout: StickerLayout) {
  console.log(layout, "layout");
  storage.addLabel(layout);
  labels.value = storage.getLabels();
  subView.value = 'list';
  editingLayout.value = null;
}

function handleClearData() {
  if (confirm('Are you sure? This will delete all custom layouts and test records.')) {
    storage.clearAll();
    labels.value = [];
    window.location.reload();
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- If acting as Designer, cover full screen -->
    <div v-if="subView === 'designer'" class="fixed inset-0 z-50 bg-white">
      <button
        @click="handleBackToList"
        class="fixed top-4 left-4 z-[9999] flex items-center gap-2 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium shadow-md transition-all border border-gray-200 cursor-pointer text-sm"
      >
        <ArrowLeft :size="16" />
        <span>Back to Studio</span>
      </button>
      <QRLabelDesigner
        style="position: absolute; top: 0; left: 0; right: 0; bottom: 0;"
        class="designer-container"
        :entity-schemas="SAMPLE_SCHEMAS"
        :initial-layout="editingLayout || ({ ...DEFAULT_NEW_LAYOUT, id: 'temp-new-layout' } as StickerLayout)"
        @save="handleSaveLayout"
      />
    </div>

    <!-- Main Application Views -->
    <template v-else>
      <!-- Navigation Bar -->
      <div class="bg-white border-b border-gray-200 shadow-xs sticky top-0 z-40 backdrop-blur-lg bg-white/95">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col lg:flex-row items-center justify-between py-4 gap-4">
            <!-- Logo and Mobile Actions -->
            <div class="flex items-center justify-between w-full lg:w-auto gap-3">
              <div class="flex items-center gap-3">
                <div class="p-2 sm:p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-md shrink-0">
                  <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
                <div>
                  <h1 class="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate max-w-[150px] sm:max-w-full">
                    QR Label Designer
                  </h1>
                  <div class="flex items-center gap-2">
                    <p class="text-[10px] sm:text-xs text-gray-500 hidden sm:block">by</p>
                    <a
                      href="https://github.com/shashi089"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-[10px] sm:text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      @shashi089
                    </a>
                  </div>
                </div>
              </div>

              <!-- Mobile Clear Data Action -->
              <button
                @click="handleClearData"
                class="lg:hidden text-xs text-red-600 hover:text-red-800 font-bold px-2 py-1.5 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-100 whitespace-nowrap"
              >
                Clear Data
              </button>
            </div>

            <!-- Navigation Tabs -->
            <div class="w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-hide -mx-4 px-4 lg:mx-0 lg:px-0">
              <nav class="flex gap-1.5 sm:gap-2 bg-gray-100 p-1 sm:p-1.5 rounded-xl w-max mx-auto lg:mx-0">
                <button
                  @click="handleMainViewChange('home')"
                  class="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all duration-200 rounded-lg cursor-pointer"
                  :class="[
                    mainView === 'home'
                      ? 'bg-white text-emerald-600 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  ]"
                >
                  <Home :size="16" />
                  <span>Home</span>
                </button>
                <button
                  @click="handleMainViewChange('labels')"
                  class="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all duration-200 rounded-lg cursor-pointer"
                  :class="[
                    mainView === 'labels'
                      ? 'bg-white text-emerald-600 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  ]"
                >
                  <Layers :size="16" />
                  <span>Sticker Studio</span>
                </button>
                <button
                  @click="handleMainViewChange('docs')"
                  class="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all duration-200 rounded-lg cursor-pointer"
                  :class="[
                    mainView === 'docs'
                      ? 'bg-white text-emerald-600 shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  ]"
                >
                  <BookOpen :size="16" />
                  <span>Docs</span>
                </button>
              </nav>
            </div>

            <!-- Desktop Actions -->
            <div class="hidden lg:flex items-center gap-3">
              <a
                href="https://github.com/shashi089/qr-code-label-designer"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 font-bold px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <Github :size="16" />
                <span>Source Code</span>
              </a>
              <button
                @click="handleClearData"
                class="text-xs text-red-600 hover:text-red-800 font-bold px-3 py-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-red-100 whitespace-nowrap"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Pages -->
      <div class="animate-in fade-in duration-300">
        <LandingPage
          v-if="mainView === 'home'"
          :on-navigate="handleMainViewChange"
          :on-load-preset="handleLoadPreset"
        />
        <LabelList
          v-else-if="mainView === 'labels'"
          :labels="labels"
          @create-new="handleCreateNew"
          @edit="handleEdit"
          @delete="handleDelete"
        />
        <DocsPage v-else />
      </div>
    </template>
  </div>
</template>
