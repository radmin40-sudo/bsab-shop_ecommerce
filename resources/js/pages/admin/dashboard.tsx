import { PortalLayout, StatCard } from '@/components/portal-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowDownRight, ArrowUpRight, Box, CircleDollarSign, Clock3, Package, Plus, Store, Users } from 'lucide-react';

const chart = [34, 48, 42, 58, 51, 73, 63, 81, 68, 88, 76, 96];

const activity = [
    {
        title: 'New seller application',
        detail: 'Northstar Goods submitted a shop',
        time: '12 min ago',
        icon: Store,
        color: 'bg-[#e7f4e8] text-[#23824a]',
    },
    {
        title: 'Order #10482 paid',
        detail: 'Payment confirmed by Maya Santos',
        time: '28 min ago',
        icon: CircleDollarSign,
        color: 'bg-[#fff1da] text-[#a86618]',
    },
    { title: 'Product reported', detail: 'Review needed for listing #882', time: '1 hr ago', icon: Box, color: 'bg-[#fbe8e5] text-[#bd5144]' },
];

const quickLinks = [
    ['Manage sellers', '/admin/sellers', Store],
    ['Review products', '/admin/products', Box],
    ['Check orders', '/admin/orders', Package],
    ['Manage users', '/admin/users', Users],
] as const;

