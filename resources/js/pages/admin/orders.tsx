import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, Package, Search, ShoppingBag, Truck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { PortalLayout } from '@/components/portal-layout';
import { api } from '@/lib/api';

type Order = {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    total: string | number;
    created_at: string;
    user?: { name: string; email: string };
    items?: { quantity: number; shop?: { name: string }; product?: { name: string; images?: { path: string; is_primary: boolean }[] } }[];
};

type OrdersResponse = {
    data: Order[];
    current_page: number;
    last_page: number;
    total: number;
    stats?: { total: number; today: number; in_progress: number; revenue: number };
};

const statusStyles: Record<string, string> = {
    pending: 'bg-[#fff4df] text-[#9a6b45]',
    processing: 'bg-[#e8f0ff] text-[#3d5f9a]',
    accepted: 'bg-[#e6f7eb] text-[#2c7a3b]',
    shipped: 'bg-[#e8f0ff] text-[#3d5f9a]',
    delivered: 'bg-[#e6f7eb] text-[#2c7a3b]',
    cancelled: 'bg-[#fce9e6] text-[#a23b2d]',
};

function money(value: string | number) {
    return `₱${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
}

export default function AdminOrders() {
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [paymentStatus, setPaymentStatus] = useState('all');
    const [page, setPage] = useState(1);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setQuery(search);
            setPage(1);
        }, 300);
        return () => window.clearTimeout(timer);
    }, [search]);

    const { data, isLoading, isError } = useQuery<OrdersResponse>({
        queryKey: ['admin-orders', query, status, paymentStatus, page],
        queryFn: async () =>
            (await api.get('/admin/orders', { params: { search: query || undefined, status, payment_status: paymentStatus, page } })).data,
    });
    const orders = data?.data ?? [];
    const stats = data?.stats;

    function changeFilter(setter: (value: string) => void, value: string) {
        setter(value);
        setPage(1);
    }

    return (
        <>
            <Head title="Order monitoring" />
            <PortalLayout role="admin" title="Order monitoring" eyebrow="Platform operations">
                <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <p className="text-sm text-[#647568]">Keep a close eye on every customer purchase and fulfillment stage.</p>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#2c7a3b]">
                        <span className="h-2 w-2 rounded-full bg-[#3fa34d]" /> Live order data
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Metric icon={ShoppingBag} label="All orders" value={stats?.total ?? 0} detail="Across the marketplace" />
                    <Metric icon={CalendarDays} label="Placed today" value={stats?.today ?? 0} detail="New customer orders" tone="green" />
                    <Metric icon={Clock3} label="In progress" value={stats?.in_progress ?? 0} detail="Needs fulfillment" tone="warm" />
                    <Metric icon={CircleDollarSign} label="Gross revenue" value={money(stats?.revenue ?? 0)} detail="From all orders" tone="blue" />
                </div>
                <section className="mt-8 overflow-hidden border border-[#dfe3dc] bg-white">
                    <div className="flex flex-col gap-4 border-b border-[#dfe3dc] p-5 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <p className="text-xs font-bold tracking-[0.18em] text-[#9a6b45] uppercase">Order ledger</p>
                            <h2 className="mt-2 font-serif text-2xl">All customer orders</h2>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <label className="flex items-center gap-2 border border-[#ccd3ca] px-3 py-2 text-sm">
                                <Search size={16} className="text-[#657066]" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search order or customer"
                                    className="w-full bg-transparent outline-none sm:w-52"
                                />
                                {search && (
                                    <button type="button" onClick={() => setSearch('')} aria-label="Clear search">
                                        <XCircle size={15} />
                                    </button>
                                )}
                            </label>
                            <select
                                value={status}
                                onChange={(event) => changeFilter(setStatus, event.target.value)}
                                className="border border-[#ccd3ca] bg-white px-3 py-2 text-sm"
                            >
                                <option value="all">All order statuses</option>
                                <option value="pending">Pending</option>
                                <option value="processing">Processing</option>
                                <option value="accepted">Accepted</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <select
                                value={paymentStatus}
                                onChange={(event) => changeFilter(setPaymentStatus, event.target.value)}
                                className="border border-[#ccd3ca] bg-white px-3 py-2 text-sm"
                            >
                                <option value="all">All payments</option>
                                <option value="pending">Payment pending</option>
                                <option value="paid">Paid</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>
                    {isError ? (
                        <div className="p-12 text-center text-sm text-[#a23b2d]">Unable to load orders. Please refresh and try again.</div>
                    ) : isLoading ? (
                        <div className="p-12 text-center text-sm text-[#657066]">Loading order activity...</div>
                    ) : orders.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="mx-auto text-[#9a6b45]" />
                            <p className="mt-3 font-semibold">No orders match these filters.</p>
                            <p className="mt-1 text-sm text-[#657066]">Try clearing the search or choosing a different status.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-250 text-left text-sm">
                                    <thead className="border-b border-[#edf0eb] bg-[#fbfcfa] text-xs text-[#657066]">
                                        <tr>
                                            <th className="px-5 py-3 font-medium">Item</th>
                                            <th className="px-5 py-3 font-medium">Order</th>
                                            <th className="px-5 py-3 font-medium">Customer</th>
                                            <th className="px-5 py-3 font-medium">Items / shops</th>
                                            <th className="px-5 py-3 font-medium">Status</th>
                                            <th className="px-5 py-3 font-medium">Payment</th>
                                            <th className="px-5 py-3 text-right font-medium">Total</th>
                                            <th className="px-5 py-3 text-right font-medium">Placed</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order) => {
                                            const firstItem = order.items?.[0];
                                            const image =
                                                firstItem?.product?.images?.find((productImage) => productImage.is_primary) ??
                                                firstItem?.product?.images?.[0];
                                            return (
                                                <tr key={order.id} className="border-b border-[#edf0eb] last:border-0 hover:bg-[#fbfcfa]">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden bg-[#e6f7eb] text-[#2c7a3b]">
                                                                {image ? (
                                                                    <img
                                                                        src={`/storage/${image.path}`}
                                                                        alt={firstItem?.product?.name ?? 'Product'}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <Package size={19} />
                                                                )}
                                                            </span>
                                                            <span className="max-w-36 truncate font-medium">
                                                                {firstItem?.product?.name ?? 'Order items'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold">#{order.order_number}</p>
                                                        <p className="mt-1 text-xs text-[#657066]">ID {order.id}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold">{order.user?.name ?? 'Guest customer'}</p>
                                                        <p className="mt-1 text-xs text-[#657066]">{order.user?.email ?? 'No email'}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p>{order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0} items</p>
                                                        <p className="mt-1 max-w-48 truncate text-xs text-[#657066]">
                                                            {[...new Set(order.items?.map((item) => item.shop?.name).filter(Boolean))].join(', ') ||
                                                                'Marketplace'}
                                                        </p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles[order.status] ?? 'bg-[#eef0e9] text-[#657066]'}`}
                                                        >
                                                            <Truck size={13} />
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="text-xs font-semibold text-[#657066] capitalize">
                                                            {order.payment_status ?? 'pending'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-semibold">{money(order.total)}</td>
                                                    <td className="px-5 py-4 text-right text-xs text-[#657066]">
                                                        <span className="whitespace-nowrap">{new Date(order.created_at).toLocaleDateString()}</span>
                                                        <br />
                                                        <span>
                                                            {new Date(order.created_at).toLocaleTimeString([], {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex items-center justify-between border-t border-[#edf0eb] px-5 py-4 text-sm">
                                <span className="text-[#657066]">
                                    Showing {orders.length} of {data?.total ?? 0} orders
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={page <= 1}
                                        onClick={() => setPage((current) => current - 1)}
                                        className="border border-[#ccd3ca] p-2 disabled:opacity-40"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="px-2 text-xs font-semibold">
                                        Page {data?.current_page ?? page} of {data?.last_page ?? 1}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={page >= (data?.last_page ?? 1)}
                                        onClick={() => setPage((current) => current + 1)}
                                        className="border border-[#ccd3ca] p-2 disabled:opacity-40"
                                        aria-label="Next page"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </PortalLayout>
        </>
    );
}

function Metric({
    icon: Icon,
    label,
    value,
    detail,
    tone = 'default',
}: {
    icon: typeof Package;
    label: string;
    value: string | number;
    detail: string;
    tone?: string;
}) {
    const colors =
        tone === 'green'
            ? 'bg-[#e6f7eb] text-[#2c7a3b]'
            : tone === 'warm'
              ? 'bg-[#fff4df] text-[#9a6b45]'
              : tone === 'blue'
                ? 'bg-[#e8f0ff] text-[#3d5f9a]'
                : 'bg-[#eef0e9] text-[#46564a]';
    return (
        <div className="border border-[#dfe3dc] bg-white p-5">
            <div className={`mb-5 flex h-9 w-9 items-center justify-center ${colors}`}>
                <Icon size={18} />
            </div>
            <p className="text-xs font-semibold text-[#657066]">{label}</p>
            <p className="mt-1 font-serif text-3xl">{value}</p>
            <p className="mt-1 text-xs text-[#657066]">{detail}</p>
        </div>
    );
}
