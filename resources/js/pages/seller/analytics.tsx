import { PortalLayout } from '@/components/portal-layout';
import { Head } from '@inertiajs/react';
import { ArrowUpRight, BadgeDollarSign, BarChart3, ShoppingBag, TrendingUp, Users } from 'lucide-react';

type SellerAnalyticsProps = {
    stats?: Array<{ label: string; value: number | string; change: string; tone: 'green' | 'mint' | 'dark' | 'light' }>;
    salesTrend?: Array<number>;
    categoryData?: Array<{ label: string; value: number; color: string }>;
    topProducts?: Array<{ name: string; sales: number; growth: string }>;
    conversion?: { rate: string; avgOrderValue: string; retained: string };
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(value);

const defaultSalesTrend = [22, 34, 28, 46, 58, 52, 71, 64, 84, 92, 78, 104];
const defaultCategoryData = [
    { label: 'Vegetables', value: 32, color: 'bg-[#2f9d5b]' },
    { label: 'Fruits', value: 24, color: 'bg-[#86c89a]' },
    { label: 'Seeds', value: 18, color: 'bg-[#1d7a4f]' },
    { label: 'Fertilizers', value: 14, color: 'bg-[#d9f1df]' },
    { label: 'Tools', value: 12, color: 'bg-[#6ab38b]' },
];
const defaultTopProducts = [
    { name: 'Hybrid Corn Seeds', sales: '₱42,800', growth: '+18%' },
    { name: 'Organic Tomato Seeds', sales: '₱36,200', growth: '+14%' },
    { name: 'Garden Hand Tools', sales: '₱29,400', growth: '+11%' },
    { name: 'Organic Fertilizer', sales: '₱24,600', growth: '+9%' },
];

export default function SellerAnalytics({
    stats = defaultStats,
    salesTrend = defaultSalesTrend,
    categoryData = defaultCategoryData,
    topProducts = defaultTopProducts,
    conversion = defaultConversion,
}: SellerAnalyticsProps) {
    return (
        <>
            <Head title="Seller analytics" />
            <PortalLayout role="seller" title="Analytics" eyebrow="Store performance">
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => (
                            <StatCard
                                key={stat.label}
                                icon={
                                    stat.label === 'Revenue Overview'
                                        ? BadgeDollarSign
                                        : stat.label === 'Orders Trend'
                                          ? ShoppingBag
                                          : stat.label === 'Customer Growth'
                                            ? Users
                                            : BarChart3
                                }
                                label={stat.label}
                                value={
                                    typeof stat.value === 'number'
                                        ? stat.label === 'Revenue Overview'
                                            ? formatCurrency(stat.value)
                                            : stat.value.toLocaleString()
                                        : stat.value
                                }
                                change={stat.change}
                                tone={stat.tone}
                            />
                        ))}
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                        <section className="rounded-3xl border border-[#def0e2] bg-white p-5 shadow-[0_6px_20px_rgba(22,59,36,0.04)]">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#2f9d5b] uppercase">Revenue overview</p>
                                    <h2 className="mt-2 text-2xl font-bold text-[#163b24]">Sales trend</h2>
                                </div>
                                <button className="rounded-lg border border-[#d7e8dc] bg-[#effaf2] px-3 py-2 text-xs font-semibold text-[#1f7a42]">
                                    30 days
                                </button>
                            </div>
                            <div className="flex h-52 items-end gap-2 border-b border-[#edf3ee] pb-6">
                                {salesTrend.map((value, index) => (
                                    <div key={index} className="flex flex-1 flex-col items-center justify-end gap-2">
                                        <div
                                            className="w-full rounded-t-xl bg-linear-to-t from-[#1d7a4f] to-[#7ac998]"
                                            style={{ height: `${value}%` }}
                                        />
                                        <span className="text-[10px] font-semibold text-[#7c8b7f]">{index + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-3xl border border-[#def0e2] bg-white p-5 shadow-[0_6px_20px_rgba(22,59,36,0.04)]">
                            <div className="mb-5">
                                <p className="text-[10px] font-bold tracking-[0.16em] text-[#2f9d5b] uppercase">Sales mix</p>
                                <h2 className="mt-2 text-2xl font-bold text-[#163b24]">By category</h2>
                            </div>
                            <div className="space-y-4">
                                {categoryData.map((item) => (
                                    <div key={item.label}>
                                        <div className="mb-1 flex items-center justify-between text-sm text-[#203a2b]">
                                            <span>{item.label}</span>
                                            <span className="font-semibold">{item.value}%</span>
                                        </div>
                                        <div className="h-2.5 rounded-full bg-[#edf4ef]">
                                            <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.value}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                        <section className="rounded-3xl border border-[#def0e2] bg-white p-5 shadow-[0_6px_20px_rgba(22,59,36,0.04)]">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold tracking-[0.16em] text-[#2f9d5b] uppercase">Product performance</p>
                                    <h2 className="mt-2 text-2xl font-bold text-[#163b24]">Top products</h2>
                                </div>
                                <span className="flex items-center gap-1 text-xs font-semibold text-[#1f7a42]">
                                    <ArrowUpRight size={13} /> Strong
                                </span>
                            </div>
                            <div className="overflow-hidden rounded-xl border border-[#e8efe8]">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-[#f3faf4] text-[#51675d]">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Product</th>
                                            <th className="px-4 py-3 font-semibold">Sales</th>
                                            <th className="px-4 py-3 font-semibold">Growth</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topProducts.map((product) => (
                                            <tr key={product.name} className="border-t border-[#edf3ee]">
                                                <td className="px-4 py-3 font-medium text-[#163b24]">{product.name}</td>
                                                <td className="px-4 py-3 text-[#203a2b]">
                                                    {typeof product.sales === 'number' ? formatCurrency(product.sales) : product.sales}
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-[#1f7a42]">{product.growth}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        <section className="rounded-3xl border border-[#def0e2] bg-[#edfbf1] p-5 shadow-[0_6px_20px_rgba(22,59,36,0.04)]">
                            <div className="mb-4">
                                <p className="text-[10px] font-bold tracking-[0.16em] text-[#2f9d5b] uppercase">Conversion</p>
                                <h2 className="mt-2 text-2xl font-bold text-[#163b24]">Store health</h2>
                            </div>
                            <div className="space-y-4">
                                <MetricRow label="Conversion rate" value={conversion.rate} />
                                <MetricRow label="Avg. order value" value={conversion.avgOrderValue} />
                                <MetricRow label="Retained customers" value={conversion.retained} />
                            </div>
                        </section>
                    </div>
                </div>
            </PortalLayout>
        </>
    );
}

const defaultStats = [
    { label: 'Revenue Overview', value: 245800, change: '+12.5%', tone: 'green' },
    { label: 'Orders Trend', value: 2184, change: '+8.4%', tone: 'mint' },
    { label: 'Customer Growth', value: 1240, change: '+14.2%', tone: 'dark' },
    { label: 'Shop Visits', value: '42.8K', change: '+17.1%', tone: 'light' },
] as const;

const defaultConversion = {
    rate: '3.8%',
    avgOrderValue: '₱2,460.00',
    retained: '68%',
};

function StatCard({
    icon: Icon,
    label,
    value,
    change,
    tone,
}: {
    icon: typeof BadgeDollarSign;
    label: string;
    value: string;
    change: string;
    tone: 'green' | 'mint' | 'dark' | 'light';
}) {
    const palette = {
        green: 'bg-[#ecf9f0] text-[#1f7a42]',
        mint: 'bg-[#eafaf3] text-[#1f7a42]',
        dark: 'bg-[#143f2d] text-white',
        light: 'bg-[#f2f8f4] text-[#203a2b]',
    };

    return (
        <div className="rounded-[22px] border border-[#def0e2] bg-white p-4 shadow-[0_6px_20px_rgba(22,59,36,0.04)]">
            <div className="flex items-start justify-between gap-3">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${palette[tone]}`}>
                    <Icon size={18} />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#ecf9f0] px-2 py-1 text-[10px] font-bold text-[#1f7a42]">
                    <TrendingUp size={12} /> {change}
                </span>
            </div>
            <p className="mt-4 text-[10px] font-bold tracking-[0.14em] text-[#7a8c82] uppercase">{label}</p>
            <h3 className="mt-2 text-3xl font-bold text-[#163b24]">{value}</h3>
        </div>
    );
}

function MetricRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-[#dfece1] bg-white p-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#51675d]">{label}</span>
                <strong className="text-lg font-bold text-[#163b24]">{value}</strong>
            </div>
        </div>
    );
}
