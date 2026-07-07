import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
    plugins: [
        vue(),
        dts({ insertTypesEntry: true })
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'VueQrLabel',
            fileName: (format) => `vue-qr-label.${format === 'es' ? 'js' : 'cjs'}`
        },
        rollupOptions: {
            external: ['vue', 'qrlayout-core', 'qrlayout-ui'],
            output: {
                globals: {
                    vue: 'Vue',
                    'qrlayout-core': 'QRLayoutCore',
                    'qrlayout-ui': 'QRLayoutUI'
                }
            }
        }
    }
});
