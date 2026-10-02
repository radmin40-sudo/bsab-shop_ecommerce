import { PortalLayout } from '@/components/portal-layout';
import { Head, router } from '@inertiajs/react';
import { ArrowDownToLine, ArrowUpRight, Box, CalendarDays, CircleDollarSign, Eye, Package, ShoppingCart, Store, Users } from 'lucide-react';
import { useState } from 'react';

type Point = { label: string; sales: number; orders: number };
type TrendPoint = { label: string; value: number };
type OrderStatus = { status: string; total: number };
type Category = { id: number; name: string; products_count: number; revenue: number };
type Product = { id: number; name: string; image: string | null; unitsSold: number; revenue: number; views: number };
type RecentOrder = { id: number; order_number: string; total: string; status: string; created_at: string; user?: { name: string } | null };

type Props = {
    metrics: {
        grossSales: number;
        salesChange: number | null;
        orders: number;
        paidOrders: number;
        awaitingOrders: number;
        activeSellers: number;
        newSellers: number;
        customers: number;
        newCustomers: number;
        products: number;
        pendingProducts: number;
        categories: number;
        productViews: number;
        pendingReviews: number;
        conversionRate: number | null;
        visitsTracked: boolean;
    };
    chart: Point[];
    orderStatuses: OrderStatus[];
    topCategories: Category[];
    recentOrders: RecentOrder[];
    topProducts: Product[];
    productPerformance: { id: number; name: string; views: number; unitsSold: number }[];
    customerGrowth: TrendPoint[];
    productViewsTrend: TrendPoint[];
    pendingReviewsTrend: TrendPoint[];
    conversionTrend: TrendPoint[];
    period: { range: string; from: string; to: string; days: number };
    paymentOverview: { status: string; orders: number; amount: number }[];
};

const statusColors: Record<string, string> = {
    pending: '#e9aa38',
    processing: '#5299c9',
    accepted: '#7b82c9',
    shipped: '#8b6ec7',
    delivered: '#279660',
    cancelled: '#de6a61',
};

const formatMoney = (amount: number) => `₱${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)}`;

