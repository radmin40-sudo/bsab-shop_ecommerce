import { optimizeImage } from '@/lib/image-upload';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Activity,
    Check,
    ChevronDown,
    CircleAlert,
    FileText,
    Info,
    Laptop,
    Loader2,
    PencilLine,
    RefreshCw,
    RotateCcw,
    Search,
    Server,
    ShieldAlert,
    Smartphone,
    Tag,
    Trash2,
    TriangleAlert,
    UserRound,
    Warehouse,
    X,
    type LucideIcon,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

type SiteSettings = {
    brand_name?: string;
    logo_path?: string | null;
    login_background_path?: string | null;
    hero_media_path?: string | null;
    hero_media_type?: 'image' | 'video' | null;
    hero_title?: string;
    hero_highlight?: string;
    hero_description?: string;
    cta_label?: string;
    feature_one?: string;
    feature_two?: string;
    feature_three?: string;
    products_title?: string;
    products_subtitle?: string;
    footer_text?: string;
    footer_tagline?: string;
    footer_quick_links_title?: string;
    footer_care_title?: string;
    footer_about_title?: string;
    footer_newsletter_title?: string;
    footer_newsletter_text?: string;
    newsletter_placeholder?: string;
};

import { PortalLayout } from '@/components/portal-layout';

type StorageStatusEntry = {
    key: string;
    value: string | null;
    inDatabase: boolean;
    existsOnDisk: boolean;
};

type AdminSettingsProps = {
    cache: { config: string; lastModified: number | null };
    logs: {
        size: number;
        updatedAt: string | null;
        entries: LogEntry[];
        stats: Record<'activeSessions' | 'uniqueDevices' | 'uniqueIps' | 'failedLogins' | 'securityAlerts' | 'systemErrors', number>;
    };
    siteSettings: SiteSettings;
    storageStatus?: Record<string, StorageStatusEntry>;
};

