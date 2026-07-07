import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import dts from 'vite-plugin-dts';
import path from 'path';

export default defineConfig({
    plugins: [
        svelte({ hot: false }),
        dts({ insertTypesEntry: true })
    ],
    build: {
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'SvelteQrLabel',
            fileName: (format) => `svelte-qr-label.${format === 'es' ? 'js' : 'cjs'}`
        },
        rollupOptions: {
            external: ['svelte', 'qrlayout-core', 'qrlayout-ui'],
            output: {
                globals: {
                    svelte: 'Svelte',
                    'qrlayout-core': 'QRLayoutCore',
                    'qrlayout-ui': 'QRLayoutUI'
                }
            }
        }
    }
});
