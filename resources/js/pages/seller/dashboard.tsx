import { PortalLayout } from '@/components/portal-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Bell, CheckCircle2, Clock3, DollarSign, Package, Plus, ShoppingBag, Store, TrendingUp } from 'lucide-react';

const sales = [35, 44, 40, 55, 62, 49, 76, 68, 86, 72, 92, 88];
const recentOrders = [
    { id: '#ORD-1048', customer: 'Mia Santos', item: 'Woven market tote', total: '₱1,280', status: 'Ready to ship', tone: 'green' },
    { id: '#ORD-1047', customer: 'Paolo Cruz', item: 'Linen overshirt', total: '₱2,450', status: 'Processing', tone: 'warm' },
    { id: '#ORD-1046', customer: 'Lara Reyes', item: 'Ceramic pour-over set', total: '₱1,890', status: 'Shipped', tone: 'plain' },
];

export default function SellerDashboard() {
    return (
        <>
            <Head title="Seller overview" />
            <PortalLayout role="seller" title="Your shop at a glance" eyebrow="Morrow Studio">
                <div className="relative overflow-hidden rounded-[24px] border border-[#1f7a42] bg-[#163b24] px-6 py-7 text-white shadow-[0_12px_30px_rgba(22,59,36,0.16)] sm:px-8 sm:py-8">
                    <div className="absolute -top-20 -right-12 h-56 w-56 rounded-full border-[24px] border-[#52b788]/20" />
                    <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
                        <div>
                            <div className="flex items-center gap-2 text-[#9ee0a3]">
                                <Store size={16} />
                                <span className="text-xs font-bold tracking-[0.18em] uppercase">Seller workspace</span>
                            </div>
                            <h1 className="font-display mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Good morning, Morrow Studio.</h1>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-[#cce8d1]">
                                Your storefront is moving well. Here is what needs attention today.
                            </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-3">
                            <Link
                                href="/seller/products"
                                className="flex items-center gap-2 rounded-xl bg-[#9ee0a3] px-4 py-3 text-sm font-bold text-[#163b24] transition hover:bg-white"
                            >
                                <Plus size={17} /> Add product
                            </Link>
                            <Link
                                href="/seller/orders"
                                className="flex items-center gap-2 rounded-xl border border-white/25 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                            >
                                <Package size={17} /> View orders
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric label="Sales this month" value="₱8,420" detail="12.6% from last month" icon={DollarSign} tone="green" trend="up" />
                    <Metric label="Orders" value="126" detail="9 need fulfillment" icon={ShoppingBag} tone="plain" />
                    <Metric label="Products live" value="48" detail="3 low-stock items" icon={Package} tone="warm" />
                    <Metric label="Shop visits" value="4,820" detail="18% this week" icon={TrendingUp} tone="blue" trend="up" />
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_.75fr]">
                    <section className="border bg-white p-6 sm:p-7">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                            <div>
                                <p className="text-xs font-bold tracking-[0.18em] text-[#2c9350] uppercase">Sales overview</p>
                                <h2 className="font-display mt-2 text-2xl font-bold text-[#163b24]">A steady month</h2>
                                <p className="mt-1 text-sm text-[#647568]">Revenue is up across your best-selling categories.</p>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-semibold text-[#2c7a3b]">
                                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e6f7eb]">
                                    <TrendingUp size={14} />
                                </span>{' '}
                                +12.6%
                            </div>
                        </div>
                        <div className="mt-8 flex h-52 items-end gap-2 border-b border-[#edf2ed] px-1">
                            {sales.map((height, index) => (
                                <div key={index} className="group relative flex h-full flex-1 items-end">
                                    <div
                                        className={`w-full rounded-t-md transition group-hover:bg-[#2c9350] ${index === sales.length - 1 ? 'bg-[#2c9350]' : 'bg-[#b9dcbc]'}`}
                                        style={{ height: `${height}%` }}
                                    >
                                        <span className="sr-only">
                                            Week {index + 1}: {height}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-between text-[10px] font-bold tracking-wider text-[#9aaa9e] uppercase">
                            <span>Jan 01</span>
                            <span>Jan 15</span>
                            <span>Jan 31</span>
                        </div>
                    </section>
                    <section className="border bg-[#f1e5d8] p-6 sm:p-7">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-bold tracking-[0.18em] text-[#9a6b45] uppercase">Today</p>
                                <h2 className="font-display mt-2 text-2xl font-bold text-[#2b251f]">Fulfillment queue</h2>
                            </div>
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#9a6b45]">
                                <Clock3 size={19} />
                            </span>
                        </div>
                        <div className="mt-7 space-y-5">
                            <QueueRow label="Orders to pack" value="9" detail="Due today" />
                            <QueueRow label="Low-stock products" value="3" detail="Restock soon" />
                            <QueueRow label="Unread messages" value="4" detail="From customers" />
                        </div>
                        <Link
                            href="/seller/orders"
                            className="mt-7 flex items-center justify-center gap-2 rounded-xl bg-[#2b251f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#163b24]"
                        >
                            Open fulfillment <ArrowUpRight size={15} />
                        </Link>
                    </section>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_.75fr]">
                    <section className="overflow-hidden border bg-white">
                        <div className="flex items-center justify-between border-b border-[#edf2ed] px-6 py-5">
                            <div>
                                <p className="text-xs font-bold tracking-[0.18em] text-[#2c9350] uppercase">Latest activity</p>
                                <h2 className="font-display mt-2 text-2xl font-bold text-[#163b24]">Recent orders</h2>
                            </div>
                            <Link href="/seller/orders" className="flex items-center gap-1 text-xs font-bold text-[#2c7a3b]">
                                See all <ArrowUpRight size={14} />
                            </Link>
                        </div>
                        <div className="divide-y divide-[#edf2ed]">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e9f6ea] text-[#2c7a3b]">
                                            <Package size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-[#163b24]">{order.item}</p>
                                            <p className="mt-1 text-xs text-[#8b8a96]">
                                                {order.id} · {order.customer}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-5 sm:justify-end">
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${order.tone === 'green' ? 'bg-[#e6f7eb] text-[#2c7a3b]' : order.tone === 'warm' ? 'bg-[#fff3d6] text-[#946a0c]' : 'bg-[#edf1f0] text-[#647568]'}`}
                                        >
                                            {order.status}
                                        </span>
                                        <strong className="text-sm text-[#163b24]">{order.total}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    <section className="border bg-[#e6f7eb] p-6 sm:p-7">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#2c7a3b]">
                                <Bell size={18} />
                            </div>
                            <div>
                                <p className="text-xs font-bold tracking-[0.18em] text-[#2c9350] uppercase">Store pulse</p>
                                <h2 className="font-display mt-1 text-xl font-bold text-[#163b24]">Keep the momentum</h2>
                            </div>
                        </div>
                        <p className="mt-6 text-sm leading-6 text-[#587447]">
                            Your payout of <strong className="text-[#163b24]">₱6,840</strong> is scheduled for Friday.
                        </p>
                        <div className="mt-6 flex items-center gap-3 border-t border-[#cdebcf] pt-5 text-xs font-semibold text-[#2c7a3b]">
                            <CheckCircle2 size={16} /> Store health is looking good
                        </div>
                    </section>
                </div>
            </PortalLayout>
        </>
    );
}

function Metric({
    label,
    value,
    detail,
    icon: Icon,
    tone,
    trend,
}: {
    label: string;
    value: string;
    detail: string;
    icon: typeof DollarSign;
    tone: 'green' | 'plain' | 'warm' | 'blue';
    trend?: 'up';
}) {
    const styles = {
        green: 'bg-[#e6f7eb] text-[#2c7a3b]',
        plain: 'bg-white text-[#647568]',
        warm: 'bg-[#fff3d6] text-[#946a0c]',
        blue: 'bg-[#e6f1f4] text-[#397080]',
    };
    return (
        <section className="border bg-white p-5">
            <div className="flex items-start justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[tone]}`}>
                    <Icon size={18} />
                </span>
                {trend && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#2c7a3b]">
                        <ArrowUpRight size={13} /> Growing
                    </span>
                )}
            </div>
            <p className="mt-5 text-xs font-bold tracking-[0.12em] text-[#8b8a96] uppercase">{label}</p>
            <p className="font-display mt-2 text-3xl font-bold text-[#163b24]">{value}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-[#647568]">
                <ArrowDownRight size={12} className={trend ? 'rotate-180 text-[#2c9350]' : 'text-[#8b8a96]'} /> {detail}
            </p>
        </section>
    );
}

function QueueRow({ label, value, detail }: { label: string; value: string; detail: string }) {
    return (
        <div className="flex items-center justify-between border-b border-[#dfcdbb] pb-4">
            <div>
                <p className="text-sm font-bold text-[#2b251f]">{label}</p>
                <p className="mt-1 text-xs text-[#806d5a]">{detail}</p>
            </div>
            <strong className="font-display text-3xl font-bold text-[#9a6b45]">{value}</strong>
        </div>
    );
}
