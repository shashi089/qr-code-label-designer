import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [
        vue()
    ],
    build: {
        lib: {
            entry: {
                'vue-qr-label': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
                'pdf': fileURLToPath(new URL('./src/pdf.ts', import.meta.url))
            },
            formats: ['es', 'cjs']
        },
        rollupOptions: {
            external: ['vue', 'qrlayout-core', 'qrlayout-ui', 'qrlayout-core/pdf'],
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
