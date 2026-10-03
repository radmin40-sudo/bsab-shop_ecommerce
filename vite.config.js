import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    server: {
        host: true,
        port: 5173,
        hmr: {
            host: '127.0.0.1',
        },
        // CORS configuration for Laravel dev server
        cors: {
            origin: 'http://127.0.0.1:8000',
            credentials: true,
        },
    },
    preview: {
        host: '0.0.0.0',
        port: 4173,
    },
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.tsx',
                'resources/js/pages/welcome.tsx',
                'resources/js/pages/customer/marketplace.tsx',
                'resources/js/pages/customer/products.tsx',
            ],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
        VitePWA({
            strategies: 'injectManifest',
            srcDir: 'resources/js',
            filename: 'sw.js',
            outDir: 'public',
            buildBase: '/',
            scope: '/',
            injectRegister: false,
            registerType: 'autoUpdate',
            manifest: {
                id: '/',
                name: 'BSAB-SHOP',
                short_name: 'BSAB-SHOP',
                description: 'Quality Products. Better You.',
                start_url: '/',
                scope: '/',
                display: 'standalone',
                orientation: 'portrait',
                theme_color: '#1f7a42',
                background_color: '#f7fbf7',
                icons: [
                    { src: '/pwa-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
                    { src: '/pwa-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
                    { src: '/pwa-icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
                    { src: '/pwa-icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
                ],
            },
            injectManifest: {
                rollupFormat: 'iife',
                globDirectory: 'public',
                globPatterns: ['build/assets/**/*.{js,css,woff,woff2,png,svg,webp}', 'offline.html', 'pwa-icon-*.png'],
                globIgnores: ['sw.js', 'manifest.webmanifest'],
                maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
            },
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
