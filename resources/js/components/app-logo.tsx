import type { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import AppLogoIcon from './app-logo-icon';

function imageUrl(path?: string | null) {
    return path ? (path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`) : null;
}

export default function AppLogo() {
    const { siteSettings } = usePage<SharedData>().props;
    const brandName = siteSettings?.brand_name || 'BSABShop';
    const logoPath = siteSettings?.logo_path ? imageUrl(siteSettings.logo_path) : null;

    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center overflow-hidden rounded-md">
                {logoPath ? (
                    <img
                        src={logoPath}
                        alt={brandName}
                        onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = '/logo.svg';
                        }}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
                )}
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{brandName}</span>
            </div>
        </>
    );
}
