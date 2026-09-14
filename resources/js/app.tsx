import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { route as routeFn } from 'ziggy-js';
import { initializeTheme } from './hooks/use-appearance';

declare global {
    const route: typeof routeFn;
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const queryClient = new QueryClient();

function updateFavicon(logoPath?: string | null) {
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]') ?? document.createElement('link');
    const faviconUrl = logoPath ? (logoPath.startsWith('http') || logoPath.startsWith('/') ? logoPath : `/storage/${logoPath}`) : '/favicon.png';

    favicon.rel = 'icon';
    favicon.type = logoPath?.toLowerCase().endsWith('.svg') ? 'image/svg+xml' : 'image/png';
    favicon.href = `${faviconUrl}?v=${encodeURIComponent(logoPath || 'default')}`;

    if (!favicon.parentNode) document.head.appendChild(favicon);
}

function FaviconSync({ initialLogoPath }: { initialLogoPath?: string | null }) {
    useEffect(() => {
        updateFavicon(initialLogoPath);

        return router.on('navigate', (event) => {
            updateFavicon(event.detail.page.props.siteSettings?.logo_path as string | null | undefined);
        });
    }, [initialLogoPath]);

    return null;
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob(['./pages/*.tsx', './pages/**/*.tsx'])),
    setup({ el, App, props }) {
        const root = createRoot(el);
        const initialLogoPath = props.initialPage.props.siteSettings?.logo_path as string | null | undefined;

        root.render(
            <QueryClientProvider client={queryClient}>
                <FaviconSync initialLogoPath={initialLogoPath} />
                <App {...props} />
            </QueryClientProvider>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
