import { Head } from '@inertiajs/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, Package, Truck, X } from 'lucide-react';
import { PortalLayout } from '@/components/portal-layout';
import { api, prepareSanctum } from '@/lib/api';

export default function SellerOrders() {
	const queryClient = useQueryClient();
	const { data, isLoading } = useQuery({
		queryKey: ['seller-orders'],
		queryFn: async () => (await api.get('/seller/orders')).data,
	});
	const updateStatus = useMutation({
		mutationFn: async ({ id, status }: { id: number; status: 'accepted' | 'declined' }) => {
			await prepareSanctum();
			return api.patch(`/seller/orders/items/${id}`, { fulfillment_status: status });
		},
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['seller-orders'] }),
	});
	const orders = data?.data || [];

	return (
		<>
			<Head title="Seller orders" />
			<PortalLayout role="seller" title="Fulfill orders" eyebrow="Morrow Studio">
				<div className="mb-6 flex items-center gap-3 border border-[#dfe3dc] bg-[#dce7d5] p-5 text-sm">
					<Truck size={20} />
					<span><strong>{isLoading ? 'Checking' : orders.length || 9} orders</strong> are ready for your attention.</span>
				</div>
				<section className="border border-[#dfe3dc] bg-white">
					<div className="border-b border-[#dfe3dc] p-5"><h2 className="font-serif text-2xl">Recent orders</h2></div>
					{orders.length ? orders.map((item: any) => (
						<div key={item.id} className="flex items-center gap-4 border-b border-[#edf0eb] p-5">
							{(() => {
								const image = item.product?.images?.find((productImage: any) => productImage.is_primary) || item.product?.images?.[0];
								return image ? <img src={`/storage/${image.path}`} alt={item.product?.name || 'Product'} className="h-16 w-16 shrink-0 object-cover" /> : <Package size={20} />;
							})()}
							<div className="flex-1">
								<p className="text-sm font-semibold">Order #{item.order?.order_number}</p>
								<p className="mt-1 text-xs text-[#657066]">{item.product?.name} · {item.quantity} items</p>
							</div>
							{item.fulfillment_status === 'processing' ? (
								<div className="flex gap-2">
									<button
										type="button"
										title="Accept order"
										aria-label="Accept order"
										disabled={updateStatus.isPending}
										onClick={() => updateStatus.mutate({ id: item.id, status: 'accepted' })}
										className="flex items-center gap-1 border border-[#2c7a3b] px-3 py-2 text-xs font-semibold text-[#2c7a3b] transition hover:bg-[#eef7ed] disabled:opacity-50"
									>
										<Check size={15} /> Accept
									</button>
									<button
										type="button"
										title="Decline order"
										aria-label="Decline order"
										disabled={updateStatus.isPending}
										onClick={() => updateStatus.mutate({ id: item.id, status: 'declined' })}
										className="flex items-center gap-1 border border-[#a34d42] px-3 py-2 text-xs font-semibold text-[#a34d42] transition hover:bg-[#fdf0ee] disabled:opacity-50"
									>
										<X size={15} /> Decline
									</button>
								</div>
							) : <span className="text-xs font-semibold text-[#9a6b45]">{item.fulfillment_status}</span>}
						</div>
					)) : <div className="p-10 text-center text-sm text-[#657066]">Your incoming orders will appear here.</div>}
				</section>
			</PortalLayout>
		</>
	);
}