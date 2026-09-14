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
            registerType: 'autoUpdate',
            manifest: false,
            workbox: {
                navigateFallbackDenylist: [/^\/admin/, /^\/seller/],
                runtimeCaching: [
                    {
                        urlPattern: ({ request }) => request.destination === 'image',
                        handler: 'CacheFirst',
                        options: { cacheName: 'marketplace-images', expiration: { maxEntries: 200, maxAgeSeconds: 604800 } },
                    },
                    {
                        urlPattern: /\/api\/products/,
                        handler: 'NetworkFirst',
                        options: { cacheName: 'marketplace-products', networkTimeoutSeconds: 5 },
                    },
                ],
            },
        }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
});
