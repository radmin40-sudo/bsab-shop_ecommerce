import { Head, Link, useForm } from '@inertiajs/react';
import {
    Activity,
    Check,
    ChevronDown,
    CircleAlert,
    FileText,
    Info,
    Laptop,
    RefreshCw,
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
import { FormEvent, useMemo, useState } from 'react';

import { PortalLayout } from '@/components/portal-layout';

type AdminSettingsProps = {
    cache: { config: string; lastModified: number | null };
    logs: {
        size: number;
        updatedAt: string | null;
        entries: LogEntry[];
        stats: Record<'activeSessions' | 'uniqueDevices' | 'uniqueIps' | 'failedLogins' | 'securityAlerts' | 'systemErrors', number>;
    };
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

export default function AdminSettings({ cache, logs }: AdminSettingsProps) {
    const [query, setQuery] = useState('');
    const [severity, setSeverity] = useState('all');
    const [status, setStatus] = useState('all');
    const [eventPage, setEventPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
    const cacheForm = useForm({});
    const logsForm = useForm({});
    const categoriesForm = useForm({});
    const productsForm = useForm({});
    const ordersForm = useForm({});
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
            </PortalLayout>
        </>
    );
}
