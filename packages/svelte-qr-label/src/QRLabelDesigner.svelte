<script lang="ts">
    import { QRLayoutDesigner } from 'qrlayout-ui';
    import type { StickerLayout, EntitySchema } from 'qrlayout-ui';
    import 'qrlayout-ui/style.css';

    interface Props {
        initialLayout?: StickerLayout;
        entitySchemas?: Record<string, EntitySchema>;
        /** Called when the user clicks "Save Layout". */
        onsave?: (layout: StickerLayout) => void;
        class?: string;
        style?: string;
    }

    let {
        initialLayout,
        entitySchemas,
        onsave,
        class: className = '',
        style = '',
    }: Props = $props();

    let container: HTMLDivElement;
    let designer: QRLayoutDesigner | null = null;

    // Re-create whenever initialLayout or entitySchemas changes.
    // JSON.stringify ensures deep change detection without extra deps.
    $effect(() => {
        const _a = JSON.stringify(initialLayout);
        const _b = JSON.stringify(entitySchemas);

        if (!container) return;
        designer?.destroy();
        designer = new QRLayoutDesigner({
            element: container,
            initialLayout,
            entitySchemas,
            onSave: (layout) => onsave?.(layout),
        });

        return () => {
            designer?.destroy();
            designer = null;
        };
    });

    // Update the save callback reference without re-creating the designer
    $effect(() => {
        if (designer && onsave !== undefined) {
            (designer as any).onSaveCallback = (layout: StickerLayout) => onsave?.(layout);
        }
    });
</script>

<div
    bind:this={container}
    class={className}
    style="width:100%;height:100%;{style}"
/>
