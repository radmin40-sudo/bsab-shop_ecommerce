import { PortalLayout } from '@/components/portal-layout';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Box,
    CircleDollarSign,
    ClipboardList,
    Download,
    Eye,
    FileText,
    MessageSquareText,
    Package,
    Plus,
    ShoppingCart,
    Store,
    Users,
} from 'lucide-react';

type ChartPoint = { label: string; sales: number; orders: number };
type TrendPoint = { label: string; value: number };
type Status = { status: string; total: number };
type Category = { id: number; name: string; products_count: number; revenue: number };
type RecentOrder = {
    id: number;
    order_number: string;
    status: string;
    total: string;
    created_at: string;
    user?: { name: string } | null;
};
type TopProduct = {
    id: number;
    name: string;
    image: string | null;
    unitsSold: number;
    revenue: number;
    views: number;
};

type DashboardProps = {
    metrics: {
        grossSales: number;
        salesChange: number | null;
        orders: number;
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
    chart: ChartPoint[];
    orderStatuses: Status[];
    topCategories: Category[];
    recentOrders: RecentOrder[];
    topProducts: TopProduct[];
    productPerformance: { id: number; name: string; views: number; unitsSold: number }[];
    customerGrowth: TrendPoint[];
    productViewsTrend: TrendPoint[];
    pendingReviewsTrend: TrendPoint[];
    conversionTrend: TrendPoint[];
    generatedAt: string;
};

const statusColors: Record<string, string> = {
    pending: '#f9b847',
    processing: '#4da5c7',
    shipped: '#7a8cdf',
    delivered: '#36a87b',
    cancelled: '#e26e68',
};

function money(value: number) {
    return `₱${new Intl.NumberFormat('en-PH', { maximumFractionDigits: 0 }).format(value)}`;
}

function statusTone(status: string) {
    if (['completed', 'delivered', 'paid', 'approved'].includes(status)) return 'bg-[#e8f5ec] text-[#25834d]';
    if (['cancelled', 'rejected', 'failed'].includes(status)) return 'bg-[#fff0ed] text-[#bd5144]';
    return 'bg-[#fff3dc] text-[#a66a17]';
}

function Sparkline({ values, color = '#26945d' }: { values: number[]; color?: string }) {
    const max = Math.max(...values, 1);
    const points = values.map((value, index) => {
        const x = values.length < 2 ? 50 : (index / (values.length - 1)) * 100;
        const y = 27 - (value / max) * 22;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox="0 0 100 30" className="h-8 w-20 overflow-visible" role="img" aria-label="Recent trend">
            <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function LineChart({ points, color = '#25945b', label }: { points: TrendPoint[]; color?: string; label: string }) {
    const max = Math.max(...points.map((point) => point.value), 1);
    const coords = points.map((point, index) => ({
        ...point,
        x: points.length < 2 ? 300 : (index / (points.length - 1)) * 600,
        y: 155 - (point.value / max) * 120,
    }));
    const line = coords.map((point) => `${point.x},${point.y}`).join(' ');
    const area = coords.length ? `0,160 ${line} 600,160` : '';
    const step = Math.max(1, Math.ceil(points.length / 10));

    return (
        <div className="min-w-0">
            <svg viewBox="0 0 600 180" className="h-40 w-full overflow-visible" role="img" aria-label={label} preserveAspectRatio="none">
                {[25, 65, 105, 145].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#edf2ee" strokeDasharray="3 5" />)}
                {coords.length > 0 && <polygon points={area} fill={color} fillOpacity=".09" />}
                {coords.length > 0 && <polyline points={line} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
                {coords.map((point) => (
                    <circle key={point.label} cx={point.x} cy={point.y} r="4" fill="white" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke">
                        <title>{`${point.label}: ${point.value.toLocaleString()}`}</title>
                    </circle>
                ))}
            </svg>
            <div className="mt-1 flex justify-between gap-1 text-[9px] font-medium text-[#89968e]">
                {points.filter((_, index) => index % step === 0 || index === points.length - 1).map((point) => <span key={point.label}>{point.label}</span>)}
            </div>
        </div>
    );
}

function Panel({ title, subtitle, action, children, className = '' }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
    return (
        <section className={`min-w-0 rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_13px_rgba(31,70,48,0.045)] sm:p-5 ${className}`}>
            <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                    <h2 className="truncate text-sm font-bold text-[#25372c]">{title}</h2>
                    {subtitle && <p className="mt-0.5 text-[10px] text-[#7d8b82]">{subtitle}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

export default function AdminDashboard({
    metrics,
    chart,
    orderStatuses,
    topCategories,
    recentOrders,
    topProducts,
    productPerformance,
    customerGrowth,
    productViewsTrend,
    pendingReviewsTrend,
    conversionTrend,
    generatedAt,
}: DashboardProps) {
    const totalStatusOrders = orderStatuses.reduce((total, item) => total + item.total, 0);
    const peak = chart.reduce((best, point) => point.sales > best.sales ? point : best, chart[0] ?? { label: '', sales: 0, orders: 0 });
    const categoryMax = Math.max(...topCategories.map((category) => category.products_count), 1);
    const statusGradient = (() => {
        if (!totalStatusOrders) return '#eaf0eb 0% 100%';
        let cursor = 0;
        return orderStatuses.filter((item) => item.total > 0).map((item) => {
            const start = cursor;
            cursor += (item.total / totalStatusOrders) * 100;
            return `${statusColors[item.status] ?? '#83a18d'} ${start}% ${cursor}%`;
        }).join(', ');
    })();
    const catalogCards = [
        { label: 'Products', value: metrics.products, href: '/admin/products', Icon: Box },
        { label: 'Pending review', value: metrics.pendingProducts, href: '/admin/products', Icon: ClipboardList },
        { label: 'Categories', value: metrics.categories, href: '/admin/categories', Icon: Store },
    ];
    const exportReport = () => {
        const rows = [
            ['Metric', 'Value'],
            ['Gross sales', money(metrics.grossSales)],
            ['Orders', String(metrics.orders)],
            ['Active sellers', String(metrics.activeSellers)],
            ['Customers', String(metrics.customers)],
            ['Products', String(metrics.products)],
            ['Pending reviews', String(metrics.pendingReviews)],
            [],
            ['Order ID', 'Customer', 'Amount', 'Status', 'Date'],
            ...recentOrders.map((order) => [order.order_number, order.user?.name ?? 'Unknown customer', money(Number(order.total)), order.status, order.created_at]),
        ];
        const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
        const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'bsab-marketplace-report.csv';
        anchor.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <Head title="Admin overview" />
            <PortalLayout role="admin" title="Platform overview" eyebrow="Live marketplace data">
                <div className="mb-4 flex min-w-0 flex-col justify-between gap-3 sm:mb-5 sm:flex-row sm:items-end">
                    <div className="min-w-0">
                        <h1 className="text-2xl leading-tight font-bold tracking-tight text-[#174c3e] sm:text-[29px]">Good morning, admin.</h1>
                        <p className="mt-1 text-xs leading-5 text-[#6a7c70]">Every number below is calculated from your live marketplace database.</p>
                    </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: 'Gross sales', value: money(metrics.grossSales), detail: metrics.salesChange === null ? 'No prior paid sales' : `${metrics.salesChange >= 0 ? '+' : ''}${metrics.salesChange}% vs previous 30 days`, Icon: CircleDollarSign, values: chart.map((point) => point.sales) },
                        { label: 'Orders', value: metrics.orders, detail: `${metrics.awaitingOrders} awaiting fulfillment`, Icon: ShoppingCart, values: chart.map((point) => point.orders) },
                        { label: 'Active sellers', value: metrics.activeSellers, detail: `${metrics.newSellers} new this month`, Icon: Store, values: customerGrowth.map((point) => point.value) },
                        { label: 'Customers', value: metrics.customers, detail: `${metrics.newCustomers} new this month`, Icon: Users, values: customerGrowth.map((point) => point.value) },
                    ].map(({ label, value, detail, Icon, values }) => (
                        <div key={label} className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e4ebe6] bg-white p-3.5 shadow-[0_3px_13px_rgba(31,70,48,0.045)]">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-[#258553]"><Icon size={17} /></span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[10px] font-medium text-[#607166]">{label}</p>
                                <p className="mt-0.5 text-xl leading-none font-bold text-[#1c4b3d]">{value}</p>
                                <p className="mt-1 truncate text-[9px] text-[#829087]">{detail}</p>
                            </div>
                            <Sparkline values={values} />
                        </div>
                    ))}
                </div>

                <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
                    {catalogCards.map(({ label, value, href, Icon }) => (
                        <Link key={label} href={href} className="group flex min-w-0 items-center gap-3 rounded-xl border border-[#e4ebe6] bg-white p-3 shadow-[0_3px_13px_rgba(31,70,48,0.045)] transition hover:border-[#9acbaf]">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-[#258553]"><Icon size={17} /></span>
                            <span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-medium text-[#607166]">{label}</span><strong className="mt-0.5 block text-base leading-none text-[#1c4b3d]">{value}</strong></span>
                            <ArrowRight size={15} className="text-[#387a56] transition group-hover:translate-x-0.5" />
                        </Link>
                    ))}
                </div>

                <div className="mt-2.5 grid min-w-0 gap-2.5 xl:grid-cols-[minmax(0,1.8fr)_minmax(280px,.9fr)]">
                    <Panel title="Revenue overview" subtitle="Paid sales, last 30 days" action={<span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf6ee] px-2.5 py-1 text-[9px] font-bold text-[#287d48]"><span className="h-1.5 w-1.5 rounded-full bg-[#26945d]" /> Live</span>}>
                        <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_75px]">
                            <LineChart points={chart.map(({ label, sales }) => ({ label, value: sales }))} label="Paid sales over the last 30 days" />
                            <div className="flex items-center justify-between border-t border-[#edf2ee] pt-2 sm:block sm:border-t-0 sm:border-l sm:pl-3 sm:pt-5">
                                <div><p className="text-[9px] text-[#7d8b82]">Net sales</p><strong className="mt-1 block text-lg text-[#1b4c3d]">{money(metrics.grossSales)}</strong></div>
                                {peak.sales > 0 && <p className="text-[9px] text-[#829087]">Peak {peak.label}</p>}
                            </div>
                        </div>
                    </Panel>

                    <Panel title="Order health" subtitle="Status breakdown">
                        <div className="mt-3 flex flex-col items-center gap-4 sm:flex-row xl:flex-col 2xl:flex-row">
                            <div className="relative h-28 w-28 shrink-0 rounded-full" style={{ background: `conic-gradient(${statusGradient})` }}>
                                <div className="absolute inset-[12px] flex flex-col items-center justify-center rounded-full bg-white">
                                    <strong className="text-xl leading-none text-[#254c3b]">{metrics.orders}</strong>
                                    <span className="mt-1 text-[9px] text-[#78877e]">Total orders</span>
                                </div>
                            </div>
                            <div className="w-full space-y-1.5">
                                {orderStatuses.map((item) => (
                                    <div key={item.status} className="flex items-center justify-between gap-2 text-[9px]">
                                        <span className="flex items-center gap-1.5 capitalize text-[#617168]"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[item.status] ?? '#83a18d' }} />{item.status}</span>
                                        <strong className="text-[#53665a]">{item.total}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Link href="/admin/orders" className="mt-3 flex h-8 items-center justify-center gap-1 rounded-lg border border-[#dfe8e2] text-[10px] font-semibold text-[#34734e] transition hover:bg-[#f5faf6]">View all orders <ArrowRight size={12} /></Link>
                    </Panel>
                </div>

                <div className="mt-2.5 grid min-w-0 gap-2.5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(210px,.85fr)]">
                    <Panel title="Recent orders" subtitle="Latest transactions" action={<Link href="/admin/orders" className="shrink-0 text-[10px] font-semibold text-[#287e4a] hover:underline">View all →</Link>}>
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full min-w-[400px] text-left text-[9px]">
                                <thead className="border-b border-[#edf1ee] text-[#87948c]"><tr><th className="px-1.5 py-2 font-medium">Order ID</th><th className="px-1.5 py-2 font-medium">Customer</th><th className="px-1.5 py-2 font-medium">Amount</th><th className="px-1.5 py-2 font-medium">Status</th></tr></thead>
                                <tbody className="divide-y divide-[#f0f3f1]">
                                    {recentOrders.length ? recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="max-w-32 truncate px-1.5 py-2.5 font-medium text-[#405449]">{order.order_number}</td>
                                            <td className="px-1.5 py-2.5 text-[#68786e]">{order.user?.name ?? 'Unknown customer'}</td>
                                            <td className="px-1.5 py-2.5 font-semibold text-[#405449]">{money(Number(order.total))}</td>
                                            <td className="px-1.5 py-2.5"><span className={`inline-flex rounded-full px-2 py-0.5 font-semibold capitalize ${statusTone(order.status)}`}>{order.status}</span></td>
                                        </tr>
                                    )) : <tr><td colSpan={4} className="px-1.5 py-5 text-center text-[#829087]">No orders recorded yet.</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </Panel>

                    <Panel title="Catalog mix" subtitle="Top categories">
                        <div className="mt-3 space-y-2.5">
                            {topCategories.length ? topCategories.map((category) => (
                                <div key={category.id} className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#edf7f0] text-[#368357]"><Package size={11} /></span>
                                    <span className="w-16 shrink-0 truncate text-[9px] font-medium text-[#5a6b60]">{category.name}</span>
                                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-[#edf1ee]"><span className="block h-full rounded-full bg-[#29925c]" style={{ width: `${Math.max((category.products_count / categoryMax) * 100, 4)}%` }} /></span>
                                    <span className="w-12 shrink-0 text-right text-[9px] text-[#78877e]">{category.products_count} products</span>
                                </div>
                            )) : <p className="py-4 text-center text-[10px] text-[#829087]">No categories recorded yet.</p>}
                        </div>
                    </Panel>

                    <Panel title="Quick actions" subtitle="Common admin tasks">
                        <div className="mt-3 grid gap-1.5">
                            <Link href="/admin/products" className="flex h-8 items-center justify-center gap-2 rounded-md bg-[#188747] text-[10px] font-semibold text-white hover:bg-[#126d39]"><Plus size={12} /> Add product</Link>
                            <Link href="/admin/orders" className="flex h-8 items-center justify-center gap-2 rounded-md border border-[#d5e3d9] text-[10px] font-semibold text-[#346848] hover:bg-[#f5faf6]"><ShoppingCart size={12} /> View orders</Link>
                            <button type="button" onClick={exportReport} className="flex h-8 items-center justify-center gap-2 rounded-md border border-[#d5e3d9] text-[10px] font-semibold text-[#346848] hover:bg-[#f5faf6]"><Download size={12} /> Export reports</button>
                        </div>
                    </Panel>
                </div>

                <div className="mt-2.5 grid min-w-0 gap-2.5 xl:grid-cols-2">
                    <Panel title="Sales by Category" subtitle="Paid sales, last 30 days">
                        <div className="mt-4 space-y-2.5">
                            {topCategories.length ? topCategories.slice(0, 6).map((category) => {
                                const maxRevenue = Math.max(...topCategories.map((item) => item.revenue), 1);
                                return <div key={category.id} className="flex items-center gap-2.5"><span className="w-20 shrink-0 truncate text-[9px] text-[#64746a]">{category.name}</span><span className="h-2 flex-1 overflow-hidden rounded-full bg-[#edf2ee]"><span className="block h-full rounded-full bg-[#31a476]" style={{ width: `${Math.max((category.revenue / maxRevenue) * 100, category.revenue ? 4 : 0)}%` }} /></span><span className="w-14 text-right text-[9px] font-medium text-[#718077]">{money(category.revenue)}</span></div>;
                            }) : <p className="py-4 text-center text-[10px] text-[#829087]">No paid category sales in this period.</p>}
                        </div>
                    </Panel>
                    <Panel title="Order Trend" subtitle="Orders placed, last 30 days">
                        <div className="mt-3"><LineChart points={chart.map(({ label, orders }) => ({ label, value: orders }))} color="#43a8a0" label="Order trend over the last 30 days" /></div>
                    </Panel>
                    <Panel title="Customer Growth" subtitle="New customer registrations, last 30 days">
                        <div className="mt-3"><LineChart points={customerGrowth} color="#568fc1" label="Customer registrations over the last 30 days" /></div>
                    </Panel>
                    <Panel title="Product Performance" subtitle="Most-viewed products">
                        <div className="mt-3 space-y-2">
                            {productPerformance.length ? productPerformance.map((product) => <div key={product.id} className="flex items-center gap-2"><span className="min-w-0 flex-1 truncate text-[10px] text-[#53655a]">{product.name}</span><span className="text-[9px] text-[#859188]">{product.views.toLocaleString()} views · {product.unitsSold} sold</span><Sparkline values={productViewsTrend.map((point) => point.value)} /></div>) : <p className="py-4 text-center text-[10px] text-[#829087]">No product view data recorded yet.</p>}
                        </div>
                    </Panel>
                    <Panel title="Marketplace Conversion Rate" subtitle="Paid orders compared with tracked product-view sessions">
                        <div className="mt-3 flex items-end justify-between gap-4">
                            <div><strong className="text-2xl text-[#1d4b3b]">{metrics.conversionRate === null ? '—' : `${metrics.conversionRate}%`}</strong><p className="mt-1 text-[9px] text-[#829087]">{metrics.conversionRate === null ? 'Not enough tracked sessions' : 'Last 30 days'}</p></div>
                            <div className="w-2/3"><LineChart points={conversionTrend} color="#8e73c1" label="Marketplace conversion rate over the last 30 days" /></div>
                        </div>
                    </Panel>
                    <Panel title="Shop Visits" subtitle={metrics.visitsTracked ? 'Tracked marketplace visits, last 30 days' : 'Shop-page visits are not tracked yet'}>
                        <div className="mt-3">
                            {metrics.visitsTracked ? <LineChart points={productViewsTrend} color="#37a6b0" label="Tracked shop visits over the last 30 days" /> : <div className="flex h-40 items-center justify-center rounded-lg bg-[#f8fbf9] text-center text-[10px] text-[#829087]">No shop-visit tracking data available</div>}
                        </div>
                    </Panel>
                    <Panel title="Product Views" subtitle="Product page views, last 30 days" action={<span className="flex items-center gap-1 text-[9px] font-semibold text-[#5a8068]"><Eye size={12} /> {metrics.productViews.toLocaleString()} total</span>}>
                        <div className="mt-3"><LineChart points={productViewsTrend} color="#55a873" label="Product views over the last 30 days" /></div>
                    </Panel>
                    <Panel title="Pending Reviews" subtitle="Product reviews awaiting moderation" action={<span className="flex items-center gap-1 text-[9px] font-semibold text-[#a66a17]"><MessageSquareText size={12} /> {metrics.pendingReviews}</span>}>
                        <div className="mt-3"><LineChart points={pendingReviewsTrend} color="#e1a13d" label="Pending product reviews over the last 30 days" /></div>
                    </Panel>
                </div>

                <div className="mt-2.5 grid min-w-0 gap-2.5 xl:grid-cols-[minmax(0,1.35fr)_minmax(240px,.65fr)]">
                    <Panel title="Top selling products" subtitle="Best performing products" action={<Link href="/admin/products" className="text-[10px] font-semibold text-[#287e4a] hover:underline">View catalog</Link>}>
                        <div className="mt-3 divide-y divide-[#edf1ee]">
                            {topProducts.length ? topProducts.slice(0, 5).map((product, index) => (
                                <div key={product.id} className="flex min-w-0 items-center gap-2.5 py-2 first:pt-0">
                                    <span className="w-4 text-center text-[9px] font-semibold text-[#829087]">{index + 1}</span>
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#edf4ef] text-[#52725c]">
                                        {product.image ? <img src={product.image.startsWith('http') || product.image.startsWith('/') ? product.image : `/storage/${product.image}`} alt="" className="h-full w-full object-cover" /> : <Package size={15} />}
                                    </span>
                                    <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-[#405449]">{product.name}</p><p className="mt-0.5 text-[9px] text-[#89968e]">{product.unitsSold} sold</p></div>
                                    <span className="shrink-0 text-[10px] font-semibold text-[#405449]">{money(product.revenue)}</span>
                                    <Sparkline values={productViewsTrend.map((point) => point.value)} />
                                    <ArrowUpRight size={13} className="shrink-0 text-[#368357]" />
                                </div>
                            )) : <p className="py-5 text-center text-[10px] text-[#829087]">No product sales recorded yet.</p>}
                        </div>
                    </Panel>

                    <Panel title="Marketplace snapshot" subtitle="Live marketplace activity">
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            {[
                                { label: 'Registered customers', value: metrics.customers, Icon: Users },
                                { label: 'Active sellers', value: metrics.activeSellers, Icon: Store },
                                { label: 'Product views', value: metrics.productViews, Icon: Eye },
                                { label: 'Pending reviews', value: metrics.pendingReviews, Icon: FileText },
                            ].map(({ label, value, Icon }) => <div key={label} className="rounded-lg bg-[#f7faf8] p-2.5"><span className="flex items-center gap-1.5 text-[9px] text-[#718077]"><Icon size={12} className="text-[#348454]" />{label}</span><strong className="mt-1 block text-base text-[#254c3b]">{value}</strong></div>)}
                        </div>
                    </Panel>
                </div>

                <p className="mt-3 text-right text-[9px] text-[#98a39c]">Updated {new Date(generatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
            </PortalLayout>
        </>
    );
}
