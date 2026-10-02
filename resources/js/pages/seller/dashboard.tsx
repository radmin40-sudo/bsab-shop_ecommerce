import { PortalLayout } from '@/components/portal-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    CalendarDays,
    ChevronDown,
    CircleDollarSign,
    Eye,
    Leaf,
    Package,
    Plus,
    ShoppingBag,
    Star,
    TrendingUp,
    Users,
} from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type DashboardStat = { label: string; value: number | string; change: string; comparison: string };
type ChartPoint = { label: string; sales: number };
type CategoryPoint = { name: string; value: number; color: string };
type QuickStat = { label: string; value: string; change: string };
type DashboardOrder = {
    id: string;
    product: string;
    image: string | null;
    total: number;
    date: string;
    status: string;
    tone: 'green' | 'warm' | 'blue';
};
type DashboardProduct = { name: string; category: string; image: string | null; sold: number; revenue: number; trend: string };
type SellerDashboardProps = {
    stats?: DashboardStat[];
    salesChart?: ChartPoint[];
    categoryBreakdown?: CategoryPoint[];
    quickStats?: QuickStat[];
    recentOrders?: DashboardOrder[];
    topProducts?: DashboardProduct[];
    orderStatuses?: Array<{ status: string; value: number }>;
    orderCount?: number;
    earnings?: { amount: number; change: string; weekly: Array<{ label: string; value: number }> };
};

const currency = (value: number) => new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(value);

const defaultStats: DashboardStat[] = [
    { label: 'Total Sales', value: 24580, change: '+12.5%', comparison: 'vs. last 7 days' },
    { label: 'Total Orders', value: 48, change: '+18.2%', comparison: 'vs. last 7 days' },
    { label: 'Total Customers', value: 36, change: '+22.1%', comparison: 'vs. last 7 days' },
    { label: 'Average Rating', value: 4.8, change: '+0.3', comparison: 'seller rating' },
    { label: 'Shop Visits', value: 4820, change: '+15.3%', comparison: 'vs. last week' },
];

const defaultSalesChart: ChartPoint[] = [
    { label: 'Sep 23', sales: 1600 },
    { label: 'Sep 24', sales: 2800 },
    { label: 'Sep 25', sales: 2200 },
    { label: 'Sep 26', sales: 3500 },
    { label: 'Sep 27', sales: 3000 },
    { label: 'Sep 28', sales: 4200 },
    { label: 'Sep 29', sales: 5420 },
];

const defaultCategories: CategoryPoint[] = [
    { name: 'Vegetables', value: 32, color: '#124c37' },
    { name: 'Fruits', value: 24, color: '#298354' },
    { name: 'Seeds', value: 18, color: '#49a66b' },
    { name: 'Fertilizers', value: 14, color: '#77c789' },
    { name: 'Tools', value: 8, color: '#a7dca9' },
    { name: 'Others', value: 4, color: '#42c3b1' },
];

const defaultQuickStats: QuickStat[] = [
    { label: 'New Orders', value: '12', change: '+33%' },
    { label: 'New Customers', value: '8', change: '+60%' },
    { label: 'Total Views', value: '1,248', change: '+27%' },
    { label: 'Conversion Rate', value: '3.8%', change: '+1.2%' },
];

const defaultStatuses = [
    { status: 'Pending', value: 7 },
    { status: 'Processing', value: 12 },
    { status: 'Shipped', value: 18 },
    { status: 'Delivered', value: 11 },
];

const defaultEarnings = {
    amount: 24580,
    change: '+12.5%',
    weekly: [
        { label: 'Week 1', value: 3900 },
        { label: 'Week 2', value: 5200 },
        { label: 'Week 3', value: 6800 },
        { label: 'Week 4', value: 8680 },
    ],
};

