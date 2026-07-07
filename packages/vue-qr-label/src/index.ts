export { default as QRLabelDesigner } from './QRLabelDesigner.vue';

// Re-export core types so consumers only need one import
export { StickerPrinter } from 'qrlayout-ui';
export type {
    StickerLayout,
    StickerElement,
    EntitySchema,
    EntityField,
    DesignerOptions,
} from 'qrlayout-ui';