function Panel({
    title,
    subtitle,
    action,
    children,
    className = '',
}: {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <section className={`min-w-0 rounded-xl border border-[#e3ece6] bg-white p-4 shadow-[0_3px_14px_rgba(31,70,48,0.05)] sm:p-5 ${className}`}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="text-sm font-bold text-[#174c3e]">{title}</h2>
                    {subtitle && <p className="mt-1 text-[10px] text-[#7b8d82]">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

function Sparkline({ values }: { values: number[] }) {
    const max = Math.max(...values, 1);
    const points = values
        .map((value, index) => `${values.length < 2 ? 50 : (index / (values.length - 1)) * 100},${26 - (value / max) * 21}`)
        .join(' ');
    return (
        <svg viewBox="0 0 100 30" className="h-8 w-16 shrink-0" role="img" aria-label="Trend based on selected range">
            <polyline points={points} fill="none" stroke="#1caf7b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function LineChart({
    points,
    label,
    color = '#18b985',
    secondary,
}: {
    points: { label: string; value: number; secondary?: number }[];
    label: string;
    color?: string;
    secondary?: { label: string; color: string };
}) {
    const max = Math.max(...points.map((point) => point.value), ...points.map((point) => point.secondary ?? 0), 1);
    const coords = points.map((point, index) => ({
        ...point,
        x: points.length < 2 ? 300 : (index / (points.length - 1)) * 600,
        y: 150 - (point.value / max) * 125,
        y2: 150 - ((point.secondary ?? 0) / max) * 125,
    }));
    const line = coords.map((point) => `${point.x},${point.y}`).join(' ');
    const area = coords.length ? `0,160 ${line} 600,160` : '';
    const secondaryLine = coords.map((point) => `${point.x},${point.y2}`).join(' ');
    const step = Math.max(1, Math.ceil(points.length / 8));
    return (
        <div className="min-w-0">
            {secondary && (
                <div className="mb-2 flex gap-4 text-[9px] text-[#728278]">
                    <span className="flex items-center gap-1.5">
                        <i className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                        Revenue
                    </span>
                    <span className="flex items-center gap-1.5">
                        <i className="h-2 w-2 rounded-full" style={{ backgroundColor: secondary.color }} />
                        Orders
                    </span>
                </div>
            )}
            <svg viewBox="0 0 600 170" className="h-40 w-full overflow-visible" role="img" aria-label={label} preserveAspectRatio="none">
                {[25, 65, 105, 145].map((y) => (
                    <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#edf3ef" strokeDasharray="3 5" />
                ))}
                {coords.length > 0 && <polygon points={area} fill={color} fillOpacity=".09" />}
                {coords.length > 0 && (
                    <polyline
                        points={line}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        vectorEffect="non-scaling-stroke"
                    />
                )}
                {secondary && coords.length > 0 && (
                    <polyline
                        points={secondaryLine}
                        fill="none"
                        stroke={secondary.color}
                        strokeWidth="2"
                        strokeDasharray="5 4"
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                    />
                )}
                {coords.map((point) => (
                    <circle
                        key={point.label}
                        cx={point.x}
                        cy={point.y}
                        r="3.5"
                        fill="white"
                        stroke={color}
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                    >
                        <title>{`${point.label}: ${formatMoney(point.value)}${secondary ? `, ${point.secondary} orders` : ''}`}</title>
                    </circle>
                ))}
            </svg>
            <div className="mt-1 flex justify-between gap-1 text-[9px] text-[#829188]">
                {points
                    .filter((_, index) => index % step === 0 || index === points.length - 1)
                    .map((point) => (
                        <span key={point.label}>{point.label}</span>
                    ))}
            </div>
            {!points.length && <p className="py-5 text-center text-xs text-[#829188]">No activity recorded for this period.</p>}
        </div>
    );
}

export default function AdminAnalytics(props: Props) {
    const { metrics, chart, orderStatuses, topCategories, recentOrders, topProducts, customerGrowth, productViewsTrend, period, paymentOverview } =
        props;
    const [from, setFrom] = useState(period.from);
    const [to, setTo] = useState(period.to);
    const totalStatusOrders = orderStatuses.reduce((sum, item) => sum + item.total, 0);
    const paidSales = metrics.grossSales;
    const statusGradient = (() => {
        if (!totalStatusOrders) return '#edf2ee 0% 100%';
        let end = 0;
        return orderStatuses
            .filter((item) => item.total > 0)
            .map((item) => {
                const start = end;
                end += (item.total / totalStatusOrders) * 100;
                return `${statusColors[item.status] ?? '#83a18d'} ${start}% ${end}%`;
            })
            .join(', ');
    })();

    const chooseRange = (range: string) => router.get('/admin/analytics', { range }, { preserveScroll: true });
    const exportReport = () => {
        const rows = [
            ['Metric', 'Value'],
            ['Date range', `${period.from} to ${period.to}`],
            ['Sales', formatMoney(paidSales)],
            ['Orders', String(metrics.orders)],
            ['Customers', String(metrics.customers)],
            ['Products', String(metrics.products)],
            [],
            ['Order number', 'Customer', 'Total', 'Status', 'Date'],
            ...recentOrders.map((order) => [order.order_number, order.user?.name ?? 'Unknown customer', order.total, order.status, order.created_at]),
        ];
        const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'bsab-marketplace-analytics.csv';
        link.click();
        URL.revokeObjectURL(url);
    };

    const kpis = [
        {
            label: 'Total Sales',
            value: formatMoney(paidSales),
            detail:
                metrics.salesChange === null
                    ? 'No comparable paid sales'
                    : `${metrics.salesChange >= 0 ? '+' : ''}${metrics.salesChange}% vs previous period`,
            Icon: ShoppingCart,
            values: chart.map((point) => point.sales),
        },
        {
            label: 'Total Orders',
            value: metrics.orders.toLocaleString(),
            detail: `${metrics.awaitingOrders} awaiting fulfillment`,
            Icon: Package,
            values: chart.map((point) => point.orders),
        },
        {
            label: 'Total Customers',
            value: metrics.customers.toLocaleString(),
            detail: `${metrics.newCustomers} new in selected range`,
            Icon: Users,
            values: customerGrowth.map((point) => point.value),
        },
        {
            label: 'Total Products',
            value: metrics.products.toLocaleString(),
            detail: `${metrics.pendingProducts} pending review`,
            Icon: Box,
            values: productViewsTrend.map((point) => point.value),
        },
        {
            label: 'Conversion Rate',
            value: metrics.conversionRate === null ? '—' : `${metrics.conversionRate}%`,
            detail: metrics.conversionRate === null ? 'Not enough tracked sessions' : 'Paid orders / tracked sessions',
            Icon: Users,
            values: props.conversionTrend.map((point) => point.value),
        },
        {
            label: 'Average Order Value',
            value: metrics.paidOrders ? formatMoney(paidSales / metrics.paidOrders) : '—',
            detail: metrics.paidOrders ? 'Paid sales per paid order' : 'No paid orders in this period',
            Icon: CircleDollarSign,
            values: chart.map((point) => (point.orders ? point.sales / point.orders : 0)),
        },
    ];

    return (
        <>
            <Head title="Analytics" />
            <PortalLayout role="admin" title="Analytics" eyebrow="Marketplace performance">
                <div className="mb-5 flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
                    <div>
                        <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold text-[#26844e]">
                            <ArrowUpRight size={13} /> <a href="/admin">Back to dashboard</a>
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight text-[#174c3e] sm:text-[30px]">Analytics</h1>
                        <p className="mt-1 max-w-2xl text-xs text-[#718278]">
                            Understand marketplace performance with real-time sales, orders, customers, products, and engagement insights.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <label className="flex h-9 items-center gap-2 rounded-lg border border-[#dce8e0] bg-white px-2.5 text-xs text-[#52675a]">
                            <CalendarDays size={14} className="text-[#338b5b]" />
                            <span className="sr-only">Analytics date range</span>
                            <select
                                aria-label="Analytics date range"
                                value={period.range}
                                onChange={(event) => chooseRange(event.target.value)}
                                className="bg-transparent outline-none"
                            >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="year">This year</option>
                                <option value="custom">Custom range</option>
                            </select>
                        </label>
                        <button
                            type="button"
                            onClick={exportReport}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#188747] px-3.5 text-xs font-semibold text-white transition hover:bg-[#126d39]"
                        >
                            <ArrowDownToLine size={14} /> Export report
                        </button>
                    </div>
                </div>
                {period.range === 'custom' && (
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get('/admin/analytics', { range: 'custom', from, to }, { preserveScroll: true });
                        }}
                        className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-[#e3ece6] bg-white p-3"
                    >
                        <label className="grid gap-1 text-[10px] text-[#718278]">
                            From
                            <input
                                type="date"
                                value={from}
                                onChange={(event) => setFrom(event.target.value)}
                                className="h-8 rounded-md border border-[#dce8e0] px-2 text-xs text-[#344b3d]"
                                required
                            />
                        </label>
                        <label className="grid gap-1 text-[10px] text-[#718278]">
                            To
                            <input
                                type="date"
                                value={to}
                                onChange={(event) => setTo(event.target.value)}
                                className="h-8 rounded-md border border-[#dce8e0] px-2 text-xs text-[#344b3d]"
                                required
                            />
                        </label>
                        <button className="h-8 rounded-md bg-[#188747] px-3 text-xs font-semibold text-white">Apply range</button>
                    </form>
                )}

                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
                    {kpis.map(({ label, value, detail, Icon, values }) => (
                        <article
                            key={label}
                            className="flex min-w-0 items-center gap-2.5 rounded-xl border border-[#e3ece6] bg-white p-3 shadow-[0_3px_14px_rgba(31,70,48,0.05)]"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e8f6ed] text-[#168651]">
                                <Icon size={17} />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[10px] text-[#718278]">{label}</p>
                                <strong className="mt-0.5 block truncate text-lg leading-tight text-[#174c3e]">{value}</strong>
                                <p className="mt-1 truncate text-[9px] text-[#85938a]">{detail}</p>
                            </div>
                            <Sparkline values={values} />
                        </article>
                    ))}
                </div>

                <div className="mt-3 grid min-w-0 gap-3 xl:grid-cols-12">
                    <Panel title="Sales performance" subtitle={`Marketplace revenue for ${period.from} to ${period.to}`} className="xl:col-span-6">
                        <div className="mt-4">
                            <LineChart
                                points={chart.map((point) => ({ label: point.label, value: point.sales, secondary: point.orders }))}
                                label="Sales and order activity for selected date range"
                                secondary={{ label: 'Orders', color: '#5a9dc9' }}
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-3 border-t border-[#edf2ee] pt-3 text-[10px]">
                            <div>
                                <span className="text-[#829188]">Net sales</span>
                                <strong className="mt-1 block text-sm text-[#174c3e]">{formatMoney(paidSales)}</strong>
                            </div>
                            <div>
                                <span className="text-[#829188]">Gross sales</span>
                                <strong className="mt-1 block text-sm text-[#174c3e]">—</strong>
                                <small className="mt-1 block text-[#9aa59e]">Gross order totals are not separately tracked.</small>
                            </div>
                            <div>
                                <span className="text-[#829188]">Refunds</span>
                                <strong className="mt-1 block text-sm text-[#174c3e]">—</strong>
                                <small className="mt-1 block text-[#9aa59e]">Refund totals are not available.</small>
                            </div>
                        </div>
                    </Panel>
                    <Panel title="Order status" subtitle="Orders grouped by current fulfillment status" className="xl:col-span-3">
                        <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row xl:flex-col 2xl:flex-row">
                            <div className="relative h-32 w-32 shrink-0 rounded-full" style={{ background: `conic-gradient(${statusGradient})` }}>
                                <div className="absolute inset-3.25 flex flex-col items-center justify-center rounded-full bg-white">
                                    <strong className="text-xl text-[#174c3e]">{metrics.orders}</strong>
                                    <span className="text-[9px] text-[#829188]">Total orders</span>
                                </div>
                            </div>
                            <div className="w-full space-y-2">
                                {orderStatuses.map((item) => (
                                    <div key={item.status} className="flex items-center justify-between gap-2 text-[10px]">
                                        <span className="flex items-center gap-1.5 text-[#65766b] capitalize">
                                            <i className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[item.status] ?? '#83a18d' }} />
                                            {item.status}
                                        </span>
                                        <strong className="text-[#40584a]">{item.total}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Panel>
                    <Panel
                        title="Recent orders"
                        subtitle="Latest transactions from the marketplace"
                        action={
                            <a href="/admin/orders" className="text-[10px] font-semibold text-[#28844e]">
                                View all
                            </a>
                        }
                        className="xl:col-span-3"
                    >
                        <div className="mt-3 space-y-2">
                            {recentOrders.length ? (
                                recentOrders.slice(0, 4).map((order) => (
                                    <div key={order.id} className="flex items-start gap-2 rounded-lg border border-[#edf2ee] p-2.5">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#e9f6ed] text-[#258653]">
                                            <Package size={15} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <strong className="truncate text-[10px] text-[#245241]">#{order.order_number}</strong>
                                                <span className="rounded-full bg-[#e8f5ec] px-2 py-0.5 text-[8px] text-[#25834d] capitalize">
                                                    {order.status}
                                                </span>
                                            </div>
                                            <p className="mt-1 text-[9px] text-[#809087]">
                                                {formatMoney(Number(order.total))} · {order.user?.name ?? 'Customer'}
                                            </p>
                                            <p className="mt-1 text-[8px] text-[#9aa59e]">{order.created_at}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="py-8 text-center text-xs text-[#829188]">No orders recorded yet.</p>
                            )}
                        </div>
                    </Panel>

                    <Panel
                        title="Top performing products"
                        subtitle="Products generating the most sales and views"
                        action={
                            <a href="/admin/products" className="text-[10px] font-semibold text-[#28844e]">
                                View all products
                            </a>
                        }
                        className="xl:col-span-5"
                    >
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full min-w-130 text-left text-[10px]">
                                <thead className="bg-[#f5faf7] text-[#75867b]">
                                    <tr>
                                        {['Product', 'Units sold', 'Revenue', 'Views', 'Conversion'].map((name) => (
                                            <th key={name} className="px-2 py-2 font-medium">
                                                {name}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#edf2ee]">
                                    {topProducts.length ? (
                                        topProducts.slice(0, 5).map((product, index) => (
                                            <tr key={product.id}>
                                                <td className="max-w-47.5 px-2 py-2.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] text-[#91a097]">{index + 1}</span>
                                                        {product.image ? (
                                                            <img
                                                                src={
                                                                    product.image.startsWith('http') || product.image.startsWith('/')
                                                                        ? product.image
                                                                        : `/storage/${product.image}`
                                                                }
                                                                alt=""
                                                                className="h-8 w-8 rounded-md object-cover"
                                                            />
                                                        ) : (
                                                            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#edf7f0] text-[#368357]">
                                                                <Package size={14} />
                                                            </span>
                                                        )}
                                                        <span className="truncate font-semibold text-[#40584a]">{product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2.5 text-[#596c60]">{product.unitsSold}</td>
                                                <td className="px-2 py-2.5 font-medium text-[#40584a]">{formatMoney(product.revenue)}</td>
                                                <td className="px-2 py-2.5 text-[#596c60]">{product.views}</td>
                                                <td className="px-2 py-2.5 text-[#596c60]">
                                                    {product.views ? `${((product.unitsSold / product.views) * 100).toFixed(1)}%` : '—'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-7 text-center text-[#829188]">
                                                No product sales recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Panel>
                    <Panel title="Customer growth" subtitle="New customer registrations over the selected period" className="xl:col-span-4">
                        <div className="mt-4">
                            <LineChart
                                points={customerGrowth.map((point) => ({ label: point.label, value: point.value }))}
                                label="Customer registration trend for the selected date range"
                                color="#36a978"
                            />
                        </div>
                        <div className="mt-4 grid grid-cols-3 border-t border-[#edf2ee] pt-3 text-[10px]">
                            <div>
                                <span className="text-[#829188]">Total customers</span>
                                <strong className="mt-1 block text-sm text-[#174c3e]">{metrics.customers}</strong>
                            </div>
                            <div>
                                <span className="text-[#829188]">New in range</span>
                                <strong className="mt-1 block text-sm text-[#174c3e]">{metrics.newCustomers}</strong>
                            </div>
                            <div>
                                <span className="text-[#829188]">Repeat purchase</span>
                                <strong className="mt-1 block text-sm text-[#174c3e]">—</strong>
                                <small className="mt-1 block text-[#9aa59e]">Requires customer-level order attribution.</small>
                            </div>
                        </div>
                    </Panel>
                    <Panel
                        title="Marketplace engagement"
                        subtitle={
                            metrics.visitsTracked
                                ? 'Tracked shopper activity in the selected period'
                                : 'Tracked product activity; marketplace visits are not measured'
                        }
                        className="xl:col-span-3"
                    >
                        <div className="mt-4 space-y-3">
                            {[
                                ['Product views', metrics.productViews, Eye],
                                ['Active sellers', metrics.activeSellers, Store],
                                ['Products', metrics.products, Package],
                            ].map(([label, value, Icon]) => {
                                const MetricIcon = Icon as typeof Eye;
                                return (
                                    <div key={String(label)} className="flex items-center gap-2.5 rounded-lg bg-[#f6faf7] p-2.5">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#268652]">
                                            <MetricIcon size={15} />
                                        </span>
                                        <span className="min-w-0 flex-1 text-[10px] text-[#718278]">{String(label)}</span>
                                        <strong className="text-sm text-[#174c3e]">{Number(value).toLocaleString()}</strong>
                                    </div>
                                );
                            })}
                        </div>
                        <p className="mt-3 text-[9px] leading-4 text-[#8b9990]">
                            Visits, add-to-cart, and checkout events are not tracked in the available analytics records.
                        </p>
                    </Panel>
                    <Panel title="Sales by category" subtitle="Paid sales distributed across product categories" className="xl:col-span-6">
                        <div className="mt-4 grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)] sm:items-center">
                            <div
                                className="relative mx-auto h-32 w-32 rounded-full"
                                style={{
                                    background: `conic-gradient(${
                                        topCategories
                                            .map((category, index) => {
                                                const total = topCategories.reduce((sum, item) => sum + item.revenue, 0);
                                                const start = topCategories.slice(0, index).reduce((sum, item) => sum + item.revenue, 0);
                                                const colors = ['#199866', '#4ab58c', '#8bcdb0', '#69a8be', '#8d86c5', '#d1ad5f'];
                                                return `${colors[index % colors.length]} ${total ? (start / total) * 100 : 0}% ${total ? ((start + category.revenue) / total) * 100 : 100 / Math.max(topCategories.length, 1)}%`;
                                            })
                                            .join(', ') || '#edf2ee 0% 100%'
                                    }`,
                                }}
                            >
                                <div className="absolute inset-3.5 flex flex-col items-center justify-center rounded-full bg-white">
                                    <strong className="text-sm text-[#174c3e]">
                                        {formatMoney(topCategories.reduce((sum, item) => sum + item.revenue, 0))}
                                    </strong>
                                    <span className="text-[9px] text-[#829188]">Top categories</span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {topCategories.length ? (
                                    topCategories.slice(0, 6).map((category, index) => (
                                        <div key={category.id} className="flex items-center gap-2 text-[10px]">
                                            <i
                                                className="h-2 w-2 rounded-full"
                                                style={{
                                                    backgroundColor: ['#199866', '#4ab58c', '#8bcdb0', '#69a8be', '#8d86c5', '#d1ad5f'][index % 6],
                                                }}
                                            />
                                            <span className="min-w-0 flex-1 truncate text-[#5f7166]">{category.name}</span>
                                            <span className="text-[#829188]">{category.products_count} products</span>
                                            <strong className="w-20 text-right text-[#40584a]">{formatMoney(category.revenue)}</strong>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs text-[#829188]">No category records available.</p>
                                )}
                            </div>
                        </div>
                    </Panel>
                    <Panel title="Seller performance" subtitle="Active seller contribution" className="xl:col-span-6">
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {[
                                ['Active sellers', metrics.activeSellers],
                                ['New sellers', metrics.newSellers],
                                ['Seller products', metrics.products],
                                ['Orders', metrics.orders],
                            ].map(([label, value]) => (
                                <div key={String(label)} className="rounded-lg bg-[#f6faf7] p-3">
                                    <span className="block text-[9px] text-[#829188]">{label}</span>
                                    <strong className="mt-1 block text-base text-[#174c3e]">{Number(value).toLocaleString()}</strong>
                                </div>
                            ))}
                        </div>
                        <p className="mt-3 text-[9px] leading-4 text-[#8b9990]">
                            Seller-level revenue attribution is not available in the current summary data.
                        </p>
                    </Panel>
                    <Panel title="Payment overview" subtitle="Order totals grouped by payment status" className="xl:col-span-6">
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {paymentOverview.map((payment) => (
                                <div key={payment.status} className="rounded-lg bg-[#f6faf7] p-3">
                                    <span className="block text-[9px] text-[#829188] capitalize">
                                        {payment.status === 'pending' ? 'Pending payment' : payment.status}
                                    </span>
                                    <strong className="mt-1 block text-sm text-[#174c3e]">{formatMoney(payment.amount)}</strong>
                                    <small className="mt-1 block text-[9px] text-[#829188]">{payment.orders} orders</small>
                                </div>
                            ))}
                        </div>
                    </Panel>
                    <Panel title="Traffic sources" subtitle="Source attribution for marketplace visits" className="xl:col-span-6">
                        <div className="mt-4 flex min-h-32 flex-col items-center justify-center rounded-lg border border-dashed border-[#dce8e0] bg-[#f8fbf9] px-4 text-center">
                            <Eye size={19} className="text-[#48a878]" />
                            <p className="mt-2 text-xs font-semibold text-[#52675a]">Traffic sources are not tracked yet</p>
                            <p className="mt-1 max-w-sm text-[10px] leading-4 text-[#829188]">
                                Source-specific visit data is not available. This panel will show channel distribution when tracking is added.
                            </p>
                        </div>
                    </Panel>
                </div>
            </PortalLayout>
        </>
    );
}
