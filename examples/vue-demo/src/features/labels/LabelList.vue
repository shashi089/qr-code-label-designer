<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { StickerLayout } from 'vue-qr-label';
import { Plus, Layout, User, Cpu, Trash2, Edit3, Sparkles } from 'lucide-vue-next';
import EntityMaster from '../sandbox/EntityMaster.vue';

interface Props {
  labels: StickerLayout[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'createNew'): void;
  (e: 'edit', label: StickerLayout): void;
  (e: 'delete', id: string): void;
}>();

const selectedLabelId = ref<string>('');

watch(
  () => props.labels,
  (newLabels) => {
    if (newLabels && newLabels.length > 0 && (!selectedLabelId.value || !newLabels.some(l => l.id === selectedLabelId.value))) {
      selectedLabelId.value = newLabels[0]?.id ?? '';
    }
  },
  { immediate: true }
);

const activeLabel = computed(() => {
  return props.labels.find(l => l.id === selectedLabelId.value) || props.labels[0];
});

function handleDelete(label: StickerLayout, e: Event) {
  e.stopPropagation();
  if (confirm(`Are you sure you want to delete "${label.name}"?`)) {
    emit('delete', label.id);
    if (selectedLabelId.value === label.id) {
      selectedLabelId.value = '';
    }
  }
}
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
    <!-- Header Section -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">Sticker Studio</h1>
        <p class="text-gray-500 mt-1">Design layouts visually and test merge-printing dynamically</p>
      </div>
      <button
        @click="emit('createNew')"
        class="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer text-sm"
      >
        <Plus :size="18" />
        <span>Create Custom Layout</span>
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="labels.length === 0" class="bg-white rounded-2xl border border-gray-200/80 shadow-md p-16 text-center max-w-2xl mx-auto space-y-6">
      <div class="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
        <Layout :size="32" />
      </div>
      <div>
        <h3 class="text-xl font-bold text-gray-900">No Layout Templates Available</h3>
        <p class="text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
          Create a custom canvas or return to the landing page to load pre-configured industrial stories.
        </p>
      </div>
      <div class="flex justify-center gap-4">
        <button
          @click="emit('createNew')"
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow transition-all cursor-pointer text-sm"
        >
          Create Layout
        </button>
      </div>
    </div>

    <!-- Layout Grid -->
    <div v-else class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      <!-- Left Column: Template List (4 Cols) -->
      <div class="xl:col-span-4 space-y-4">
        <div class="bg-gray-100/60 p-2.5 rounded-xl border border-gray-200/50">
          <span class="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-2">
            Layout Templates ({{ labels.length }})
          </span>
        </div>

        <div class="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
          <div
            v-for="label in labels"
            :key="label.id"
            @click="selectedLabelId = label.id"
            class="group relative p-5 rounded-2xl border transition-all cursor-pointer text-left"
            :class="[
              label.id === selectedLabelId
                ? 'bg-white border-emerald-600 shadow-md ring-1 ring-emerald-600/20'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
            ]"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex gap-3">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  :class="[
                    label.id === selectedLabelId ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-500'
                  ]"
                >
                  <Layout :size="20" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 leading-tight pr-4">
                    {{ label.name }}
                  </h4>
                  <div class="flex flex-wrap items-center gap-2 mt-2">
                    <span
                      class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase"
                      :class="[
                        label.targetEntity === 'employee'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-teal-50 text-teal-700 border border-teal-100'
                      ]"
                    >
                      <User v-if="label.targetEntity === 'employee'" :size="10" />
                      <Cpu v-else :size="10" />
                      <span>{{ label.targetEntity || 'None' }}</span>
                    </span>
                    <span class="text-gray-500 text-[10px] font-semibold font-mono">
                      {{ label.width }}{{ label.unit }} × {{ label.height }}{{ label.unit }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions row visible on selection or hover -->
            <div
              class="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100 transition-all"
              :class="[
                label.id === selectedLabelId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
              ]"
            >
              <button
                @click.stop="emit('edit', label)"
                class="flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-emerald-50 hover:text-emerald-600 text-gray-700 font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors border border-gray-200 cursor-pointer"
              >
                <Edit3 :size="12" />
                <span>Edit Canvas</span>
              </button>
              <button
                @click="handleDelete(label, $event)"
                class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-100 ml-auto"
                title="Delete Template"
              >
                <Trash2 :size="13" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Database Grid & Dev Integration (8 Cols) -->
      <div class="xl:col-span-8">
        <EntityMaster v-if="activeLabel" :layout="activeLabel" />
        <div v-else class="bg-white rounded-2xl border border-gray-200/80 shadow-md p-16 text-center">
          <Sparkles class="text-emerald-600 mx-auto mb-4 animate-bounce" :size="24" />
          <h3 class="font-bold text-gray-900">Select a layout template</h3>
          <p class="text-sm text-gray-500 mt-2">
            Choose a layout template from the left sidebar to open the database sandbox workspace.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