export default function AdminDashboard() {
    return (
        <>
            <Head title="Admin overview" />
            <PortalLayout role="admin" title="Platform overview" eyebrow="Good morning, admin">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#b06b38] uppercase">Monday, August 24, 2026</p>
                        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-[#173b27] sm:text-4xl">Good morning, admin.</h1>
                        <p className="mt-2 text-sm text-[#6a7c70]">Here is what is happening across your marketplace today.</p>
                    </div>
                    <Link
                        href="/admin/products"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] bg-[#173b27] px-4 text-sm font-semibold text-white transition hover:bg-[#245b3b]"
                    >
                        <Plus size={16} /> Add product
                    </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Gross sales" value="₱24,860" detail="+18.4% this month" tone="green" />
                    <StatCard label="Orders" value="384" detail="42 awaiting fulfillment" />
                    <StatCard label="Active sellers" value="28" detail="4 new this month" tone="warm" />
                    <StatCard label="Customers" value="2,418" detail="+9.2% this month" />
                </div>
                <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.75fr)]">
                    <section className="border bg-white p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-[11px] font-bold tracking-[0.18em] text-[#b06b38] uppercase">Revenue overview</p>
                                <h2 className="font-display mt-2 text-xl font-bold text-[#173b27]">Sales performance</h2>
                            </div>
                            <div className="flex items-center gap-1 rounded-lg border border-[#e1ebe0] bg-[#f8fbf7] p-1 text-xs font-semibold">
                                <button className="rounded-md bg-white px-3 py-1.5 text-[#173b27] shadow-sm">30 days</button>
                                <button className="px-3 py-1.5 text-[#829187]">12 months</button>
                            </div>
                        </div>
                        <div className="mt-7 flex h-52 items-end gap-2 border-b border-l border-[#e5ece4] px-2 sm:gap-3">
                            {chart.map((height, index) => (
                                <div key={index} className="group relative flex h-full flex-1 items-end">
                                    <span
                                        className="absolute bottom-0 w-full rounded-t-[5px] bg-[#9acb9d] transition-all group-hover:bg-[#287e4a]"
                                        style={{ height: `${height}%` }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 flex justify-between pl-2 text-[11px] font-medium text-[#8b998e]">
                            <span>Jul 26</span>
                            <span>Aug 02</span>
                            <span>Aug 09</span>
                            <span>Aug 16</span>
                            <span>Aug 24</span>
                        </div>
                        <div className="mt-6 flex items-center gap-2 text-sm text-[#5f7064]">
                            <span className="h-2 w-2 rounded-full bg-[#287e4a]" /> Net sales <strong className="text-[#173b27]">₱24,860</strong>
                            <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-[#287e4a]">
                                <ArrowUpRight size={13} /> 18.4%
                            </span>
                        </div>
                    </section>
                    <section className="border bg-[#173b27] p-5 text-white sm:p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[11px] font-bold tracking-[0.18em] text-[#a9d2a8] uppercase">Needs attention</p>
                                <h2 className="font-display mt-2 text-xl font-bold">Your next moves</h2>
                            </div>
                            <Clock3 className="text-[#e4b878]" size={21} />
                        </div>
                        <div className="mt-7 space-y-5">
                            <Link href="/admin/products" className="group flex items-start gap-3">
                                <span className="mt-0.5 rounded-lg bg-[#345b3d] p-2 text-[#f0c27f]">
                                    <Package size={16} />
                                </span>
                                <span className="text-sm">
                                    <strong className="block font-semibold">12 products to review</strong>
                                    <span className="mt-1 block text-xs text-[#b4c8b5]">Moderation queue is growing</span>
                                </span>
                                <ArrowUpRight className="ml-auto text-[#7aa67d] transition group-hover:text-white" size={15} />
                            </Link>
                            <Link href="/admin/sellers" className="group flex items-start gap-3">
                                <span className="mt-0.5 rounded-lg bg-[#345b3d] p-2 text-[#f0c27f]">
                                    <Store size={16} />
                                </span>
                                <span className="text-sm">
                                    <strong className="block font-semibold">3 sellers to verify</strong>
                                    <span className="mt-1 block text-xs text-[#b4c8b5]">Applications need a decision</span>
                                </span>
                                <ArrowUpRight className="ml-auto text-[#7aa67d] transition group-hover:text-white" size={15} />
                            </Link>
                            <Link href="/admin/users" className="group flex items-start gap-3">
                                <span className="mt-0.5 rounded-lg bg-[#345b3d] p-2 text-[#f0c27f]">
                                    <Users size={16} />
                                </span>
                                <span className="text-sm">
                                    <strong className="block font-semibold">8 support threads</strong>
                                    <span className="mt-1 block text-xs text-[#b4c8b5]">Customers are waiting for help</span>
                                </span>
                                <ArrowUpRight className="ml-auto text-[#7aa67d] transition group-hover:text-white" size={15} />
                            </Link>
                        </div>
                        <Link
                            href="/admin/orders"
                            className="mt-8 flex items-center justify-center rounded-lg border border-[#527657] py-2.5 text-xs font-semibold text-[#d6e6d3] transition hover:bg-[#285a38]"
                        >
                            View all operations <ArrowUpRight size={14} className="ml-2" />
                        </Link>
                    </section>
                </div>
                <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
                    <section className="border bg-white p-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold tracking-[0.18em] text-[#b06b38] uppercase">Recent activity</p>
                                <h2 className="font-display mt-2 text-xl font-bold text-[#173b27]">The latest from your platform</h2>
                            </div>
                            <Link href="/admin/orders" className="text-xs font-semibold text-[#287e4a] hover:underline">
                                View all
                            </Link>
                        </div>
                        <div className="mt-5 divide-y divide-[#edf1eb]">
                            {activity.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.title} className="flex items-center gap-3 py-3 first:pt-0">
                                        <span className={`rounded-lg p-2.5 ${item.color}`}>
                                            <Icon size={16} />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-semibold text-[#294231]">{item.title}</p>
                                            <p className="truncate text-xs text-[#839087]">{item.detail}</p>
                                        </div>
                                        <span className="shrink-0 text-[11px] text-[#9ba79e]">{item.time}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                    <section className="border bg-[#fff9f1] p-5 sm:p-6">
                        <p className="text-[11px] font-bold tracking-[0.18em] text-[#b06b38] uppercase">Quick access</p>
                        <h2 className="font-display mt-2 text-xl font-bold text-[#3d3024]">Keep things moving</h2>
                        <div className="mt-5 grid grid-cols-2 gap-2">
                            {quickLinks.map(([label, href, Icon]) => (
                                <Link
                                    key={label}
                                    href={href}
                                    className="flex items-center gap-2 rounded-lg border border-[#eadfce] bg-white px-3 py-3 text-xs font-semibold text-[#594838] transition hover:border-[#b06b38] hover:text-[#a45e2d]"
                                >
                                    <Icon size={15} /> {label}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-6 flex items-center gap-2 border-t border-[#eadfce] pt-4 text-xs text-[#8c7763]">
                            <ArrowDownRight size={15} /> Everything looks steady today.
                        </div>
                    </section>
                </div>
            </PortalLayout>
        </>
    );
}
