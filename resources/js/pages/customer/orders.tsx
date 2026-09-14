import { PortalLayout } from '@/components/portal-layout';
import { api } from '@/lib/api';
import { Head, Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, CalendarDays, Package, Truck } from 'lucide-react';

export default function CustomerOrders() {
    const { data, isLoading } = useQuery({
        queryKey: ['customer-orders'],
        queryFn: async () => (await api.get('/customer/orders')).data,
    });
    const orders = data?.data || [];

    return (
        <>
            <Head title="Your orders" />
            <PortalLayout role="customer" title="Your orders" eyebrow="Order history">
                <div className="mb-6">
                    <p className="text-xs font-bold tracking-[0.18em] text-[#2c9350] uppercase">A record of your finds</p>
                    <h2 className="font-display mt-2 text-3xl font-bold text-[#163b24]">Order history</h2>
                    <p className="mt-1 text-sm text-[#647568]">Follow every order from confirmation to delivery.</p>
                </div>
                {orders.length ? (
                    <div className="space-y-4">
                        {orders.map((order: any) => (
                            <section
                                key={order.id}
                                className="overflow-hidden rounded-3xl border border-[#def0e2] bg-white shadow-[0_8px_25px_rgba(22,59,36,0.06)]"
                            >
                                <div className="flex flex-col gap-3 border-b border-[#edf2ed] bg-[#fbfefb] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                                    <div>
                                        <p className="font-display font-bold text-[#163b24]">Order #{order.order_number}</p>
                                        <p className="mt-1 flex items-center gap-1.5 text-xs text-[#8b8a96]">
                                            <CalendarDays size={13} /> {new Date(order.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex w-fit items-center gap-2 rounded-full bg-[#e6f7eb] px-3 py-1.5 text-xs font-bold text-[#2c7a3b] capitalize">
                                        <Truck size={14} /> {order.status}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:px-7">
                                    <div className="flex -space-x-3">
                                        {(order.items || []).slice(0, 4).map((item: any) => {
                                            const image =
                                                item.product?.images?.find((productImage: any) => productImage.is_primary) ||
                                                item.product?.images?.[0];
                                            return (
                                                <div
                                                    key={item.id}
                                                    className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-[#e9f6ea] shadow-sm"
                                                >
                                                    {image ? (
                                                        <img
                                                            src={`/storage/${image.path}`}
                                                            alt={item.product?.name || 'Product'}
                                                            className="h-full w-full object-cover"
                                                            onError={(event) => {
                                                                event.currentTarget.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : (
                                                        <Package size={20} className="text-[#3fa34d]" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-[#163b24]">
                                            {order.items?.[0]?.product?.name || 'Your order'}
                                            {order.items?.length > 1 && (
                                                <span className="font-normal text-[#647568]"> and {order.items.length - 1} more</span>
                                            )}
                                        </p>
                                        <p className="mt-1 text-sm text-[#8b8a96]">
                                            {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'} in this order
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between gap-5 sm:block sm:text-right">
                                        <p className="text-xs text-[#8b8a96]">Order total</p>
                                        <p className="font-display mt-1 text-xl font-bold text-[#163b24]">
                                            ₱{Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                        <Link
                                            href={`/customer/orders/${order.id}`}
                                            className="flex items-center gap-1 text-xs font-bold text-[#2c7a3b] sm:mt-3 sm:inline-flex"
                                        >
                                            View order <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </div>
                ) : (
                    <section className="rounded-3xl border border-[#def0e2] bg-white p-12 text-center shadow-[0_8px_25px_rgba(22,59,36,0.06)]">
                        <Package className="mx-auto text-[#3fa34d]" />
                        <p className="font-display mt-4 text-2xl font-bold">{isLoading ? 'Finding your orders...' : 'No orders yet.'}</p>
                        <p className="mt-2 text-sm text-[#8b8a96]">Your next favorite thing is out there.</p>
                    </section>
                )}
            </PortalLayout>
        </>
    );
}
