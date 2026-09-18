import { api } from '@/lib/api';
import { Head } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Barcode, Bike, CalendarDays, Check, Copy, Leaf, MapPin, Truck } from 'lucide-react';
import { useState } from 'react';

type OrderItem = {
    id: number;
    quantity: number;
    unit_price: string | number;
    total_price: string | number;
    product?: {
        name?: string;
        images?: { path: string; is_primary?: boolean }[];
        color?: string | null;
        size?: string | null;
    };
    variant?: { name?: string } | null;
};

type CustomerOrder = {
    order_number: string;
    status?: string;
    created_at: string;
    items?: OrderItem[];
};

type OrdersResponse = { data?: CustomerOrder[] };
type TimelineState = 'completed' | 'current' | 'pending';

type TimelineStage = {
    title: string;
    detail: string;
    state: TimelineState;
    note: string;
};

const stages = ['Order Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

function imageUrl(path?: string) {
    return path ? (path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`) : null;
}

function formatDate(value: string) {
    return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatMoney(value: string | number) {
    return `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function estimatedDelivery(value: string) {
    const start = new Date(value);
    const end = new Date(value);
    start.setDate(start.getDate() + 3);
    end.setDate(end.getDate() + 5);
    const format = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${format(start)} – ${format(end)}, ${end.getFullYear()}`;
}

function currentStageIndex(status?: string) {
    const normalized = status?.toLowerCase().replace(/[_-]/g, ' ') || 'pending';
    if (normalized === 'delivered' || normalized === 'completed') return 4;
    if (normalized === 'out for delivery' || normalized === 'out_for_delivery') return 3;
    if (normalized === 'shipped') return 2;
    if (normalized === 'processing' || normalized === 'accepted') return 1;
    return 1;
}

function buildTimeline(order: CustomerOrder): TimelineStage[] {
    const activeIndex = currentStageIndex(order.status);
    const placedDate = formatDate(order.created_at);

    return stages.map((title, index) => ({
        title,
        detail:
            index === 0
                ? `${placedDate} • ${new Date(order.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
                : index === activeIndex
                  ? 'Your order is being prepared by the seller.'
                  : index < activeIndex
                    ? 'Your order is on the way to the delivery partner.'
                    : index === 3
                      ? 'Your order is almost there!'
                      : 'Enjoy your purchase!',
        state: index < activeIndex ? 'completed' : index === activeIndex ? 'current' : 'pending',
        note: index === activeIndex ? 'In Progress' : index < activeIndex ? 'Completed' : 'Pending',
    }));
}

function Timeline({ order }: { order: CustomerOrder }) {
    const timeline = buildTimeline(order);

    return (
        <div className="mt-8">
            {timeline.map((stage, index) => (
                <div
                    key={stage.title}
                    className={`relative flex gap-4 rounded-2xl px-3 py-3 sm:gap-6 ${stage.state === 'current' ? 'bg-[#f1fcf5]' : ''}`}
                >
                    <div className="relative flex w-12 shrink-0 justify-center sm:w-14">
                        {index < timeline.length - 1 && (
                            <div
                                className={`absolute top-11 bottom-[-1.25rem] w-0.5 ${stage.state === 'pending' ? 'bg-[#d9ebe5]' : 'bg-[#20a866]'}`}
                            />
                        )}
                        <div
                            className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full text-base font-bold sm:h-12 sm:w-12 ${
                                stage.state === 'completed'
                                    ? 'bg-[#10a765] text-white'
                                    : stage.state === 'current'
                                      ? 'bg-[#16a96b] text-white ring-4 ring-[#b8ead2]'
                                      : 'bg-[#d5e8e3] text-white'
                            }`}
                        >
                            {stage.state === 'completed' ? (
                                <Check size={22} strokeWidth={3} />
                            ) : stage.state === 'current' ? (
                                <Bike size={21} />
                            ) : (
                                index + 1
                            )}
                        </div>
                    </div>
                    <div className={`min-w-0 flex-1 pb-7 ${index === timeline.length - 1 ? 'pb-0' : ''}`}>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3
                                className={`text-base leading-tight font-bold sm:text-lg ${
                                    stage.state === 'current' ? 'text-[#0a9e5e]' : stage.state === 'pending' ? 'text-[#23584d]' : 'text-[#145b52]'
                                }`}
                            >
                                {stage.title}
                            </h3>
                            <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase ${
                                    stage.state === 'completed'
                                        ? 'bg-[#e4f8ed] text-[#14935c]'
                                        : stage.state === 'current'
                                          ? 'bg-[#c9f1da] text-[#078c53]'
                                          : 'bg-[#edf5f2] text-[#83a49c]'
                                }`}
                            >
                                {stage.note}
                            </span>
                        </div>
                        <p className="mt-1 text-xs font-medium text-[#73a1ad] sm:text-sm">{stage.detail}</p>
                        {stage.state === 'current' && (
                            <p className="mt-1 text-[11px] font-medium text-[#73a1ad]">{formatDate(order.created_at)} • 12:45 PM</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function CustomerOrderTracking() {
    const [copied, setCopied] = useState(false);
    const { data, isLoading } = useQuery<OrdersResponse>({
        queryKey: ['customer-orders'],
        queryFn: async () => (await api.get('/customer/orders')).data,
    });
    const selectedItemId =
        typeof window === 'undefined'
            ? null
            : Number(
                  new URLSearchParams(window.location.search).get('selected_item_ids[]') ||
                      new URLSearchParams(window.location.search).get('selected_item_ids[0]'),
              ) || null;
    const order =
        data?.data?.find((candidate) => selectedItemId && candidate.items?.some((orderItem) => orderItem.id === selectedItemId)) || data?.data?.[0];
    const item = order?.items?.find((orderItem) => orderItem.id === selectedItemId) || order?.items?.[0];
    const image = item?.product?.images?.find((productImage) => productImage.is_primary) || item?.product?.images?.[0];
    const productImage = imageUrl(image?.path);
    const variant = item?.variant?.name || [item?.product?.color, item?.product?.size].filter(Boolean).join(' / ') || 'Product variant';

    return (
        <>
            <Head title="Order Tracking" />
            <main className="relative min-h-screen overflow-hidden bg-[#effcf5] px-4 py-6 text-[#145b52] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
                <Leaf className="pointer-events-none absolute -top-10 right-8 h-40 w-40 rotate-45 text-[#d8f3e1] opacity-70" strokeWidth={1} />
                <Leaf
                    className="pointer-events-none absolute right-[-3rem] bottom-16 h-44 w-44 -rotate-45 text-[#d8f3e1] opacity-55"
                    strokeWidth={1}
                />
                <div className="relative mx-auto max-w-[1140px]">
                    <header className="mb-8 flex items-center gap-4 sm:mb-10 sm:gap-6">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            aria-label="Back to orders"
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#147b6d] shadow-[0_10px_24px_rgba(32,120,91,0.1)] ring-1 ring-[#dcefe6] transition hover:-translate-x-0.5 hover:bg-[#e8f8ef]"
                        >
                            <ArrowLeft size={23} />
                        </button>
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] text-[#20a866] uppercase">Delivery updates</p>
                            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0b5b55] sm:text-3xl">Order Tracking</h1>
                        </div>
                    </header>

                    {isLoading ? (
                        <section className="rounded-[26px] bg-white/80 p-8 text-center text-[#73a1ad] shadow-[0_12px_32px_rgba(32,120,91,0.06)]">
                            Loading order tracking...
                        </section>
                    ) : !order ? (
                        <section className="rounded-[26px] bg-white/80 p-8 text-center text-[#73a1ad] shadow-[0_12px_32px_rgba(32,120,91,0.06)]">
                            No orders found.
                        </section>
                    ) : (
                        <>
                            <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">
                                <section className="rounded-[24px] border border-[#dcefe5] bg-white/95 p-5 shadow-[0_16px_40px_rgba(32,120,91,0.08)] sm:p-8">
                                    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e7f2ed] pb-5">
                                        <div>
                                            <p className="text-xs font-semibold text-[#6f9d95]">Order #</p>
                                            <p className="mt-1 text-xl font-bold text-[#0b5b55] sm:text-2xl">{order.order_number}</p>
                                            <p className="mt-1 text-sm font-medium text-[#73a1ad]">Placed on {formatDate(order.created_at)}</p>
                                        </div>
                                        <div className="flex items-center gap-2 rounded-2xl bg-[#e7f9ef] px-4 py-3 text-sm font-bold text-[#13935b]">
                                            <Truck size={20} />
                                            <span className="text-xs sm:text-sm">In Transit</span>
                                        </div>
                                    </div>
                                    <Timeline order={order} />
                                </section>

                                {item && (
                                    <div className="space-y-5">
                                        <section className="flex flex-col gap-4 rounded-[24px] border border-[#dcefe5] bg-white/95 p-4 shadow-[0_16px_40px_rgba(32,120,91,0.08)] sm:flex-row sm:items-center sm:p-5">
                                            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-[#eaf4ef] sm:h-32 sm:w-32">
                                                {productImage ? (
                                                    <img
                                                        src={productImage}
                                                        alt={item.product?.name || 'Product'}
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-sm font-semibold text-[#70a39b]">Product image</span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <h2 className="text-base font-bold text-[#145b52] sm:text-lg">{item.product?.name || 'Product'}</h2>
                                                <p className="mt-1 text-sm font-medium text-[#73a1ad]">{variant}</p>
                                                <p className="mt-2 text-lg font-bold text-[#145b52] sm:text-xl">{formatMoney(item.unit_price)}</p>
                                                <p className="mt-1 text-sm font-medium text-[#73a1ad]">Qty: {item.quantity}</p>
                                            </div>
                                        </section>

                                        <section className="rounded-[24px] border border-[#dcefe5] bg-white/95 p-5 shadow-[0_16px_40px_rgba(32,120,91,0.08)]">
                                            <div className="flex items-start gap-4 pb-5">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e7f9ef] text-[#139b60]">
                                                    <CalendarDays size={22} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-[#6f9d95]">Estimated Delivery</p>
                                                    <p className="mt-1 text-lg font-bold text-[#145b52]">{estimatedDelivery(order.created_at)}</p>
                                                    <p className="mt-1 text-xs text-[#73a1ad]">Depending on your location and delivery partner.</p>
                                                </div>
                                            </div>
                                            <div className="border-t border-[#e7f2ed] pt-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e7f9ef] text-[#139b60]">
                                                        <Barcode size={22} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs font-semibold text-[#6f9d95]">Tracking Number</p>
                                                        <p className="mt-1 truncate text-base font-bold text-[#145b52]">{order.order_number}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            void navigator.clipboard?.writeText(order.order_number);
                                                            setCopied(true);
                                                        }}
                                                        className="flex items-center gap-1.5 rounded-full border border-[#b9e7cc] px-3 py-2 text-xs font-bold text-[#139b60] hover:bg-[#effbf4]"
                                                    >
                                                        <Copy size={14} /> {copied ? 'Copied' : 'Copy'}
                                                    </button>
                                                </div>
                                            </div>
                                        </section>
                                        <section className="flex gap-4 rounded-[24px] bg-[#e7f9ef] p-5 text-sm leading-6 text-[#15945e]">
                                            <MapPin size={26} className="mt-1 shrink-0" />
                                            <p>You can track your order in real time from our courier when your order is out for delivery.</p>
                                        </section>
                                    </div>
                                )}
                            </div>
                            <section className="mt-5 flex items-center gap-5 rounded-[22px] border border-[#bfe9d0] bg-[#effcf5] px-5 py-5 text-[#20a866] shadow-[0_10px_26px_rgba(32,120,91,0.04)] sm:px-8">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#20a866]">
                                    <Leaf size={23} />
                                </div>
                                <div className="h-10 w-px bg-[#b8e8d0]" />
                                <div>
                                    <p className="font-bold text-[#139b60]">Your order is on its way!</p>
                                    <p className="mt-1 text-sm text-[#73a1ad]">
                                        We appreciate your patience. You&apos;ll be notified as soon as it arrives.
                                    </p>
                                </div>
                                <Truck className="ml-auto hidden text-[#20a866] sm:block" size={34} />
                            </section>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}
