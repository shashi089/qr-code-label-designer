<script setup lang="ts">
import {
  ArrowRight,
  Cpu,
  Users,
  Shield,
  Zap,
  Layout,
  CheckCircle2,
  Sparkles,
} from 'lucide-vue-next';

interface Props {
  onNavigate?: (view: 'home' | 'labels' | 'docs') => void;
  onLoadPreset?: (presetId: string) => void;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'navigate', view: 'home' | 'labels' | 'docs'): void;
  (e: 'loadPreset', presetId: string): void;
}>();

function handleNavigate(view: 'home' | 'labels' | 'docs') {
  if (props.onNavigate) {
    props.onNavigate(view);
  }
  emit('navigate', view);
}

function handleLoadWorkflow(presetId: string) {
  if (props.onLoadPreset) {
    props.onLoadPreset(presetId);
  } else {
    emit('loadPreset', presetId);
  }
}
</script>

<template>
  <div class="bg-white min-h-screen text-gray-900 font-sans">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-gradient-to-b from-emerald-50 via-teal-50/20 to-white pb-20 pt-16 sm:pb-32 sm:pt-36">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="lg:grid lg:grid-cols-12 lg:gap-12">
          <div class="text-center lg:text-left lg:col-span-7 flex flex-col justify-center">
            <!-- Release Badge -->
            <div class="inline-flex items-center gap-1.5 self-center lg:self-start bg-emerald-100/80 border border-emerald-200/50 rounded-full px-3.5 py-1 text-xs font-semibold text-emerald-700 mb-6 shadow-sm backdrop-blur-sm animate-pulse">
              <Sparkles :size="12" />
              <span>Vue QR Label v0.1.2 Released</span>
            </div>
            
            <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl leading-[1.15]">
              Dynamic Vue{" "}
              <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                QR Label Designer
              </span>{" "}
              & Batch Printer
            </h1>
            
            <p class="mt-6 text-lg leading-relaxed text-gray-600 max-w-2xl mx-auto lg:mx-0">
              An embeddable drag-and-drop label editor and headless batch-mail-merge printing engine for Vue 3. Design professional layouts visually, map dynamic dataset fields, and render directly to <strong>ZPL commands, PDFs, or PNGs</strong> locally in the browser.
            </p>
            
            <div class="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button
                @click="handleNavigate('labels')"
                class="w-full sm:w-auto rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer scale-100 hover:scale-[1.02] active:scale-98"
              >
                <span>Launch Sticker Studio</span>
                <ArrowRight :size="18" />
              </button>
              <button
                @click="handleNavigate('docs')"
                class="text-sm font-semibold leading-6 text-gray-900 flex items-center gap-1 hover:text-emerald-600 transition-all cursor-pointer font-bold"
              >
                <span>View Documentation</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
          
          <!-- Right Hero Image Card -->
          <div class="mt-16 lg:col-span-5 lg:mt-0 flex items-center justify-center relative">
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-3xl filter blur-3xl opacity-10 animate-blob"></div>
            <div class="relative rounded-2xl bg-white/80 p-5 shadow-2xl border border-gray-200/50 backdrop-blur-md rotate-1 hover:rotate-0 transition-transform duration-500 max-w-md w-full">
              <div class="bg-gray-900 rounded-xl p-6 text-gray-400 font-mono text-xs shadow-inner">
                <div class="flex gap-1.5 mb-4">
                  <div class="w-3 h-3 rounded-full bg-red-500"></div>
                  <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div class="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span class="text-emerald-400">&lt;script setup&gt;</span><br />
                <span class="text-emerald-400">import</span> { <span class="text-yellow-300">QRLabelDesigner</span> } <span class="text-emerald-400">from</span> <span class="text-green-300">'vue-qr-label'</span>;<br />
                <span class="text-emerald-400">import</span> <span class="text-green-300">'vue-qr-label/style.css'</span>;<br />
                <span class="text-emerald-400">&lt;/script&gt;</span><br /><br />
                <span class="text-gray-500">&lt;!-- Embed the designer component --&gt;</span><br />
                <span class="text-purple-400">&lt;</span><span class="text-yellow-300">QRLabelDesigner</span><br />
                &nbsp;&nbsp;:initial-layout="<span class="text-orange-300">savedLayout</span>"<br />
                &nbsp;&nbsp;:entity-schemas="<span class="text-orange-300">schemas</span>"<br />
                &nbsp;&nbsp;@save="<span class="text-green-300">(layout) =&gt; saveToDB(layout)</span>"<br />
                <span class="text-purple-400">/&gt;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- STORY-DRIVEN PRESETS SECTION -->
    <div class="py-20 sm:py-28 bg-gray-50 border-y border-gray-200/50">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-3xl text-center mb-16">
          <h2 class="text-base font-semibold leading-7 text-emerald-600 tracking-wider uppercase">
            Interactive Industry Workflows
          </h2>
          <p class="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Choose a Preset Story & Launch the Designer
          </p>
          <p class="mt-4 text-base text-gray-600 leading-relaxed">
            Select one of the sample industries below. The demo will preload the corresponding data schema, sample database, and design template directly into your designer session.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- Story A: Employees -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all group duration-300">
            <div>
              <div class="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-5 group-hover:scale-110 transition-transform">
                <Users :size="24" />
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Workforce ID Badges</h3>
              <p class="text-xs font-semibold text-emerald-600 mb-4 bg-emerald-50 py-1 px-2.5 rounded-full w-fit">
                Use Case: Security & Events
              </p>
              <p class="text-gray-600 text-sm leading-relaxed mb-6">
                Design company tags, staff security badges, or visitor credentials. Automatically bind employee names, photos, departments, and scan URLs.
              </p>
            </div>
            <button
              @click="handleLoadWorkflow('default-emp-layout')"
              class="w-full bg-gray-50 hover:bg-emerald-600 hover:text-white border border-gray-200 hover:border-emerald-600 rounded-xl py-3 text-sm font-semibold text-gray-700 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <span>Load Staff Badge Preset</span>
              <Sparkles :size="14" />
            </button>
          </div>

          <!-- Story B: Machines -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-teal-300 transition-all group duration-300">
            <div>
              <div class="h-12 w-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-5 group-hover:scale-110 transition-transform">
                <Cpu :size="24" />
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Equipment Asset Spec</h3>
              <p class="text-xs font-semibold text-teal-600 mb-4 bg-teal-50 py-1 px-2.5 rounded-full w-fit">
                Use Case: Industrial Maintenance
              </p>
              <p class="text-gray-600 text-sm leading-relaxed mb-6">
                Print spec plates for plant machinery, tools, and servers. Integrate dynamic QR codes pointing to installation dates, serial codes, and service logs.
              </p>
            </div>
            <button
              @click="handleLoadWorkflow('default-machine-layout')"
              class="w-full bg-gray-50 hover:bg-teal-600 hover:text-white border border-gray-200 hover:border-teal-600 rounded-xl py-3 text-sm font-semibold text-gray-700 transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <span>Load Asset Tag Preset</span>
              <Sparkles :size="14" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- DEVELOPER WORKFLOW SECTION -->
    <div class="py-20 sm:py-28 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-3xl text-center mb-16">
          <h2 class="text-base font-semibold leading-7 text-emerald-600 tracking-wider uppercase">
            Developer Tour
          </h2>
          <p class="mt-2 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Build a Full Labeling Pipeline in 3 Steps
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div class="relative flex flex-col items-center text-center">
            <div class="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4 shadow-inner">
              1
            </div>
            <h4 class="font-bold text-lg text-gray-900 mb-2">Embed the Canvas UI</h4>
            <p class="text-gray-600 text-sm max-w-xs">
              Drop <code class="bg-gray-100 px-1 py-0.5 rounded text-xs">&lt;QRLabelDesigner /&gt;</code> directly into your Vue page layout. It adjusts to flex parents automatically and encapsulates all canvas controls.
            </p>
          </div>

          <div class="relative flex flex-col items-center text-center">
            <div class="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4 shadow-inner">
              2
            </div>
            <h4 class="font-bold text-lg text-gray-900 mb-2">Bind DB Schemas</h4>
            <p class="text-gray-600 text-sm max-w-xs">
              Define the available database fields. The designer automatically provides visual drag pills so users can map tags like <code class="bg-gray-100 px-1 py-0.5 rounded text-xs">&#123;&#123;fullName&#125;&#125;</code>.
            </p>
          </div>

          <div class="relative flex flex-col items-center text-center">
            <div class="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4 shadow-inner">
              3
            </div>
            <h4 class="font-bold text-lg text-gray-900 mb-2">Headless Printing</h4>
            <p class="text-gray-600 text-sm max-w-xs">
              Extract the saved JSON and send it with your database arrays to <code class="bg-gray-100 px-1 py-0.5 rounded text-xs">StickerPrinter</code> to batch print multi-page PDFs, PNG arrays, or raw ZPL code.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- CORE BENEFITS -->
    <div class="py-20 sm:py-28 bg-gray-50 border-t border-gray-200/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
          <div>
            <h3 class="text-3xl font-extrabold text-gray-900 mb-8 text-center lg:text-left">
              Engineered for High-Performance Apps
            </h3>
            <div class="space-y-6 max-w-xl mx-auto lg:mx-0">
              <div class="flex gap-4">
                <div class="h-10 w-10 shrink-0 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                  <Zap :size="20" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900">
                    ZPL Code Output (Thermal Printing)
                  </h4>
                  <p class="text-gray-600 text-sm mt-1">
                    Convert design canvas layouts into raw <strong>ZPL commands</strong> dynamically. Stream print jobs directly to Zebra industrial thermal sticker printers on the local network.
                  </p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="h-10 w-10 shrink-0 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600">
                  <CheckCircle2 :size="20" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900">
                    Clean Ref-based Render System
                  </h4>
                  <p class="text-gray-600 text-sm mt-1">
                    Uses Vue reactive templates and container refs to synchronize layout settings. No unnecessary re-renders, maintaining undo state and preventing cursor drag lag.
                  </p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="h-10 w-10 shrink-0 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                  <Shield :size="20" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900">
                    100% Client-Side Privacy
                  </h4>
                  <p class="text-gray-600 text-sm mt-1">
                    All canvas drawing, barcode parsing, PDF generation, and ZPL rendering happen locally in the browser. Zero server data sharing.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- CTA panel -->
          <div class="bg-gradient-to-br from-emerald-600 via-teal-700 to-[#35495e] rounded-3xl p-8 sm:p-12 text-white flex flex-col justify-center relative overflow-hidden shadow-2xl">
            <div class="relative z-10 text-center lg:text-left">
              <h3 class="text-3xl font-extrabold mb-4">
                Ready to test?
              </h3>
              <p class="text-emerald-100 mb-8 max-w-sm mx-auto lg:mx-0 text-sm sm:text-base leading-relaxed">
                Open the label design dashboard and try creating, editing, and batch exporting tags with mock database tables.
              </p>
              <button
                @click="handleNavigate('labels')"
                class="w-full sm:w-auto bg-white hover:bg-emerald-50 text-emerald-700 px-8 py-4 rounded-xl font-bold transition-all cursor-pointer shadow-lg hover:shadow-xl active:scale-98 text-sm"
              >
                Launch Sticker Studio
              </button>
            </div>
            <div class="absolute -right-20 -bottom-20 opacity-10">
              <Layout :size="300" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
