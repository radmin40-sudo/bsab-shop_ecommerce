import { Head, Link, useForm } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Eye,
    Mail,
    MoreHorizontal,
    Search,
    ShieldCheck,
    ShoppingBag,
    UserRound,
    UsersRound,
    X,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';

import { PortalLayout } from '@/components/portal-layout';

type CustomerOrder = {
    id: number;
    order_number: string | null;
    total: number | string;
    status: string;
    created_at: string;
};
type Customer = {
    id: number;
    name: string;
    email: string;
    status: string | null;
    created_at: string;
    orders_count: number;
    orders: CustomerOrder[];
};
type CustomerStats = {
    total: number;
    active: number;
    with_orders: number;
    new_this_month: number;
    orders: number;
};
type ActivityPoint = { date: string; label: string; registrations: number; orders: number };
type Props = { customers: Customer[]; customerStats: CustomerStats; activity: ActivityPoint[] };
type SortBy = 'newest' | 'oldest' | 'most_orders' | 'least_orders';
type CustomerFormData = { name: string; email: string; status: string };

const PAGE_SIZE = 10;

function formatDate(value: string) {
    return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
}

function formatMoney(value: number | string) {
    return `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StatCard({ label, value, detail, Icon }: { label: string; value: number; detail: string; Icon: typeof UsersRound }) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e4ebe6] bg-white p-3.5 shadow-[0_3px_13px_rgba(31,70,48,0.045)]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-[#258553]">
                <Icon size={18} />
            </span>
            <div className="min-w-0">
                <p className="truncate text-[10px] font-medium text-[#607166]">{label}</p>
                <strong className="mt-0.5 block text-xl leading-none text-[#1c4b3d]">{value}</strong>
                <p className="mt-1 truncate text-[9px] text-[#829087]">{detail}</p>
            </div>
        </div>
    );
}

function Panel({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
    return (
        <section className={`min-w-0 rounded-xl border border-[#e4ebe6] bg-white p-3.5 shadow-[0_3px_13px_rgba(31,70,48,0.045)] sm:p-4 ${className}`}>
            <div>
                <h2 className="text-sm font-bold text-[#25372c]">{title}</h2>
                {subtitle && <p className="mt-0.5 text-[9px] text-[#7d8b82]">{subtitle}</p>}
            </div>
            {children}
        </section>
    );
}

