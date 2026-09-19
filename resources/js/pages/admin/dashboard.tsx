import { PortalLayout, StatCard } from '@/components/portal-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, BarChart3, Box, CircleDollarSign, Clock3, Package, Plus, Store, Users } from 'lucide-react';

type DashboardProps = {
    metrics: { grossSales: number; salesChange: number | null; orders: number; awaitingOrders: number; activeSellers: number; newSellers: number; customers: number; newCustomers: number; products: number; pendingProducts: number; categories: number; vouchers: number };
    chart: { label: string; sales: number; orders: number }[];
    orderStatuses: { status: string; total: number }[];
    topCategories: { id: number; name: string; products_count: number }[];
    recentOrders: { id: number; order_number: string; status: string; payment_status: string; total: string; created_at: string; user?: { name: string } | null }[];
    generatedAt: string;
};

function money(value: number) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(value);
}

function shortNumber(value: number) {
    return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function statusTone(status: string) {
    if (['completed', 'delivered', 'paid', 'approved'].includes(status)) return 'bg-[#e7f4e8] text-[#23824a]';
    if (['cancelled', 'rejected', 'failed'].includes(status)) return 'bg-[#fbe8e5] text-[#bd5144]';
    return 'bg-[#fff1da] text-[#a86618]';
}

export default function AdminDashboard({ metrics, chart, orderStatuses, topCategories, recentOrders, generatedAt }: DashboardProps) {
    const maxSales = Math.max(...chart.map((point) => point.sales), 1);
    const totalStatusOrders = orderStatuses.reduce((total, item) => total + item.total, 0) || 1;
    const peak = chart.reduce((best, point) => (point.sales > best.sales ? point : best), chart[0] ?? { label: '', sales: 0, orders: 0 });
    const catalogCards = [
        ['Products', metrics.products, '/admin/products', Box],
        ['Pending review', metrics.pendingProducts, '/admin/products', Clock3],
        ['Categories', metrics.categories, '/admin/categories', Store],
        ['Vouchers', metrics.vouchers, '/admin/vouchers', CircleDollarSign],
    ] as const;

    return (
        <>
            <Head title="Admin overview" />
            <PortalLayout role="admin" title="Platform overview" eyebrow="Live marketplace data">
                <div className="mb-6 flex min-w-0 flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-end">
                    <div className="min-w-0">
                        <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#b06b38] uppercase">Database overview</p>
                        <h1 className="font-display mt-2 text-2xl leading-tight font-bold tracking-tight text-[#173b27] sm:text-4xl">Good morning, admin.</h1>
                        <p className="mt-2 text-sm leading-6 text-[#6a7c70]">Every number below is calculated from your live marketplace database.</p>
                    </div>
                    <Link href="/admin/products" className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] bg-[#173b27] px-4 text-sm font-semibold text-white transition hover:bg-[#245b3b] sm:w-auto">
                        <Plus size={16} /> Add product
                    </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Gross sales" value={money(metrics.grossSales)} detail={metrics.salesChange === null ? 'No prior paid sales' : `${metrics.salesChange >= 0 ? '+' : ''}${metrics.salesChange}% vs previous 30 days`} tone="green" />
                    <StatCard label="Orders" value={shortNumber(metrics.orders)} detail={`${metrics.awaitingOrders} awaiting fulfillment`} />
                    <StatCard label="Active sellers" value={shortNumber(metrics.activeSellers)} detail={`${metrics.newSellers} new this month`} tone="warm" />
                    <StatCard label="Customers" value={shortNumber(metrics.customers)} detail={`${metrics.newCustomers} new this month`} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {catalogCards.map(([label, value, href, Icon]) => (
                        <Link key={label} href={href} className="flex min-w-0 items-center gap-3 border border-[#def0e2] bg-white p-4 transition hover:border-[#9acb9d]">
                            <span className="rounded-lg bg-[#f0f8f0] p-2.5 text-[#287e4a]"><Icon size={17} /></span>
                            <span className="min-w-0"><span className="block truncate text-xs font-semibold text-[#7b8b80]">{label}</span><strong className="mt-1 block text-xl text-[#173b27]">{value}</strong></span>
                        </Link>
                    ))}
                </div>

                <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(280px,.75fr)]">
                    <section className="min-w-0 border bg-white p-4 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-bold tracking-[0.18em] text-[#b06b38] uppercase">Revenue overview</p><h2 className="font-display mt-2 text-lg font-bold text-[#173b27] sm:text-xl">Paid sales, last 30 days</h2></div><span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf6ee] px-2.5 py-1 text-[10px] font-bold text-[#287d48] uppercase"><BarChart3 size={13} /> Live</span></div>
                        <div className="mt-7 flex h-56 min-w-0 items-end gap-1 border-b border-l border-[#e5ece4] px-2 sm:gap-2">
                            {chart.map((point) => <div key={point.label} title={`${point.label}: ${money(point.sales)} · ${point.orders} orders`} className="group relative flex h-full min-w-0 flex-1 items-end"><span className="w-full rounded-t-lg bg-[#9acb9d] transition group-hover:bg-[#287e4a]" style={{ height: `${Math.max((point.sales / maxSales) * 100, point.sales ? 4 : 1)}%` }} /></div>)}
                        </div>
                        <div className="mt-3 flex justify-between pl-2 text-[10px] font-medium text-[#8b998e]"><span>{chart[0]?.label}</span><span>{chart[Math.floor(chart.length / 2)]?.label}</span><span>{chart.at(-1)?.label}</span></div>
                        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-[#5f7064]"><span className="h-2 w-2 rounded-full bg-[#287e4a]" /> Net sales <strong className="text-[#173b27]">{money(metrics.grossSales)}</strong>{peak.sales > 0 && <span className="text-xs text-[#829187]">Peak: {peak.label} ({money(peak.sales)})</span>}</div>
                    </section>

                    <section className="min-w-0 border bg-[#173b27] p-4 text-white sm:p-6">
                        <div className="flex items-start justify-between"><div><p className="text-[11px] font-bold tracking-[0.18em] text-[#a9d2a8] uppercase">Order health</p><h2 className="font-display mt-2 text-lg font-bold sm:text-xl">Status breakdown</h2></div><Package className="text-[#e4b878]" size={21} /></div>
                        <div className="mt-6 space-y-3">{orderStatuses.length ? orderStatuses.map((item) => <div key={item.status}><div className="mb-1 flex justify-between text-xs"><span className="capitalize text-[#d6e6d3]">{item.status}</span><strong>{item.total}</strong></div><div className="h-2 overflow-hidden rounded-full bg-[#345b3d]"><div className="h-full rounded-full bg-[#a9d2a8]" style={{ width: `${(item.total / totalStatusOrders) * 100}%` }} /></div></div>) : <p className="text-sm text-[#b4c8b5]">No orders recorded yet.</p>}</div>
                        <Link href="/admin/orders" className="mt-7 flex items-center justify-center rounded-lg border border-[#527657] py-2.5 text-xs font-semibold text-[#d6e6d3] transition hover:bg-[#285a38]">View all orders <ArrowUpRight size={14} className="ml-2" /></Link>
                    </section>
                </div>

                <div className="mt-4 grid min-w-0 gap-4 lg:grid-cols-[1.15fr_.85fr]">
                    <section className="min-w-0 border bg-white p-4 sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-[11px] font-bold tracking-[0.18em] text-[#b06b38] uppercase">Recent orders</p><h2 className="font-display mt-2 text-lg font-bold text-[#173b27] sm:text-xl">Latest transactions</h2></div><Link href="/admin/orders" className="shrink-0 text-xs font-semibold text-[#287e4a] hover:underline">View all</Link></div><div className="mt-5 divide-y divide-[#edf1eb]">{recentOrders.length ? recentOrders.map((order) => <div key={order.id} className="flex min-w-0 items-center gap-3 py-3 first:pt-0"><span className="rounded-lg bg-[#e7f4e8] p-2.5 text-[#23824a]"><CircleDollarSign size={16} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#294231]">{order.order_number}</p><p className="truncate text-xs text-[#839087]">{order.user?.name ?? 'Unknown customer'}</p></div><div className="shrink-0 text-right"><p className="text-sm font-semibold text-[#294231]">{money(Number(order.total))}</p><span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${statusTone(order.status)}`}>{order.status}</span></div></div>) : <p className="py-5 text-sm text-[#839087]">No orders recorded yet.</p>}</div></section>
                    <section className="min-w-0 border bg-[#fff9f1] p-4 sm:p-6"><p className="text-[11px] font-bold tracking-[0.18em] text-[#b06b38] uppercase">Catalog mix</p><h2 className="font-display mt-2 text-lg font-bold text-[#3d3024] sm:text-xl">Top categories</h2><div className="mt-5 space-y-3">{topCategories.length ? topCategories.map((category) => <div key={category.id} className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#a45e2d]">{category.products_count}</span><span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#594838]">{category.name}</span><span className="text-[11px] text-[#8c7763]">products</span></div>) : <p className="text-sm text-[#8c7763]">No categories recorded yet.</p>}</div><div className="mt-5 flex items-center gap-2 border-t border-[#eadfce] pt-4 text-xs text-[#8c7763]"><Users size={15} /> {metrics.customers} registered customers</div></section>
                </div>
                <p className="mt-4 text-right text-[10px] text-[#9ba79e]">Updated {new Date(generatedAt).toLocaleString()}</p>
            </PortalLayout>
        </>
    );
}