export default function SellerDashboard({
    stats = defaultStats,
    salesChart = defaultSalesChart,
    categoryBreakdown = defaultCategories,
    quickStats = defaultQuickStats,
    recentOrders = [],
    topProducts = [],
    orderStatuses = defaultStatuses,
    orderCount = 48,
    earnings = defaultEarnings,
}: SellerDashboardProps) {
    const userName = usePage<{ auth: { user: { name: string } } }>().props.auth.user.name;
    const salesTotal = Number(stats.find((stat) => stat.label === 'Total Sales')?.value ?? 0);
    const statusTotal = orderStatuses.reduce((total, status) => total + status.value, 0);
    const maxWeeklyEarnings = Math.max(...earnings.weekly.map((week) => week.value), 1);

    return (
        <>
            <Head title="Seller dashboard" />
            <PortalLayout role="seller" title="Seller Workspace" eyebrow={userName} wideContent>
                <div className="min-w-0 space-y-4">
                    <section className="relative isolate overflow-hidden rounded-2xl border border-[#e4ebe6] bg-white px-5 py-5 shadow-[0_3px_12px_rgba(31,70,48,0.04)] sm:px-7 sm:py-5">
                        <img
                            src="/images/botanical-leaves.jpg"
                            alt=""
                            aria-hidden="true"
                            className="absolute inset-y-0 right-0 -z-10 h-full w-[42%] object-cover opacity-25"
                        />
                        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#fff_32%,rgba(255,255,255,0.94)_58%,rgba(255,255,255,0.18)_100%)]" />
                        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                            <div>
                                <div className="flex items-center gap-2 text-[#28734c]">
                                    <Leaf size={16} />
                                    <span className="text-xs font-semibold">Seller Workspace</span>
                                </div>
                                <h1 className="mt-1 text-2xl font-bold text-[#194c36] sm:text-[26px]">Good morning, {userName}!</h1>
                                <p className="mt-1 text-sm text-[#62766a]">Your store is growing! Here's what's happening with your shop today.</p>
                            </div>
                            <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                                <Link
                                    href="/seller/products"
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#188443] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#126d36]"
                                >
                                    <Plus size={16} /> Add product
                                </Link>
                                <Link
                                    href="/seller/orders"
                                    className="inline-flex items-center gap-2 rounded-lg border border-[#62a87c] bg-white/90 px-4 py-2.5 text-sm font-semibold text-[#246142] transition hover:bg-[#f3faf5]"
                                >
                                    <Package size={16} /> View orders
                                </Link>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        {stats.map((stat, index) => (
                            <MetricCard key={stat.label} stat={stat} index={index} />
                        ))}
                    </div>

                    <div className="grid min-w-0 items-start gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(260px,0.96fr)_minmax(270px,0.98fr)]">
                        <div className="min-w-0 space-y-3">
                            <section className="min-w-0 overflow-hidden rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_12px_rgba(31,70,48,0.04)]">
                                <PanelHeading
                                    title="Sales Overview"
                                    subtitle="Daily sales for the last 7 days"
                                    action={
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-lg border border-[#e3e9e5] bg-white px-2.5 py-2 text-[11px] font-medium text-[#53645a]"
                                        >
                                            <CalendarDays size={13} /> {salesChart[0]?.label ?? 'Sep 23'} – {salesChart.at(-1)?.label ?? 'Sep 29'},
                                            2026 <ChevronDown size={13} />
                                        </button>
                                    }
                                />
                                <div className="mt-3 flex items-center justify-between text-xs text-[#718076]">
                                    <span>Sales (₱)</span>
                                    <span className="rounded-md bg-[#eaf6ee] px-2 py-1 font-semibold text-[#176f3d]">
                                        Latest {currency(salesChart.at(-1)?.sales ?? 0)}
                                    </span>
                                </div>
                                <div className="mt-1 h-55 w-full min-w-0" aria-label="Daily sales chart">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={salesChart} margin={{ top: 10, right: 5, bottom: 0, left: 0 }}>
                                            <defs>
                                                <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#4caf73" stopOpacity={0.28} />
                                                    <stop offset="100%" stopColor="#4caf73" stopOpacity={0.02} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid stroke="#e9eeeb" strokeDasharray="3 4" vertical={false} />
                                            <XAxis
                                                dataKey="label"
                                                tick={{ fill: '#78877e', fontSize: 10 }}
                                                tickLine={false}
                                                axisLine={{ stroke: '#dfe7e1' }}
                                            />
                                            <YAxis
                                                width={46}
                                                tickFormatter={(value: number) => `₱ ${Number(value).toLocaleString()}`}
                                                tick={{ fill: '#78877e', fontSize: 10 }}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                formatter={(value) => [currency(Number(value)), 'Sales']}
                                                contentStyle={{ borderColor: '#dce7df', borderRadius: 8, fontSize: 12 }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="sales"
                                                stroke="#299359"
                                                strokeWidth={2}
                                                fill="url(#salesFill)"
                                                activeDot={{ r: 5, fill: '#168343', stroke: '#fff', strokeWidth: 2 }}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>

                            <section className="min-w-0 overflow-hidden rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_12px_rgba(31,70,48,0.04)]">
                                <PanelHeading
                                    title="Top Selling Products"
                                    action={
                                        <Link
                                            href="/seller/products"
                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#26814c]"
                                        >
                                            View All <ArrowUpRight size={13} />
                                        </Link>
                                    }
                                />
                                <div className="mt-3 overflow-x-auto">
                                    <table className="w-full min-w-130 text-left text-xs">
                                        <thead className="text-[10px] text-[#78877e]">
                                            <tr>
                                                <th className="px-1.5 py-2 font-medium">#</th>
                                                <th className="px-1.5 py-2 font-medium">Product</th>
                                                <th className="px-1.5 py-2 font-medium">Sold</th>
                                                <th className="px-1.5 py-2 font-medium">Revenue</th>
                                                <th className="px-1.5 py-2 font-medium">Trend</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topProducts.length ? (
                                                topProducts.map((product, index) => (
                                                    <tr key={product.name} className="border-t border-[#edf1ee]">
                                                        <td className="px-1.5 py-2.5 text-[#65756b]">{index + 1}</td>
                                                        <td className="px-1.5 py-2.5">
                                                            <div className="flex min-w-0 items-center gap-2">
                                                                <ProductThumb src={product.image} name={product.name} />
                                                                <span className="min-w-0">
                                                                    <span className="block max-w-40 truncate font-medium text-[#273b2e]">
                                                                        {product.name}
                                                                    </span>
                                                                    <span className="block text-[10px] text-[#849188]">{product.category}</span>
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-1.5 py-2.5 text-[#3e5145]">{product.sold}</td>
                                                        <td className="px-1.5 py-2.5 text-[#3e5145]">{currency(product.revenue)}</td>
                                                        <td className="px-1.5 py-2.5">
                                                            <div className="flex items-center gap-1 text-[10px] font-semibold text-[#239354]">
                                                                ↑ {product.trend}
                                                                <Sparkline index={index} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="px-2 py-8 text-center text-xs text-[#77857c]">
                                                        Product sales will appear here when orders are placed.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </div>

                        <div className="min-w-0 space-y-3">
                            <section className="rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_12px_rgba(31,70,48,0.04)]">
                                <PanelHeading title="Sales by Category" />
                                <div className="mt-2 flex items-center gap-1">
                                    <div className="relative h-37.5 w-36 shrink-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={categoryBreakdown}
                                                    dataKey="value"
                                                    nameKey="name"
                                                    innerRadius={44}
                                                    outerRadius={68}
                                                    paddingAngle={2}
                                                    stroke="white"
                                                    strokeWidth={2}
                                                >
                                                    {categoryBreakdown.map((entry) => (
                                                        <Cell key={entry.name} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) => [`${value}%`, 'Share']}
                                                    contentStyle={{ borderColor: '#dce7df', borderRadius: 8, fontSize: 12 }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                            <strong className="text-[17px] font-bold text-[#192f23]">{currency(salesTotal)}</strong>
                                            <span className="mt-0.5 text-[10px] text-[#819087]">Total Sales</span>
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-2">
                                        {categoryBreakdown.map((category) => (
                                            <div key={category.name} className="flex items-center justify-between gap-1 text-[10px] text-[#53645a]">
                                                <span className="flex min-w-0 items-center gap-1.5">
                                                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                                                    <span className="truncate">{category.name}</span>
                                                </span>
                                                <span className="shrink-0 font-medium text-[#44564b]">{category.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_12px_rgba(31,70,48,0.04)]">
                                <PanelHeading
                                    title="Order Status"
                                    action={
                                        <Link href="/seller/orders" className="text-[10px] font-semibold text-[#26814c]">
                                            View All
                                        </Link>
                                    }
                                />
                                <div className="flex items-center gap-2.5">
                                    <div className="relative h-37.5 w-[52%] min-w-32">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={orderStatuses}
                                                    dataKey="value"
                                                    nameKey="status"
                                                    innerRadius={42}
                                                    outerRadius={63}
                                                    paddingAngle={2}
                                                    stroke="white"
                                                    strokeWidth={2}
                                                >
                                                    {orderStatuses.map((item, index) => (
                                                        <Cell key={item.status} fill={statusColors[index % statusColors.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    formatter={(value) => [value, 'Orders']}
                                                    contentStyle={{ borderColor: '#dce7df', borderRadius: 8, fontSize: 12 }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                            <strong className="text-lg font-bold text-[#192f23]">{orderCount || statusTotal}</strong>
                                            <span className="text-[9px] text-[#819087]">Total Orders</span>
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1 space-y-3">
                                        {orderStatuses.map((item, index) => (
                                            <div key={item.status} className="flex items-center justify-between gap-2 text-[10px] text-[#627168]">
                                                <span className="flex min-w-0 items-center gap-2">
                                                    <span
                                                        className="h-2 w-2 shrink-0 rounded-full"
                                                        style={{ backgroundColor: statusColors[index % statusColors.length] }}
                                                    />
                                                    {item.status}
                                                </span>
                                                <strong className="text-[#43554a]">{item.value}</strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_12px_rgba(31,70,48,0.04)]">
                                <PanelHeading title="Earnings This Month" />
                                <div className="mt-1 flex items-baseline gap-2">
                                    <strong className="text-xl font-bold text-[#1d3426]">{currency(earnings.amount)}</strong>
                                    <span className="text-[10px] font-semibold text-[#219250]">↑ {earnings.change.replace('+', '')}</span>
                                </div>
                                <p className="text-[10px] text-[#849188]">vs. last month</p>
                                <div className="mt-3 h-25 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={earnings.weekly} margin={{ top: 4, right: 2, bottom: 0, left: -25 }}>
                                            <CartesianGrid stroke="#edf1ee" vertical={false} />
                                            <XAxis dataKey="label" tick={{ fill: '#839087', fontSize: 9 }} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                formatter={(value) => [currency(Number(value)), 'Earnings']}
                                                contentStyle={{ borderColor: '#dce7df', borderRadius: 8, fontSize: 11 }}
                                            />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                {earnings.weekly.map((week) => (
                                                    <Cell key={week.label} fill={week.value === maxWeeklyEarnings ? '#178447' : '#91cba1'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </section>
                        </div>

                        <div className="min-w-0 space-y-3">
                            <section className="rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_12px_rgba(31,70,48,0.04)]">
                                <PanelHeading
                                    title="Quick Stats"
                                    action={
                                        <button
                                            type="button"
                                            className="flex items-center gap-1 rounded-md border border-[#e6ece8] px-2 py-1 text-[9px] text-[#65746b]"
                                        >
                                            This Week <ChevronDown size={11} />
                                        </button>
                                    }
                                />
                                <div className="mt-2 divide-y divide-[#edf1ee]">
                                    {quickStats.map((item, index) => (
                                        <QuickStatRow key={item.label} item={item} index={index} />
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_12px_rgba(31,70,48,0.04)]">
                                <PanelHeading
                                    title="Recent Orders"
                                    action={
                                        <Link href="/seller/orders" className="text-[10px] font-semibold text-[#26814c]">
                                            View All
                                        </Link>
                                    }
                                />
                                <div className="mt-2 divide-y divide-[#edf1ee]">
                                    {recentOrders.length ? (
                                        recentOrders.map((order) => <RecentOrderRow key={order.id} order={order} />)
                                    ) : (
                                        <p className="py-8 text-center text-xs text-[#77857c]">Your recent orders will appear here.</p>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-[0_3px_12px_rgba(31,70,48,0.04)]">
                                <PanelHeading title="Quick Actions" />
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <Link
                                        href="/seller/products"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#188443] px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-[#126d36]"
                                    >
                                        <Plus size={14} /> Add Product
                                    </Link>
                                    <Link
                                        href="/seller/orders"
                                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#cddbd1] bg-white px-3 py-2.5 text-xs font-semibold text-[#315640] transition hover:bg-[#f5faf6]"
                                    >
                                        <ShoppingBag size={14} /> View Orders
                                    </Link>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </PortalLayout>
        </>
    );
}

const statusColors = ['#f4b500', '#48ad68', '#228ad1', '#28a96a'];

function PanelHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2 sm:min-h-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
                <h2 className="text-sm font-bold text-[#1d2b22]">{title}</h2>
                {subtitle && <p className="mt-0.5 text-[10px] text-[#78877e]">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

function MetricCard({ stat, index }: { stat: DashboardStat; index: number }) {
    const icons = [CircleDollarSign, Package, Users, Star, Eye];
    const Icon = icons[index % icons.length];
    const value =
        typeof stat.value === 'number'
            ? stat.label === 'Average Rating'
                ? stat.value.toFixed(1)
                : stat.label === 'Total Sales'
                  ? currency(stat.value)
                  : stat.value.toLocaleString()
            : stat.value;

    return (
        <section className="relative min-w-0 overflow-hidden rounded-xl border border-[#e5ebe7] bg-white p-3.5 shadow-[0_3px_12px_rgba(31,70,48,0.035)]">
            <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf5ed] text-[#28734c]">
                    <Icon size={19} strokeWidth={1.8} />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-medium text-[#708076]">{stat.label}</p>
                    <p className="mt-0.5 truncate text-xl leading-6 font-bold text-[#172b20]">{value}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-[#248d4f]">
                        <TrendingUp size={12} /> {stat.change}
                    </div>
                </div>
                <Sparkline index={index} className="mt-5 hidden sm:block" />
            </div>
            <p className="mt-1.5 pl-13 text-[9px] text-[#89958d]">{stat.comparison}</p>
        </section>
    );
}

function QuickStatRow({ item, index }: { item: QuickStat; index: number }) {
    const icons = [ShoppingBag, Users, Eye, Activity];
    const Icon = icons[index % icons.length];

    return (
        <div className="flex items-center gap-2.5 py-2.5 first:pt-1.5 last:pb-1.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eaf5ed] text-[#28734c]">
                <Icon size={15} />
            </span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] text-[#68786e]">{item.label}</p>
                <p className="text-xs font-bold text-[#273b2e]">{item.value}</p>
            </div>
            <span className="shrink-0 text-[9px] font-semibold text-[#249451]">↑ {item.change.replace('+', '')}</span>
            <Sparkline index={index + 2} className="shrink-0" />
        </div>
    );
}

function RecentOrderRow({ order }: { order: DashboardOrder }) {
    const statusStyle =
        order.tone === 'green'
            ? 'bg-[#e7f5eb] text-[#26814c]'
            : order.tone === 'warm'
              ? 'bg-[#fff4d9] text-[#a3730a]'
              : 'bg-[#e8f2fb] text-[#397bb5]';

    return (
        <div className="flex items-center gap-2.5 py-2.5 first:pt-1.5 last:pb-1.5">
            <ProductThumb src={order.image} name={order.product} className="h-10 w-10 rounded-md" />
            <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                    <p className="truncate text-[10px] font-semibold text-[#3b4d42]">{order.id}</p>
                    <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-semibold ${statusStyle}`}>{order.status}</span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-[9px] text-[#89958d]">
                    <span className="truncate">
                        {currency(order.total)} <span className="px-0.5">·</span> {order.date}
                    </span>
                </div>
            </div>
        </div>
    );
}

function ProductThumb({ src, name, className = 'h-9 w-9 rounded-md' }: { src: string | null; name: string; className?: string }) {
    return (
        <span
            className={`flex shrink-0 items-center justify-center overflow-hidden border border-[#e7ece8] bg-[#f1f6f2] text-[#5e8068] ${className}`}
        >
            {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : <Package size={16} />}
        </span>
    );
}

function Sparkline({ index, className = '' }: { index: number; className?: string }) {
    const lines = [
        '2,15 10,11 18,13 26,7 34,9 42,3',
        '2,15 10,13 18,14 26,8 34,6 42,2',
        '2,15 10,12 18,14 26,10 34,5 42,3',
        '2,14 10,12 18,8 26,11 34,4 42,2',
    ];

    return (
        <svg className={`h-5 w-11 ${className}`} viewBox="0 0 44 18" fill="none" aria-hidden="true">
            <polyline points={lines[index % lines.length]} stroke="#4aaa70" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
