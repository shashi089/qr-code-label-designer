<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { QRLayoutDesigner } from 'qrlayout-ui';
import type { StickerLayout, EntitySchema } from 'qrlayout-ui';
import 'qrlayout-ui/style.css';

interface Props {
    initialLayout?: StickerLayout;
    entitySchemas?: Record<string, EntitySchema>;
    /** Additional CSS class applied to the container div. */
    class?: string;
    /** Inline style object applied to the container div. */
    style?: Record<string, string>;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    /** Emitted when the user clicks "Save Layout". */
    save: [layout: StickerLayout];
}>();

const container = ref<HTMLDivElement | null>(null);
let designer: QRLayoutDesigner | null = null;

function mount() {
    if (!container.value) return;
    designer?.destroy();
    designer = new QRLayoutDesigner({
        element: container.value,
        initialLayout: props.initialLayout,
        entitySchemas: props.entitySchemas,
        onSave: (layout) => emit('save', layout),
    });
}

onMounted(mount);
onUnmounted(() => {
    designer?.destroy();
    designer = null;
});

// Re-create when the layout or schemas data changes structurally
watch(
    () => [JSON.stringify(props.initialLayout), JSON.stringify(props.entitySchemas)],
    mount
);
</script>

<template>
    <div
        ref="container"
        :class="props.class"
        :style="{ width: '100%', height: '100%', ...(props.style || {}) }"
    />
</template>