type LogEntry = {
    id: string;
    timestamp: string | null;
    severity: 'info' | 'warning' | 'error' | 'critical';
    eventType: string;
    action: string;
    status: string;
    user: string;
    email: string | null;
    role: string | null;
    method: string | null;
    route: string | null;
    requestSource: 'web' | 'console' | null;
    statusCode: number | null;
    ip: string | null;
    device: string | null;
    browser: string | null;
    operatingSystem: string | null;
    userAgent: string | null;
    message: string;
    trace: string | null;
};

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatDate(timestamp: string | number | null) {
    if (!timestamp) return 'No activity yet';

    const date = typeof timestamp === 'number' ? new Date(timestamp * 1000) : new Date(timestamp);

    return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

function severityClass(severity: LogEntry['severity']) {
    return {
        info: 'bg-[#eaf1ff] text-[#4377b8]',
        warning: 'bg-[#fff4df] text-[#a86618]',
        error: 'bg-[#fbe8e5] text-[#ad4437]',
        critical: 'bg-[#f3e5ee] text-[#8d315f]',
    }[severity];
}

function severityIcon(severity: LogEntry['severity']): LucideIcon {
    return {
        info: Info,
        warning: TriangleAlert,
        error: CircleAlert,
        critical: ShieldAlert,
    }[severity];
}

function SeverityBadge({ severity }: { severity: LogEntry['severity'] }) {
    const Icon = severityIcon(severity);

    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-bold uppercase ${severityClass(severity)}`}>
            <Icon size={10} aria-hidden="true" />
            {severity}
        </span>
    );
}

export default function AdminSettings({ cache, logs, siteSettings, storageStatus }: AdminSettingsProps) {
    const [query, setQuery] = useState('');
    const [severity, setSeverity] = useState('all');
    const [status, setStatus] = useState('all');
    const [eventPage, setEventPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const logoStorageStatus = storageStatus?.logo_path ?? {
        key: 'logo_path',
        value: siteSettings.logo_path ?? null,
        inDatabase: Boolean(siteSettings.logo_path),
        existsOnDisk: Boolean(siteSettings.logo_path),
    };
    const loginStorageStatus = storageStatus?.login_background_path ?? {
        key: 'login_background_path',
        value: siteSettings.login_background_path ?? null,
        inDatabase: Boolean(siteSettings.login_background_path),
        existsOnDisk: Boolean(siteSettings.login_background_path),
    };
    const heroStorageStatus = storageStatus?.hero_media_path ?? {
        key: 'hero_media_path',
        value: siteSettings.hero_media_path ?? null,
        inDatabase: Boolean(siteSettings.hero_media_path),
        existsOnDisk: Boolean(siteSettings.hero_media_path),
    };
    const [mediaUploading, setMediaUploading] = useState<'logo' | 'login_background' | 'hero_media' | null>(null);
    const [mediaNotice, setMediaNotice] = useState<{ type: 'success' | 'error'; message: string; field: string } | null>(null);
    const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});
    const [mediaPreviews, setMediaPreviews] = useState<Record<string, string>>({});
    const cacheForm = useForm({});
    const logsForm = useForm({});
    const categoriesForm = useForm({});
    const productsForm = useForm({});
    const ordersForm = useForm({});
    const homeForm = useForm({
        brand_name: siteSettings.brand_name ?? 'BSABShop',
        logo: null as File | null,
        login_background: null as File | null,
        hero_media: null as File | null,
        hero_title: siteSettings.hero_title ?? 'Best picks.',
        hero_highlight: siteSettings.hero_highlight ?? 'Best prices.',
        hero_description: siteSettings.hero_description ?? 'Discover products from every category, curated by our marketplace sellers.',
        cta_label: siteSettings.cta_label ?? 'Shop now',
        feature_one: siteSettings.feature_one ?? 'Fresh & Quality Products',
        feature_two: siteSettings.feature_two ?? 'Trusted Sellers',
        feature_three: siteSettings.feature_three ?? 'Fast & Safe Delivery',
        products_title: siteSettings.products_title ?? 'Featured Products',
        products_subtitle: siteSettings.products_subtitle ?? 'Handpicked for you. Quality products at the best prices.',
        footer_text: siteSettings.footer_text ?? '© 2026 BSABShop Marketplace - every price, checked twice.',
        footer_tagline: siteSettings.footer_tagline ?? 'A greener marketplace for a better tomorrow.',
        footer_quick_links_title: siteSettings.footer_quick_links_title ?? 'Quick Links',
        footer_care_title: siteSettings.footer_care_title ?? 'Customer Care',
        footer_about_title: siteSettings.footer_about_title ?? 'About our marketplace',
        footer_newsletter_title: siteSettings.footer_newsletter_title ?? 'Stay in the loop',
        footer_newsletter_text: siteSettings.footer_newsletter_text ?? 'Get the latest deals and updates.',
        newsletter_placeholder: siteSettings.newsletter_placeholder ?? 'Enter your email address',
    });

    useEffect(() => {
        const files: Record<string, File | null> = {
            logo: homeForm.data.logo,
            login_background: homeForm.data.login_background,
            hero_media: homeForm.data.hero_media,
        };
        const previews = Object.fromEntries(
            Object.entries(files)
                .filter((entry): entry is [string, File] => entry[1] !== null)
                .map(([field, file]) => [field, URL.createObjectURL(file)]),
        );
        setMediaPreviews(previews);

        return () => Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
    }, [homeForm.data.logo, homeForm.data.login_background, homeForm.data.hero_media]);

    function clearCache(event: FormEvent) {
        event.preventDefault();
        cacheForm.post(route('admin.settings.cache.clear'), { preserveScroll: true });
    }

    function clearLogs(event: FormEvent) {
        event.preventDefault();
        if (window.confirm('Clear the application log? This cannot be undone.')) {
            logsForm.post(route('admin.settings.logs.clear'), { preserveScroll: true });
        }
    }

    function clearCategories(event: FormEvent) {
        event.preventDefault();
        if (window.confirm('Delete all categories? This action permanently removes all category records and may affect products assigned to them.')) {
            categoriesForm.post(route('admin.settings.categories.clear'), { preserveScroll: true });
        }
    }

    function clearProducts(event: FormEvent) {
        event.preventDefault();
        if (window.confirm('Delete all products? This will remove every product listing in the store.')) {
            productsForm.post(route('admin.settings.products.clear'), { preserveScroll: true });
        }
    }

    function clearOrders(event: FormEvent) {
        event.preventDefault();
        if (
            window.confirm(
                'Delete all orders? This action permanently removes every active and archived order from the marketplace database and cannot be undone.',
            )
        ) {
            ordersForm.post(route('admin.settings.orders.clear'), { preserveScroll: true });
        }
    }

    function saveHomeContent(event: FormEvent) {
        event.preventDefault();
        homeForm.post(route('admin.settings.home-content'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                homeForm.setData((data) => ({ ...data, logo: null, login_background: null, hero_media: null }));
                setMediaNotice(null);
            },
        });
    }

    async function uploadMedia(field: 'logo' | 'login_background' | 'hero_media', file: File | null, input?: HTMLInputElement | null) {
        if (!file) {
            return;
        }

        const maxBytes = field === 'hero_media' ? 20 * 1024 * 1024 : 10 * 1024 * 1024;
        const acceptedTypes =
            field === 'hero_media'
                ? ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'video/quicktime']
                : field === 'logo'
                  ? ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
                  : ['image/jpeg', 'image/png', 'image/webp'];
        if (!acceptedTypes.includes(file.type)) {
            setMediaNotice({ type: 'error', message: 'Choose a supported image or video file.', field });
            if (input) input.value = '';
            return;
        }
        if (file.size > maxBytes) {
            setMediaNotice({ type: 'error', message: `The file must be ${field === 'hero_media' ? '20' : '10'} MB or smaller.`, field });
            if (input) input.value = '';
            return;
        }

        setMediaUploading(field);
        setMediaNotice(null);

        try {
            const processedFile =
                file.type.startsWith('image/') && file.type !== 'image/svg+xml'
                    ? await optimizeImage(file, {
                          maxWidth: field === 'logo' ? 1200 : 1600,
                          maxHeight: field === 'logo' ? 1200 : 1000,
                          maxBytes,
                      })
                    : file;
            homeForm.setData(field, processedFile);
            setBrokenImages((prev) => ({ ...prev, [field]: false }));
            setMediaNotice({
                type: 'success',
                message: `${formatBytes(processedFile.size)} preview ready. Save homepage content to apply this change.`,
                field,
            });
            if (input) input.value = '';
        } catch {
            setMediaNotice({
                type: 'error',
                message: 'Failed to process file before uploading.',
                field,
            });
            if (input) {
                input.value = '';
            }
        }
        setMediaUploading(null);
    }

    function resetMedia(field: 'logo' | 'login_background' | 'hero_media') {
        const removeKey = field === 'logo' ? 'remove_logo' : field === 'login_background' ? 'remove_login_background' : 'remove_hero_media';
        const label = field === 'login_background' ? 'login background' : field === 'hero_media' ? 'hero media' : 'brand logo';

        if (!window.confirm(`Reset ${label} to the system default?`)) {
            return;
        }

        setMediaUploading(field);
        setMediaNotice(null);

        router.post(
            route('admin.settings.home-content'),
            { [removeKey]: true },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setMediaUploading(null);
                    setMediaNotice({
                        type: 'success',
                        message: `${field === 'login_background' ? 'Login background' : field === 'hero_media' ? 'Hero media' : 'Logo'} reset to default.`,
                        field,
                    });
                    homeForm.setData(field, null);
                    setBrokenImages((prev) => ({ ...prev, [field]: false }));
                },
                onError: () => {
                    setMediaUploading(null);
                    setMediaNotice({
                        type: 'error',
                        message: `Failed to reset ${label}.`,
                        field,
                    });
                },
            },
        );
    }

    const filteredLogs = useMemo(
        () =>
            logs.entries.filter((entry) => {
                const haystack = [entry.action, entry.message, entry.user, entry.email, entry.ip, entry.route]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();
                return (
                    (!query || haystack.includes(query.toLowerCase())) &&
                    (severity === 'all' || entry.severity === severity) &&
                    (status === 'all' || entry.status === status)
                );
            }),
        [logs.entries, query, severity, status],
    );
    const eventPageSize = 6;
    const eventPageCount = Math.max(1, Math.ceil(filteredLogs.length / eventPageSize));
    const currentEventPage = Math.min(eventPage, eventPageCount);
    const visibleLogs = filteredLogs.slice((currentEventPage - 1) * eventPageSize, currentEventPage * eventPageSize);
    const statCards: [string, number, LucideIcon][] = [
        ['Active sessions', logs.stats.activeSessions, UserRound],
        ['Unique devices', logs.stats.uniqueDevices, Laptop],
        ['IP addresses', logs.stats.uniqueIps, Server],
        ['Failed logins', logs.stats.failedLogins, ShieldAlert],
        ['Security alerts', logs.stats.securityAlerts, ShieldAlert],
        ['System errors', logs.stats.systemErrors, FileText],
    ];

    return (
        <>
            <Head title="Admin settings" />
            <PortalLayout role="admin" title="System settings" eyebrow="Platform controls">
                <div className="mb-4 min-w-0 sm:mb-5">
                    <Link
                        href={route('admin.dashboard')}
                        className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#258553] hover:underline"
                    >
                        <ChevronDown size={12} className="rotate-90" /> Back to dashboard
                    </Link>
                    <h1 className="font-display mt-1 text-2xl leading-tight font-bold tracking-tight text-[#173b27] sm:text-3xl">
                        Maintenance center
                    </h1>
                    <p className="mt-1 text-[11px] font-semibold text-[#288b50]">Keep the platform healthy.</p>
                    <p className="mt-1 max-w-2xl text-[10px] leading-4 text-[#6a7c70]">
                        Manage application caches and inspect recent system logs from one protected workspace.
                    </p>
                </div>

                <div className="grid min-w-0 gap-3 xl:grid-cols-12">
                    <section className="relative min-w-0 overflow-hidden rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_13px_rgba(31,70,48,0.045)] sm:p-5 xl:col-span-7">
                        <div className="relative">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex min-w-0 items-start gap-3">
                                    <span className="shrink-0 rounded-full bg-[#e8f5ec] p-2.5 text-[#258553]">
                                        <Server size={18} />
                                    </span>
                                    <div className="min-w-0">
                                        <h2 className="text-sm font-bold text-[#25372c]">Application cache</h2>
                                        <p className="mt-0.5 text-[9px] text-[#7d8b82]">Refresh runtime data</p>
                                    </div>
                                </div>
                                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#cfe5d0] bg-white px-2.5 py-1 text-[10px] font-bold tracking-wide text-[#287d48] uppercase">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#42a85f]" /> Ready
                                </span>
                            </div>
                            <p className="mt-3 max-w-lg text-[10px] leading-4 text-[#5f7465]">
                                Rebuild the compiled configuration, routes, views, and event cache after deployment or settings changes.
                            </p>
                            <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                <div className="rounded-lg border border-[#e8eee9] bg-[#fbfdfb] p-2.5">
                                    <p className="text-[9px] font-semibold text-[#8b998e]">Environment</p>
                                    <p className="mt-1 text-[10px] font-semibold text-[#294231] capitalize">{cache.config}</p>
                                </div>
                                <div className="rounded-lg border border-[#e8eee9] bg-[#fbfdfb] p-2.5">
                                    <p className="text-[9px] font-semibold text-[#8b998e]">Cache scope</p>
                                    <p className="mt-1 text-[10px] font-semibold text-[#294231]">4 runtime layers</p>
                                </div>
                                <div className="min-w-0 rounded-lg border border-[#e8eee9] bg-[#fbfdfb] p-2.5">
                                    <p className="text-[9px] font-semibold text-[#8b998e]">Last log update</p>
                                    <p
                                        className="mt-1 text-[10px] font-semibold wrap-break-word text-[#294231]"
                                        title={formatDate(cache.lastModified)}
                                    >
                                        {formatDate(cache.lastModified)}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                                <form onSubmit={clearCache} className="w-full sm:w-auto">
                                    <button
                                        type="submit"
                                        disabled={cacheForm.processing}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#188747] px-3.5 py-2 text-[10px] font-semibold text-white transition hover:bg-[#126d39] disabled:opacity-50 sm:w-auto"
                                    >
                                        <RefreshCw size={15} className={cacheForm.processing ? 'animate-spin' : ''} />{' '}
                                        {cacheForm.processing ? 'Refreshing runtime...' : 'Refresh runtime data'}
                                    </button>
                                </form>
                                {cacheForm.recentlySuccessful && (
                                    <span role="status" className="flex items-center gap-1 text-[10px] font-semibold text-[#23824a]">
                                        <Check size={14} /> Runtime cache refreshed
                                    </span>
                                )}
                                {cacheForm.errors && Object.keys(cacheForm.errors).length > 0 && (
                                    <span role="alert" className="text-[10px] font-medium text-[#ad4437]">
                                        Could not refresh runtime data.
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="min-w-0 rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_13px_rgba(31,70,48,0.045)] sm:p-5 xl:col-span-5">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <span className="rounded-full bg-[#e8f5ec] p-2 text-[#258553]">
                                    <ShieldAlert size={16} />
                                </span>
                                <div>
                                    <h2 className="text-sm font-bold text-[#25372c]">Security &amp; system activity</h2>
                                    <p className="mt-0.5 text-[9px] text-[#7d8b82]">
                                        Monitor access, application health, and active devices in one view.
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#eaf6ee] px-2 py-1 text-[8px] font-semibold text-[#287d48]">
                                <i className="h-1.5 w-1.5 rounded-full bg-[#42a85f]" /> Live data
                            </span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {statCards.map(([label, value, Icon]) => (
                                <div key={String(label)} className="rounded-lg border border-[#e8eee9] bg-[#fbfdfb] p-2.5">
                                    <div className="flex items-center gap-1.5 text-[#328152]">
                                        <Icon size={12} />
                                        <span className="truncate text-[8px] font-medium text-[#738177]">{label}</span>
                                    </div>
                                    <p className="mt-1 text-base leading-none font-bold text-[#1c4b3d]">{value}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="min-w-0 rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_13px_rgba(31,70,48,0.045)] sm:p-5 xl:col-span-7">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <span className="rounded-full bg-[#e8f5ec] p-2.5 text-[#258553]">
                                    <Activity size={17} />
                                </span>
                                <div>
                                    <h2 className="text-sm font-bold text-[#25372c]">Recent system events</h2>
                                    <p className="mt-0.5 text-[9px] text-[#829187]">
                                        Monitor access, application health, and active devices in one view.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <form onSubmit={clearLogs}>
                                    <button
                                        disabled={logsForm.processing}
                                        type="submit"
                                        title="Clear application logs"
                                        aria-label="Clear application logs"
                                        className="rounded-lg p-2 text-[#b9574a] transition hover:bg-[#fbe8e5] focus-visible:ring-2 focus-visible:ring-[#dd948d] disabled:opacity-50"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 lg:flex-row">
                            <label className="relative flex-1">
                                <Search size={16} className="absolute top-3 left-3 text-[#8fa096]" />
                                <input
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.target.value);
                                        setEventPage(1);
                                    }}
                                    placeholder="Search events, users, IPs, routes..."
                                    className="h-9 w-full rounded-lg border border-[#dfe3dc] py-2 pr-3 pl-9 text-[10px] outline-none focus:border-[#2c9350] focus:ring-2 focus:ring-[#e5f3e9]"
                                />
                            </label>
                            <select
                                value={severity}
                                onChange={(event) => {
                                    setSeverity(event.target.value);
                                    setEventPage(1);
                                }}
                                className="h-9 w-full rounded-lg border border-[#dfe3dc] bg-white px-3 py-2 text-[10px] text-[#52665a] outline-none focus:border-[#2c9350] focus:ring-2 focus:ring-[#e5f3e9] lg:w-auto"
                            >
                                <option value="all">All severity</option>
                                <option value="info">Info</option>
                                <option value="warning">Warning</option>
                                <option value="error">Error</option>
                                <option value="critical">Critical</option>
                            </select>
                            <select
                                value={status}
                                onChange={(event) => {
                                    setStatus(event.target.value);
                                    setEventPage(1);
                                }}
                                className="h-9 w-full rounded-lg border border-[#dfe3dc] bg-white px-3 py-2 text-[10px] text-[#52665a] outline-none focus:border-[#2c9350] focus:ring-2 focus:ring-[#e5f3e9] lg:w-auto"
                            >
                                <option value="all">All outcomes</option>
                                <option value="success">Success</option>
                                <option value="failed">Failed</option>
                                <option value="attention">Attention</option>
                            </select>
                        </div>

                        <div className="mt-5 min-w-0 overflow-x-auto rounded-xl border border-[#edf0eb]">
                            <div>
                                <div className="hidden grid-cols-[1.25fr_1.5fr_1fr_1fr_1fr_34px] gap-3 border-b border-[#edf0eb] bg-[#f8fbf7] px-4 py-3 text-[10px] font-bold tracking-wider text-[#819086] uppercase md:grid">
                                    <span>Event</span>
                                    <span>Actor</span>
                                    <span>Request</span>
                                    <span>Device / IP</span>
                                    <span>When</span>
                                    <span />
                                </div>
                                {filteredLogs.length ? (
                                    visibleLogs.map((entry) => (
                                        <button
                                            key={entry.id}
                                            onClick={() => setSelectedLog(entry)}
                                            className="block w-full min-w-0 border-b border-[#f0f2ee] px-3 py-3 text-left transition last:border-0 hover:bg-[#fbfdfb] sm:px-4 md:grid md:grid-cols-[1.25fr_1.5fr_1fr_1fr_1fr_34px] md:gap-3"
                                        >
                                            <span className="flex min-w-0 items-start justify-between gap-3 md:block">
                                                <span>
                                                    <SeverityBadge severity={entry.severity} />
                                                    <span className="mt-1 block text-xs font-semibold wrap-break-word text-[#294231]">
                                                        {entry.action}
                                                    </span>
                                                </span>
                                                <span className="shrink-0 text-right text-[11px] text-[#8a998e] md:hidden">
                                                    {formatDate(entry.timestamp)}
                                                </span>
                                            </span>
                                            <span className="mt-3 min-w-0 text-xs md:mt-0">
                                                <span className="block truncate font-semibold text-[#294231]">{entry.user}</span>
                                                <span className="block truncate text-[11px] text-[#8a998e]">{entry.email ?? 'System process'}</span>
                                            </span>
                                            <span className="mt-2 block truncate text-xs text-[#52665a] md:mt-0">
                                                {entry.method ? (
                                                    <>
                                                        <b className="md:hidden">Request: </b>
                                                        {entry.method} {entry.statusCode ?? '—'} {entry.route ?? ''}
                                                    </>
                                                ) : (
                                                    'System event'
                                                )}
                                            </span>
                                            <span className="mt-2 block min-w-0 text-xs text-[#52665a] md:mt-0">
                                                <span className="block truncate">
                                                    {entry.device ?? (entry.requestSource === 'console' ? 'Command line' : 'Not captured')}
                                                </span>
                                                <span className="block truncate text-[11px] text-[#8a998e]">
                                                    {entry.ip
                                                        ? `IP ${entry.ip}`
                                                        : entry.requestSource === 'console'
                                                          ? 'No client IP (console)'
                                                          : 'No IP captured'}
                                                </span>
                                            </span>
                                            <span className="mt-2 hidden text-xs text-[#52665a] md:block">{formatDate(entry.timestamp)}</span>
                                            <span className="hidden items-center justify-end text-[#9baa9e] md:flex">
                                                <ChevronDown size={16} className="-rotate-90" />
                                            </span>
                                        </button>
                                    ))
                                ) : (
                                    <p className="px-4 py-10 text-center text-sm text-[#819086]">No events match the selected filters.</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 flex flex-col gap-2 text-[9px] text-[#8a998e] sm:flex-row sm:items-center sm:justify-between">
                            <span>
                                Showing {filteredLogs.length ? (currentEventPage - 1) * eventPageSize + 1 : 0}–
                                {Math.min(currentEventPage * eventPageSize, filteredLogs.length)} of {filteredLogs.length} events · Updated{' '}
                                {formatDate(logs.updatedAt)}
                            </span>
                            {eventPageCount > 1 && (
                                <div className="flex items-center gap-1 self-end sm:self-auto">
                                    <button
                                        type="button"
                                        disabled={currentEventPage === 1}
                                        onClick={() => setEventPage((current) => Math.max(1, current - 1))}
                                        className="rounded-md border border-[#dfe7e1] px-2 py-1 disabled:opacity-40"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-1 font-semibold text-[#287e4a]">
                                        {currentEventPage} / {eventPageCount}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={currentEventPage >= eventPageCount}
                                        onClick={() => setEventPage((current) => Math.min(eventPageCount, current + 1))}
                                        className="rounded-md border border-[#dfe7e1] px-2 py-1 disabled:opacity-40"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    <div className="grid content-start gap-3 xl:col-span-5">
                        <section className="min-w-0 rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_13px_rgba(31,70,48,0.045)] sm:p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-bold text-[#25372c]">Security activity</h2>
                                    <p className="mt-0.5 text-[9px] text-[#7d8b82]">Device sessions</p>
                                </div>
                                <Smartphone className="text-[#328152]" size={17} />
                            </div>
                            <div className="mt-3 rounded-lg border border-[#e8eee9] bg-[#fbfdfb] p-3">
                                <div className="flex items-start gap-3">
                                    <span className="rounded-lg bg-[#eaf6ef] p-2 text-[#258553]">
                                        <Laptop size={16} />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-semibold text-[#294231]">Application server</p>
                                        <p className="mt-0.5 text-[9px] text-[#7d8b82]">System-generated activity</p>
                                        <p className="mt-2 text-[9px] leading-4 text-[#6b7d71]">
                                            Sessions appear here when authentication events include device metadata.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-[9px] text-[#6b7d71]">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#42a85f]" /> {logs.stats.activeSessions} active session records
                            </div>
                        </section>
                        <section className="min-w-0 rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_13px_rgba(31,70,48,0.045)] sm:p-5">
                            <div className="flex items-center gap-3">
                                <span className="rounded-full bg-[#e8f5ec] p-2 text-[#258553]">
                                    <ShieldAlert size={15} />
                                </span>
                                <div>
                                    <h2 className="text-sm font-bold text-[#25372c]">Security alerts</h2>
                                    <p className="mt-0.5 text-[9px] text-[#7d8b82]">Review attention items</p>
                                </div>
                            </div>
                            <div className="mt-3 rounded-lg border border-[#e0eee3] bg-[#f1f9f3] p-3 text-[9px] leading-4 text-[#527760]">
                                {logs.stats.securityAlerts
                                    ? `${logs.stats.securityAlerts} events need review in the activity table.`
                                    : 'No suspicious activity detected in the available event window.'}
                            </div>
                        </section>
                    </div>
                </div>

                {selectedLog && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-[#102318]/50 p-4"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Event details"
                    >
                        <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-7">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-[11px] font-bold tracking-[0.18em] text-[#b06b38] uppercase">Event details</p>
                                    <h2 className="font-display mt-1 text-xl font-bold wrap-break-word text-[#173b27] sm:text-2xl">
                                        {selectedLog.action}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setSelectedLog(null)}
                                    aria-label="Close details"
                                    className="shrink-0 rounded-lg p-2 text-[#718075] hover:bg-[#f1f5ef]"
                                >
                                    <X size={19} />
                                </button>
                            </div>
                            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                {[
                                    ['User', selectedLog.email ? `${selectedLog.user} (${selectedLog.email})` : selectedLog.user],
                                    ['IP address', selectedLog.ip ?? 'Not available'],
                                    ['Device', selectedLog.device ?? 'Not available'],
                                    ['Browser', selectedLog.browser ?? 'Not available'],
                                    ['Operating system', selectedLog.operatingSystem ?? 'Not available'],
                                    ['Request', selectedLog.route ? `${selectedLog.method ?? '—'} ${selectedLog.route}` : 'Not available'],
                                    ['HTTP status', selectedLog.statusCode ?? 'Not available'],
                                    ['Timestamp', formatDate(selectedLog.timestamp)],
                                    ['User agent', selectedLog.userAgent ?? 'Not collected'],
                                ].map(([label, value]) => (
                                    <div key={label} className="min-w-0 rounded-lg bg-[#f8fbf7] p-3">
                                        <p className="text-[10px] font-bold tracking-wider text-[#819086] uppercase">{label}</p>
                                        <p className="mt-1 text-sm wrap-break-word text-[#294231]">{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4">
                                <p className="text-[10px] font-bold tracking-wider text-[#819086] uppercase">Message</p>
                                <p className="mt-2 rounded-lg bg-[#f8fbf7] p-3 text-sm wrap-break-word text-[#52665a]">{selectedLog.message}</p>
                            </div>
                            {selectedLog.trace && (
                                <details className="mt-4">
                                    <summary className="cursor-pointer text-sm font-semibold text-[#294231]">View stack trace</summary>
                                    <pre className="mt-2 max-w-full overflow-auto rounded-lg bg-[#18231b] p-4 text-xs leading-5 wrap-break-word whitespace-pre-wrap text-[#b9d4bb]">
                                        {selectedLog.trace}
                                    </pre>
                                </details>
                            )}
                        </div>
                    </div>
                )}

                <section className="mt-3 min-w-0 rounded-xl border border-[#e4ebe6] bg-white p-3 shadow-[0_3px_13px_rgba(31,70,48,0.045)] sm:mt-4 sm:p-4">
                    <div className="flex items-center gap-3">
                        <span className="rounded-full bg-[#e8f5ec] p-2.5 text-[#258553]">
                            <PencilLine size={16} />
                        </span>
                        <div>
                            <h2 className="text-sm font-bold text-[#25372c]">Homepage editor</h2>
                            <p className="mt-0.5 text-[9px] text-[#7d8b82]">Edit front page content</p>
                        </div>
                    </div>

                    <form onSubmit={saveHomeContent} className="mt-3 grid min-w-0 gap-3">
                        {Object.keys(homeForm.errors).length > 0 && (
                            <div
                                role="alert"
                                className="rounded-lg border border-[#f0d9d5] bg-[#fff6f4] px-3 py-2 text-[10px] font-medium text-[#ad4437]"
                            >
                                {Object.values(homeForm.errors)[0]}
                            </div>
                        )}
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="grid w-full gap-2 text-sm font-semibold text-[#173b27]">
                                Brand name
                                <input
                                    value={homeForm.data.brand_name}
                                    onChange={(event) => homeForm.setData('brand_name', event.target.value)}
                                    className="w-full border border-[#dfe3dc] px-3 py-2.5 outline-none focus:border-[#2c9350]"
                                />
                            </label>
                            <label className="grid w-full gap-2 text-sm font-semibold text-[#173b27]">
                                Button label
                                <input
                                    value={homeForm.data.cta_label}
                                    onChange={(event) => homeForm.setData('cta_label', event.target.value)}
                                    className="w-full border border-[#dfe3dc] px-3 py-2.5 outline-none focus:border-[#2c9350]"
                                />
                            </label>
                        </div>

                        <div className="grid w-full gap-2 text-sm font-semibold text-[#173b27]">
                            Brand logo
                            <div className="flex flex-col gap-4 rounded-xl border border-[#dfe3dc] bg-[#f7faf6] p-3 sm:flex-row sm:items-center">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#dfe3dc] bg-white">
                                    {homeForm.data.logo ? (
                                        <img src={mediaPreviews.logo} alt="Logo preview" className="h-full w-full object-cover" />
                                    ) : siteSettings.logo_path && !brokenImages.logo ? (
                                        <img
                                            src={`/storage/${siteSettings.logo_path}`}
                                            alt="Current brand logo"
                                            onError={() => setBrokenImages((prev) => ({ ...prev, logo: true }))}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-bold text-[#2c9350]">
                                            {(homeForm.data.brand_name || 'B').slice(0, 1).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                        disabled={mediaUploading === 'logo'}
                                        onChange={(event) => {
                                            const input = event.target;
                                            const file = input.files?.[0] ?? null;
                                            uploadMedia('logo', file, input);
                                        }}
                                        className="w-full max-w-full text-sm"
                                    />
                                    {mediaUploading === 'logo' && (
                                        <div className="flex items-center gap-1.5 text-xs text-[#2c9350]">
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing logo preview...
                                        </div>
                                    )}
                                    {mediaNotice?.field === 'logo' && (
                                        <div
                                            className={`rounded-lg p-2 text-xs font-medium ${mediaNotice.type === 'success' ? 'bg-[#eaf6ee] text-[#287d48]' : 'bg-[#fdf0ed] text-[#d94a38]'}`}
                                        >
                                            {mediaNotice.message}
                                        </div>
                                    )}
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 ${logoStorageStatus.inDatabase ? (logoStorageStatus.existsOnDisk ? 'bg-[#eaf6ee] text-[#287d48]' : 'bg-[#fff4df] text-[#a86618]') : 'bg-[#edf1ee] text-[#52665a]'}`}
                                        >
                                            {logoStorageStatus.inDatabase
                                                ? logoStorageStatus.existsOnDisk
                                                    ? 'Stored in database'
                                                    : 'Missing from storage (404)'
                                                : 'Using default logo'}
                                        </span>
                                        {logoStorageStatus.value && (
                                            <span className="rounded-full bg-[#edf1ee] px-2.5 py-1 text-[#52665a]">{logoStorageStatus.value}</span>
                                        )}
                                        {logoStorageStatus.inDatabase && (
                                            <button
                                                type="button"
                                                onClick={() => resetMedia('logo')}
                                                disabled={mediaUploading === 'logo'}
                                                className="inline-flex items-center gap-1 rounded-full border border-[#dfe3dc] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#8b3d24] hover:bg-[#fdf2ee] disabled:opacity-50"
                                            >
                                                <RotateCcw className="h-3 w-3" /> Reset to default
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid w-full gap-2 text-sm font-semibold text-[#173b27]">
                            Login background image
                            <div className="rounded-xl border border-[#dfe3dc] bg-[#f7faf6] p-3">
                                <div className="mb-2 h-14 w-full overflow-hidden rounded-lg bg-white sm:h-16">
                                    {homeForm.data.login_background ? (
                                        <img
                                            src={mediaPreviews.login_background}
                                            alt="Login background preview"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : siteSettings.login_background_path && !brokenImages.login_background ? (
                                        <img
                                            src={`/storage/${siteSettings.login_background_path}`}
                                            alt="Current login background"
                                            onError={() => setBrokenImages((prev) => ({ ...prev, login_background: true }))}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-[#789184]">
                                            Using the default login background
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    disabled={mediaUploading === 'login_background'}
                                    onChange={(event) => {
                                        const input = event.target;
                                        const file = input.files?.[0] ?? null;
                                        uploadMedia('login_background', file, input);
                                    }}
                                    className="w-full max-w-full text-sm"
                                />
                                {mediaUploading === 'login_background' && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[#2c9350]">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing background preview...
                                    </div>
                                )}
                                {mediaNotice?.field === 'login_background' && (
                                    <div
                                        className={`mt-2 rounded-lg p-2 text-xs font-medium ${mediaNotice.type === 'success' ? 'bg-[#eaf6ee] text-[#287d48]' : 'bg-[#fdf0ed] text-[#d94a38]'}`}
                                    >
                                        {mediaNotice.message}
                                    </div>
                                )}
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-1 ${loginStorageStatus.inDatabase ? (loginStorageStatus.existsOnDisk ? 'bg-[#eaf6ee] text-[#287d48]' : 'bg-[#fff4df] text-[#a86618]') : 'bg-[#edf1ee] text-[#52665a]'}`}
                                    >
                                        {loginStorageStatus.inDatabase
                                            ? loginStorageStatus.existsOnDisk
                                                ? 'Stored in database'
                                                : 'Missing from storage (404)'
                                            : 'Using default'}
                                    </span>
                                    {loginStorageStatus.value && (
                                        <span className="rounded-full bg-[#edf1ee] px-2.5 py-1 text-[#52665a]">{loginStorageStatus.value}</span>
                                    )}
                                    {loginStorageStatus.inDatabase && (
                                        <button
                                            type="button"
                                            onClick={() => resetMedia('login_background')}
                                            disabled={mediaUploading === 'login_background'}
                                            className="inline-flex items-center gap-1 rounded-full border border-[#dfe3dc] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#8b3d24] hover:bg-[#fdf2ee] disabled:opacity-50"
                                        >
                                            <RotateCcw className="h-3 w-3" /> Reset to default
                                        </button>
                                    )}
                                </div>
                                <p className="mt-2 text-[11px] font-normal text-[#789184]">
                                    This image appears on the left side of the login screen. Maximum size: 10 MB.
                                </p>
                            </div>
                        </div>

                        <div className="grid w-full gap-2 text-sm font-semibold text-[#173b27]">
                            Hero image or video
                            <div className="rounded-xl border border-[#dfe3dc] bg-[#f7faf6] p-3">
                                <div className="mb-2 h-14 w-full overflow-hidden rounded-lg bg-white sm:h-16">
                                    {homeForm.data.hero_media ? (
                                        homeForm.data.hero_media.type.startsWith('video/') ? (
                                            <video src={mediaPreviews.hero_media} controls className="h-full w-full object-cover" />
                                        ) : (
                                            <img src={mediaPreviews.hero_media} alt="Hero media preview" className="h-full w-full object-cover" />
                                        )
                                    ) : siteSettings.hero_media_path && !brokenImages.hero_media ? (
                                        siteSettings.hero_media_type === 'video' ? (
                                            <video
                                                src={`/storage/${siteSettings.hero_media_path}`}
                                                controls
                                                onError={() => setBrokenImages((prev) => ({ ...prev, hero_media: true }))}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <img
                                                src={`/storage/${siteSettings.hero_media_path}`}
                                                alt="Current hero media"
                                                onError={() => setBrokenImages((prev) => ({ ...prev, hero_media: true }))}
                                                className="h-full w-full object-cover"
                                            />
                                        )
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-[#789184]">
                                            No custom hero media uploaded
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/svg+xml,video/mp4,video/webm,video/quicktime"
                                    disabled={mediaUploading === 'hero_media'}
                                    onChange={(event) => {
                                        const input = event.target;
                                        const file = input.files?.[0] ?? null;
                                        uploadMedia('hero_media', file, input);
                                    }}
                                    className="w-full max-w-full text-sm"
                                />
                                {mediaUploading === 'hero_media' && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-[#2c9350]">
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing hero media preview...
                                    </div>
                                )}
                                {mediaNotice?.field === 'hero_media' && (
                                    <div
                                        className={`mt-2 rounded-lg p-2 text-xs font-medium ${mediaNotice.type === 'success' ? 'bg-[#eaf6ee] text-[#287d48]' : 'bg-[#fdf0ed] text-[#d94a38]'}`}
                                    >
                                        {mediaNotice.message}
                                    </div>
                                )}
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-medium">
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-1 ${heroStorageStatus.inDatabase ? (heroStorageStatus.existsOnDisk ? 'bg-[#eaf6ee] text-[#287d48]' : 'bg-[#fff4df] text-[#a86618]') : 'bg-[#edf1ee] text-[#52665a]'}`}
                                    >
                                        {heroStorageStatus.inDatabase
                                            ? heroStorageStatus.existsOnDisk
                                                ? 'Stored in database'
                                                : 'Missing from storage (404)'
                                            : 'Using default'}
                                    </span>
                                    {heroStorageStatus.value && (
                                        <span className="rounded-full bg-[#edf1ee] px-2.5 py-1 text-[#52665a]">{heroStorageStatus.value}</span>
                                    )}
                                    {heroStorageStatus.inDatabase && (
                                        <button
                                            type="button"
                                            onClick={() => resetMedia('hero_media')}
                                            disabled={mediaUploading === 'hero_media'}
                                            className="inline-flex items-center gap-1 rounded-full border border-[#dfe3dc] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#8b3d24] hover:bg-[#fdf2ee] disabled:opacity-50"
                                        >
                                            <RotateCcw className="h-3 w-3" /> Reset to default
                                        </button>
                                    )}
                                </div>
                                <p className="mt-2 text-[11px] font-normal text-[#789184]">
                                    Upload an image or MP4/WebM/MOV video. Maximum size: 20 MB.
                                </p>
                            </div>
                        </div>

                        <label className="grid w-full gap-2 text-sm font-semibold text-[#173b27]">
                            Hero title
                            <input
                                value={homeForm.data.hero_title}
                                onChange={(event) => homeForm.setData('hero_title', event.target.value)}
                                className="w-full border border-[#dfe3dc] px-3 py-2.5 outline-none focus:border-[#2c9350]"
                            />
                        </label>

                        <label className="grid w-full gap-2 text-sm font-semibold text-[#173b27]">
                            Highlight text
                            <input
                                value={homeForm.data.hero_highlight}
                                onChange={(event) => homeForm.setData('hero_highlight', event.target.value)}
                                className="w-full border border-[#dfe3dc] px-3 py-2.5 outline-none focus:border-[#2c9350]"
                            />
                        </label>

                        <label className="grid w-full gap-2 text-sm font-semibold text-[#173b27]">
                            Hero description
                            <textarea
                                value={homeForm.data.hero_description}
                                onChange={(event) => homeForm.setData('hero_description', event.target.value)}
                                rows={4}
                                className="w-full border border-[#dfe3dc] px-3 py-2.5 outline-none focus:border-[#2c9350]"
                            />
                        </label>

                        <div className="grid gap-4 md:grid-cols-3">
                            {(['feature_one', 'feature_two', 'feature_three'] as const).map((field, index) => (
                                <label key={field} className="grid w-full gap-2 text-sm font-semibold text-[#173b27]">
                                    Feature {index + 1}
                                    <input
                                        value={homeForm.data[field]}
                                        onChange={(event) => homeForm.setData(field, event.target.value)}
                                        className="w-full border border-[#dfe3dc] px-3 py-2.5 outline-none focus:border-[#2c9350]"
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="grid w-full gap-2 text-sm font-semibold text-[#173b27]">
                                Products section title
                                <input
                                    value={homeForm.data.products_title}
                                    onChange={(event) => homeForm.setData('products_title', event.target.value)}
                                    className="w-full border border-[#dfe3dc] px-3 py-2.5 outline-none focus:border-[#2c9350]"
                                />
                            </label>
                            <label className="grid w-full gap-2 text-sm font-semibold text-[#173b27]">
                                Products section subtitle
                                <input
                                    value={homeForm.data.products_subtitle}
                                    onChange={(event) => homeForm.setData('products_subtitle', event.target.value)}
                                    className="w-full border border-[#dfe3dc] px-3 py-2.5 outline-none focus:border-[#2c9350]"
                                />
                            </label>
                        </div>

                        <label className="grid w-full gap-2 text-sm font-semibold text-[#173b27]">
                            Footer text
                            <textarea
                                value={homeForm.data.footer_text}
                                onChange={(event) => homeForm.setData('footer_text', event.target.value)}
                                rows={3}
                                className="w-full border border-[#dfe3dc] px-3 py-2.5 outline-none focus:border-[#2c9350]"
                            />
                        </label>

                        <div className="grid gap-4 md:grid-cols-2">
                            {(
                                [
                                    'footer_tagline',
                                    'footer_quick_links_title',
                                    'footer_care_title',
                                    'footer_about_title',
                                    'footer_newsletter_title',
                                    'footer_newsletter_text',
                                    'newsletter_placeholder',
                                ] as const
                            ).map((field) => (
                                <label key={field} className="grid w-full gap-2 text-sm font-semibold text-[#173b27]">
                                    {field.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())}
                                    <input
                                        value={homeForm.data[field]}
                                        onChange={(event) => homeForm.setData(field, event.target.value)}
                                        className="w-full border border-[#dfe3dc] px-3 py-2.5 outline-none focus:border-[#2c9350]"
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                            <button
                                type="submit"
                                disabled={homeForm.processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#188747] px-3.5 py-2 text-[10px] font-semibold text-white hover:bg-[#126d39] disabled:opacity-50 sm:w-auto"
                            >
                                <Check size={15} /> {homeForm.processing ? 'Saving...' : 'Save homepage content'}
                            </button>
                            {homeForm.recentlySuccessful && (
                                <span role="status" className="text-[10px] font-semibold text-[#23824a]">
                                    Homepage content saved successfully.
                                </span>
                            )}
                        </div>
                    </form>

                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                        <div className="rounded-xl border border-[#e4ebe6] bg-white p-3 shadow-[0_3px_13px_rgba(31,70,48,0.035)]">
                            <div className="flex items-center gap-3">
                                <span className="rounded-lg bg-white p-2 text-[#1f7a42]">
                                    <Tag size={18} />
                                </span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-[0.18em] text-[#6b7b70] uppercase">Categories</p>
                                    <h3 className="font-display text-lg font-bold text-[#173b27]">Edit category structure</h3>
                                </div>
                            </div>
                            <p className="mt-2 text-[10px] leading-4 text-[#6a7c70]">
                                Review all category entries, update their names and hierarchy, and reorganize your storefront layout.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Link
                                    href={route('admin.categories')}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#188747] px-2.5 py-1.5 text-[9px] font-semibold text-white hover:bg-[#126d39]"
                                >
                                    Edit categories
                                </Link>
                                <form onSubmit={clearCategories} className="inline-block">
                                    <button
                                        type="submit"
                                        disabled={categoriesForm.processing}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#eccac3] px-2.5 py-1.5 text-[9px] font-semibold text-[#a23b2d] hover:bg-[#fbe8e5] disabled:opacity-50"
                                    >
                                        <Trash2 size={15} /> Delete all categories
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#e4ebe6] bg-white p-3 shadow-[0_3px_13px_rgba(31,70,48,0.035)]">
                            <div className="flex items-center gap-3">
                                <span className="rounded-lg bg-white p-2 text-[#1f7a42]">
                                    <Warehouse size={18} />
                                </span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-[0.18em] text-[#6b7b70] uppercase">Products</p>
                                    <h3 className="font-display text-lg font-bold text-[#173b27]">Edit product catalog</h3>
                                </div>
                            </div>
                            <p className="mt-2 text-[10px] leading-4 text-[#6a7c70]">
                                Manage product listings, approval states, and pricing details from one place before customers browse the storefront.
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Link
                                    href={route('admin.products')}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#188747] px-2.5 py-1.5 text-[9px] font-semibold text-white hover:bg-[#126d39]"
                                >
                                    Edit products
                                </Link>
                                <form onSubmit={clearProducts} className="inline-block">
                                    <button
                                        type="submit"
                                        disabled={productsForm.processing}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#eccac3] px-2.5 py-1.5 text-[9px] font-semibold text-[#a23b2d] hover:bg-[#fbe8e5] disabled:opacity-50"
                                    >
                                        <Trash2 size={15} /> Delete all products
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="rounded-xl border border-[#f0ddd8] bg-white p-3 shadow-[0_3px_13px_rgba(31,70,48,0.035)]">
                            <div className="flex items-center gap-3">
                                <span className="rounded-lg bg-white p-2 text-[#b9574a]">
                                    <Trash2 size={18} />
                                </span>
                                <div>
                                    <p className="text-[11px] font-bold tracking-[0.18em] text-[#a86618] uppercase">Orders</p>
                                    <h3 className="font-display text-lg font-bold text-[#173b27]">Clear order history</h3>
                                </div>
                            </div>
                            <p className="mt-2 text-[10px] leading-4 text-[#6a7c70]">
                                Permanently remove every active and archived order from the marketplace database.
                            </p>
                            <form onSubmit={clearOrders} className="mt-3">
                                <button
                                    type="submit"
                                    disabled={ordersForm.processing}
                                    className="inline-flex items-center gap-2 rounded-lg border border-[#eccac3] px-3.5 py-2 text-sm font-semibold text-[#a23b2d] hover:bg-[#fbe8e5] disabled:opacity-50"
                                >
                                    <Trash2 size={15} /> {ordersForm.processing ? 'Deleting orders...' : 'Delete all orders'}
                                </button>
                            </form>
                        </div>
                    </div>
                </section>
            </PortalLayout>
        </>
    );
}