function ActivityChart({ points }: { points: ActivityPoint[] }) {
    const hasActivity = points.some((point) => point.registrations > 0 || point.orders > 0);
    const max = Math.max(1, ...points.flatMap((point) => [point.registrations, point.orders]));
    const coords = points.map((point, index) => ({
        ...point,
        x: points.length < 2 ? 300 : (index / (points.length - 1)) * 600,
        registrationY: 142 - (point.registrations / max) * 112,
        ordersY: 142 - (point.orders / max) * 112,
    }));
    const registrationLine = coords.map((point) => `${point.x},${point.registrationY}`).join(' ');
    const orderLine = coords.map((point) => `${point.x},${point.ordersY}`).join(' ');
    const registrationArea = coords.length ? `0,150 ${registrationLine} 600,150` : '';
    const labelStep = Math.max(1, Math.ceil(points.length / 6));

    return (
        <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-[#718075]">
                <span className="inline-flex items-center gap-1.5">
                    <i className="h-2 w-2 rounded-full bg-[#25945b]" /> Registrations
                </span>
                <span className="inline-flex items-center gap-1.5">
                    <i className="h-2 w-2 rounded-full bg-[#80b9a0]" /> Orders
                </span>
            </div>
            {hasActivity ? (
                <>
                    <svg
                        viewBox="0 0 600 160"
                        className="h-36 w-full overflow-visible"
                        role="img"
                        aria-label="Customer registrations and orders over time"
                        preserveAspectRatio="none"
                    >
                        {[30, 67, 104, 141].map((y) => (
                            <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#edf2ee" strokeDasharray="3 5" />
                        ))}
                        <polygon points={registrationArea} fill="#34a874" fillOpacity=".1" />
                        <polyline
                            points={registrationLine}
                            fill="none"
                            stroke="#25945b"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        />
                        <polyline
                            points={orderLine}
                            fill="none"
                            stroke="#80b9a0"
                            strokeWidth="2"
                            strokeDasharray="5 4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            vectorEffect="non-scaling-stroke"
                        />
                        {coords.map((point) => (
                            <circle
                                key={point.date}
                                cx={point.x}
                                cy={point.registrationY}
                                r="2.5"
                                fill="#fff"
                                stroke="#25945b"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                            >
                                <title>{`${point.label}: ${point.registrations} registrations, ${point.orders} orders`}</title>
                            </circle>
                        ))}
                    </svg>
                    <div className="mt-1 flex justify-between gap-1 overflow-hidden text-[8px] text-[#7e8e83]">
                        {points
                            .filter((_, index) => index % labelStep === 0 || index === points.length - 1)
                            .map((point) => (
                                <span key={point.date}>{point.label}</span>
                            ))}
                    </div>
                </>
            ) : (
                <div className="flex h-36 items-center justify-center rounded-lg bg-[#f8fbf8] text-center text-xs text-[#849188]">
                    No customer registrations or orders in this period.
                </div>
            )}
        </div>
    );
}

function Modal({
    title,
    subtitle,
    onClose,
    children,
    alert = false,
}: {
    title: string;
    subtitle?: string;
    onClose: () => void;
    children: React.ReactNode;
    alert?: boolean;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#12251a]/40 p-3 backdrop-blur-[2px]"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                role={alert ? 'alertdialog' : 'dialog'}
                aria-modal="true"
                aria-label={title}
                className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#e2ebe4] bg-white p-5 shadow-[0_20px_70px_rgba(17,47,30,0.2)] sm:p-6"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-bold text-[#1c4b3d]">{title}</h2>
                        {subtitle && <p className="mt-1 text-xs text-[#7d8b82]">{subtitle}</p>}
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-1.5 text-[#718075] hover:bg-[#f1f6f2]">
                        <X size={18} />
                    </button>
                </div>
                {children}
            </section>
        </div>
    );
}

export default function AdminCustomers({ customers, customerStats, activity }: Props) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [sort, setSort] = useState<SortBy>('newest');
    const [page, setPage] = useState(1);
    const [range, setRange] = useState<7 | 30 | 90>(30);
    const [selected, setSelected] = useState<Customer | null>(null);
    const [editing, setEditing] = useState<Customer | null>(null);
    const [suspending, setSuspending] = useState<Customer | null>(null);
    const [menuId, setMenuId] = useState<number | null>(null);
    const form = useForm<CustomerFormData>({ name: '', email: '', status: 'active' });

    const filteredCustomers = useMemo(() => {
        const query = search.trim().toLowerCase();
        return customers
            .filter((customer) => {
                const matchesSearch = !query || customer.name.toLowerCase().includes(query) || customer.email.toLowerCase().includes(query);
                return matchesSearch && (status === 'all' || (customer.status ?? 'active') === status);
            })
            .sort((a, b) => {
                if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                if (sort === 'most_orders')
                    return b.orders_count - a.orders_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                if (sort === 'least_orders')
                    return a.orders_count - b.orders_count || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
    }, [customers, search, sort, status]);
    const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / PAGE_SIZE));
    const pageCustomers = filteredCustomers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const visibleActivity = activity.slice(-range);

    function openEdit(customer: Customer) {
        setSelected(null);
        setEditing(customer);
        form.setData({ name: customer.name, email: customer.email, status: customer.status ?? 'active' });
        form.clearErrors();
    }

    function saveCustomer(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!editing) return;
        form.patch(route('admin.customers.update', editing.id), {
            preserveScroll: true,
            onSuccess: () => {
                setEditing(null);
                form.reset();
            },
        });
    }

    function suspendCustomer() {
        if (!suspending) return;
        form.setData({ name: suspending.name, email: suspending.email, status: 'suspended' });
        form.patch(route('admin.customers.update', suspending.id), {
            preserveScroll: true,
            onSuccess: () => {
                setSuspending(null);
                setSelected(null);
                form.reset();
            },
        });
    }

    return (
        <>
            <Head title="Customer Directory" />
            <PortalLayout role="admin" title="Customer Directory" eyebrow="People and activity">
                <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="font-mono text-[10px] font-bold tracking-[0.17em] text-[#328152] uppercase">Customer directory</p>
                        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[#173b27] sm:text-3xl">Know your customers.</h1>
                        <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-[#6a7c70]">
                            Monitor customer activity, account health, and shopping engagement across the marketplace.
                        </p>
                    </div>
                    <Link
                        href="/admin/users"
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#cbd8cc] bg-white px-3.5 text-xs font-semibold text-[#294231] transition hover:border-[#287e4a] hover:text-[#287e4a]"
                    >
                        Manage all users <ArrowUpRight size={14} />
                    </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total customers" value={customerStats.total} detail="Registered shoppers" Icon={UsersRound} />
                    <StatCard label="Active accounts" value={customerStats.active} detail="Currently enabled" Icon={ShieldCheck} />
                    <StatCard label="Ordered before" value={customerStats.with_orders} detail="Customers with orders" Icon={ShoppingBag} />
                    <StatCard label="Orders placed" value={customerStats.orders} detail="Customer shopping activity" Icon={Activity} />
                </div>

                <section className="mt-5 overflow-hidden rounded-xl border border-[#e4ebe6] bg-white shadow-[0_3px_13px_rgba(31,70,48,0.045)]">
                    <div className="border-b border-[#e1ebe0] p-4 sm:p-5">
                        <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
                            <div>
                                <p className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.16em] text-[#328152] uppercase">
                                    <UsersRound size={13} /> Directory
                                </p>
                                <h2 className="mt-1 text-base font-bold text-[#173b27]">All customers</h2>
                                <p className="mt-0.5 text-[10px] text-[#7a897d]">
                                    Showing {filteredCustomers.length ? (page - 1) * PAGE_SIZE + 1 : 0}–
                                    {Math.min(page * PAGE_SIZE, filteredCustomers.length)} of {filteredCustomers.length} customer accounts
                                </p>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_auto_auto] xl:w-auto">
                                <label className="relative min-w-0">
                                    <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#91a095]" />
                                    <input
                                        value={search}
                                        onChange={(event) => {
                                            setSearch(event.target.value);
                                            setPage(1);
                                        }}
                                        placeholder="Search customers..."
                                        className="h-9 w-full rounded-lg border border-[#dfe7e1] bg-[#fbfdfb] pr-3 pl-8 text-[11px] outline-none focus:border-[#287e4a]"
                                    />
                                </label>
                                <select
                                    aria-label="Filter customer status"
                                    value={status}
                                    onChange={(event) => {
                                        setStatus(event.target.value);
                                        setPage(1);
                                    }}
                                    className="h-9 rounded-lg border border-[#dfe7e1] bg-white px-2.5 text-[11px] text-[#53665a] outline-none focus:border-[#287e4a]"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                                <select
                                    aria-label="Sort customers"
                                    value={sort}
                                    onChange={(event) => {
                                        setSort(event.target.value as SortBy);
                                        setPage(1);
                                    }}
                                    className="h-9 rounded-lg border border-[#dfe7e1] bg-white px-2.5 text-[11px] text-[#53665a] outline-none focus:border-[#287e4a]"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="most_orders">Most orders</option>
                                    <option value="least_orders">Least orders</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-190 text-left text-xs">
                            <thead className="bg-[#f1f6f0] text-[9px] tracking-[0.12em] text-[#718075] uppercase">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Customer</th>
                                    <th className="px-4 py-3 font-semibold">Account status</th>
                                    <th className="px-4 py-3 font-semibold">Orders</th>
                                    <th className="px-4 py-3 font-semibold">Joined</th>
                                    <th className="px-4 py-3 text-right font-semibold">Profile</th>
                                    <th className="w-12 px-3 py-3" aria-label="More actions" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf1eb]">
                                {pageCustomers.map((customer) => (
                                    <tr key={customer.id} className="transition hover:bg-[#fbfdfb]">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e3f1e3] text-[#287e4a]">
                                                    <UserRound size={16} />
                                                </span>
                                                <span className="min-w-0">
                                                    <strong className="block truncate text-[11px] text-[#294231]">{customer.name}</strong>
                                                    <span className="mt-0.5 flex items-center gap-1 truncate text-[9px] text-[#829087]">
                                                        <Mail size={10} />
                                                        {customer.email}
                                                    </span>
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2 py-1 text-[9px] font-semibold ${(customer.status ?? 'active') === 'active' ? 'bg-[#e3f1e3] text-[#287e4a]' : 'bg-[#fff0ed] text-[#b34c40]'}`}
                                            >
                                                {(customer.status ?? 'active') === 'active' ? 'Active' : 'Suspended'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-[10px] text-[#53665a]">
                                            {customer.orders_count} {customer.orders_count === 1 ? 'order' : 'orders'}
                                        </td>
                                        <td className="px-4 py-3 text-[10px] text-[#718075]">{formatDate(customer.created_at)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => setSelected(customer)}
                                                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#cbded0] px-2.5 text-[10px] font-semibold text-[#287e4a] hover:bg-[#f1f8f3]"
                                            >
                                                <Eye size={13} /> View account
                                            </button>
                                        </td>
                                        <td className="relative px-3 py-3">
                                            <button
                                                type="button"
                                                aria-label={`More actions for ${customer.name}`}
                                                aria-expanded={menuId === customer.id}
                                                onClick={() => setMenuId(menuId === customer.id ? null : customer.id)}
                                                className="rounded-md p-1.5 text-[#718075] hover:bg-[#edf5ef]"
                                            >
                                                <MoreHorizontal size={17} />
                                            </button>
                                            {menuId === customer.id && (
                                                <div className="absolute top-10 right-3 z-20 w-40 rounded-lg border border-[#e1e9e2] bg-white p-1 shadow-lg">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelected(customer);
                                                            setMenuId(null);
                                                        }}
                                                        className="w-full rounded-md px-2.5 py-2 text-left text-[10px] text-[#405348] hover:bg-[#f3f8f4]"
                                                    >
                                                        View account
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            openEdit(customer);
                                                            setMenuId(null);
                                                        }}
                                                        className="w-full rounded-md px-2.5 py-2 text-left text-[10px] text-[#405348] hover:bg-[#f3f8f4]"
                                                    >
                                                        Edit account
                                                    </button>
                                                    {(customer.status ?? 'active') === 'active' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setSuspending(customer);
                                                                setMenuId(null);
                                                            }}
                                                            className="w-full rounded-md px-2.5 py-2 text-left text-[10px] text-[#a7463e] hover:bg-[#fff5f3]"
                                                        >
                                                            Suspend account
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {pageCustomers.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-14 text-center text-xs text-[#718075]">
                                            No customers match the current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col gap-2 border-t border-[#edf1eb] px-4 py-3 text-[10px] text-[#718075] sm:flex-row sm:items-center sm:justify-between">
                        <span>
                            Showing {filteredCustomers.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filteredCustomers.length)}{' '}
                            of {filteredCustomers.length} customer accounts
                        </span>
                        <div className="flex items-center gap-1 self-end sm:self-auto">
                            <button
                                type="button"
                                disabled={page === 1}
                                onClick={() => setPage((current) => Math.max(1, current - 1))}
                                className="inline-flex h-7 items-center gap-1 rounded-md border border-[#dfe7e1] px-2 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={13} /> Previous
                            </button>
                            <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-[#eaf6ef] px-2 font-semibold text-[#287e4a]">
                                {page}
                            </span>
                            <button
                                type="button"
                                disabled={page >= pageCount}
                                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                                className="inline-flex h-7 items-center gap-1 rounded-md border border-[#dfe7e1] px-2 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next <ChevronRight size={13} />
                            </button>
                        </div>
                    </div>
                </section>

                <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(260px,0.85fr)]">
                    <Panel title="Customer Activity" subtitle="Customer registration and order activity">
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="inline-flex rounded-lg border border-[#e1e9e2] bg-[#f8fbf8] p-0.5" aria-label="Activity range">
                                {([7, 30, 90] as const).map((days) => (
                                    <button
                                        key={days}
                                        type="button"
                                        aria-pressed={range === days}
                                        onClick={() => setRange(days)}
                                        className={`rounded-md px-2.5 py-1.5 text-[9px] font-semibold ${range === days ? 'bg-white text-[#287e4a] shadow-sm' : 'text-[#7b897e]'}`}
                                    >
                                        {days === 90 ? '3 Months' : `${days} Days`}
                                    </button>
                                ))}
                            </div>
                            <span className="inline-flex items-center gap-1 text-[9px] text-[#7c8b80]">
                                <CalendarDays size={12} /> {visibleActivity[0]?.label} – {visibleActivity[visibleActivity.length - 1]?.label}
                            </span>
                        </div>
                        <ActivityChart points={visibleActivity} />
                    </Panel>

                    <Panel title="Customer Overview" subtitle="Key customer metrics at a glance">
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {[
                                { label: 'Total Customers', value: customerStats.total, Icon: UsersRound },
                                { label: 'Customers with Orders', value: customerStats.with_orders, Icon: ShoppingBag },
                                { label: 'Active Accounts', value: customerStats.active, Icon: ShieldCheck },
                                { label: 'New Customers', value: customerStats.new_this_month, Icon: Clock3 },
                            ].map(({ label, value, Icon }) => (
                                <div key={label} className="rounded-lg border border-[#e8eee9] bg-[#fbfdfb] p-3">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eaf6ef] text-[#328152]">
                                        <Icon size={14} />
                                    </span>
                                    <strong className="mt-2 block text-lg leading-none text-[#1c4b3d]">{value}</strong>
                                    <span className="mt-1 block text-[9px] leading-snug text-[#758379]">{label}</span>
                                </div>
                            ))}
                        </div>
                    </Panel>
                </div>
            </PortalLayout>

            {selected && (
                <Modal title={selected.name} subtitle={`Customer account #${selected.id}`} onClose={() => setSelected(null)}>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-[#f7faf7] p-3">
                            <p className="text-[9px] text-[#809087]">Customer</p>
                            <p className="mt-1 text-xs font-semibold text-[#294231]">{selected.name}</p>
                        </div>
                        <div className="rounded-lg bg-[#f7faf7] p-3">
                            <p className="text-[9px] text-[#809087]">Email</p>
                            <p className="mt-1 text-xs font-semibold break-all text-[#294231]">{selected.email}</p>
                        </div>
                        <div className="rounded-lg bg-[#f7faf7] p-3">
                            <p className="text-[9px] text-[#809087]">Account status</p>
                            <p className="mt-1 text-xs font-semibold text-[#294231] capitalize">{selected.status ?? 'active'}</p>
                        </div>
                        <div className="rounded-lg bg-[#f7faf7] p-3">
                            <p className="text-[9px] text-[#809087]">Orders · Joined</p>
                            <p className="mt-1 text-xs font-semibold text-[#294231]">
                                {selected.orders_count} {selected.orders_count === 1 ? 'order' : 'orders'} · {formatDate(selected.created_at)}
                            </p>
                        </div>
                    </div>
                    <div className="mt-5">
                        <h3 className="text-xs font-bold text-[#294231]">Customer activity</h3>
                        <p className="mt-0.5 text-[9px] text-[#829087]">Recent order history</p>
                        {selected.orders.length ? (
                            <div className="mt-2 divide-y divide-[#edf1eb] rounded-lg border border-[#e7eee8]">
                                {selected.orders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                                        <div className="min-w-0">
                                            <p className="truncate text-[10px] font-semibold text-[#405348]">
                                                {order.order_number || `Order #${order.id}`}
                                            </p>
                                            <p className="mt-0.5 text-[9px] text-[#859188]">
                                                {formatDate(order.created_at)} · <span className="capitalize">{order.status}</span>
                                            </p>
                                        </div>
                                        <strong className="shrink-0 text-[10px] text-[#287e4a]">{formatMoney(order.total)}</strong>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-2 rounded-lg bg-[#f8fbf8] p-3 text-[10px] text-[#829087]">
                                No order history is available for this customer.
                            </p>
                        )}
                    </div>
                    <div className="mt-5 flex flex-wrap justify-between gap-2 border-t border-[#edf1eb] pt-4">
                        <Link
                            href="/admin/orders"
                            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#d5e3d8] px-3 text-[10px] font-semibold text-[#287e4a]"
                        >
                            <ShoppingBag size={13} /> View orders
                        </Link>
                        <div className="flex gap-2">
                            {(selected.status ?? 'active') === 'active' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSuspending(selected);
                                        setSelected(null);
                                    }}
                                    className="h-8 rounded-md border border-[#f0d9d5] px-3 text-[10px] font-semibold text-[#ad4c42]"
                                >
                                    Suspend account
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => openEdit(selected)}
                                className="h-8 rounded-md bg-[#287e4a] px-3 text-[10px] font-semibold text-white hover:bg-[#216b3e]"
                            >
                                Edit customer
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {editing && (
                <Modal title="Edit customer" subtitle="Update customer account information." onClose={() => setEditing(null)}>
                    <form onSubmit={saveCustomer} className="mt-5 space-y-3">
                        <label className="block text-[10px] font-semibold text-[#53665a]">
                            Full name
                            <input
                                value={form.data.name}
                                onChange={(event) => form.setData('name', event.target.value)}
                                className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe7e1] px-3 text-xs font-normal outline-none focus:border-[#287e4a]"
                            />
                            {form.errors.name && <span className="mt-1 block text-[10px] text-red-600">{form.errors.name}</span>}
                        </label>
                        <label className="block text-[10px] font-semibold text-[#53665a]">
                            Email address
                            <input
                                type="email"
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                                className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe7e1] px-3 text-xs font-normal outline-none focus:border-[#287e4a]"
                            />
                            {form.errors.email && <span className="mt-1 block text-[10px] text-red-600">{form.errors.email}</span>}
                        </label>
                        <label className="block text-[10px] font-semibold text-[#53665a]">
                            Account status
                            <select
                                value={form.data.status}
                                onChange={(event) => form.setData('status', event.target.value)}
                                className="mt-1.5 h-10 w-full rounded-lg border border-[#dfe7e1] bg-white px-3 text-xs font-normal outline-none focus:border-[#287e4a]"
                            >
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                            </select>
                            {form.errors.status && <span className="mt-1 block text-[10px] text-red-600">{form.errors.status}</span>}
                        </label>
                        <div className="flex justify-end gap-2 border-t border-[#edf1eb] pt-4">
                            <button
                                type="button"
                                onClick={() => setEditing(null)}
                                className="h-9 rounded-lg border border-[#dfe7e1] px-4 text-xs font-semibold text-[#647369]"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#287e4a] px-4 text-xs font-semibold text-white disabled:opacity-60"
                            >
                                <Check size={14} /> Save changes
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {suspending && (
                <Modal
                    alert
                    title="Suspend customer?"
                    subtitle="Are you sure you want to suspend this customer account?"
                    onClose={() => setSuspending(null)}
                >
                    <div className="mt-5 rounded-lg bg-[#fff8f6] p-3 text-xs text-[#53665a]">
                        <strong className="text-[#294231]">{suspending.name}</strong>
                        <br />
                        {suspending.email}
                    </div>
                    <div className="mt-5 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setSuspending(null)}
                            className="h-9 rounded-lg border border-[#dfe7e1] px-4 text-xs font-semibold text-[#647369]"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={form.processing}
                            onClick={suspendCustomer}
                            className="h-9 rounded-lg bg-[#ad4c42] px-4 text-xs font-semibold text-white disabled:opacity-60"
                        >
                            Suspend account
                        </button>
                    </div>
                </Modal>
            )}
        </>
    );
}
