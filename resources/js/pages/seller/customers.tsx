import { Head } from '@inertiajs/react';
import {
	ArrowDownUp,
	ArrowLeft,
	ArrowRight,
	ArrowUpRight,
	BadgeCheck,
	ChartNoAxesCombined,
	Mail,
	Search,
	ShoppingBag,
	Sparkles,
	TrendingUp,
	UserRound,
	Users,
	X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
} from 'recharts';
import { PortalLayout } from '@/components/portal-layout';

type CustomerStatus = 'New' | 'Returning' | 'Inactive';
type CustomerOrder = {
	orderId: string;
	date: string | null;
	createdAt: string | null;
	items: number;
	amount: number;
	status: string;
};
type Customer = {
	id: string;
	name: string;
	email: string;
	avatar: string | null;
	orders: number;
	spent: number;
	lastOrder: string | null;
	status: CustomerStatus;
	orderHistory: CustomerOrder[];
};
type CustomerStat = { label: string; value: number; detail: string; tone: 'green' | 'mint' | 'dark' };
type CustomerSummary = { total: number; new: number; returning: number; inactive: number };
type SellerCustomersProps = { stats: CustomerStat[]; customers: Customer[]; customerSummary: CustomerSummary };
type SortField = 'name' | 'orders' | 'spent' | 'lastOrder';

const money = (value: number) =>
	new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(value);
const shortDate = (value: string | null) => {
	if (!value) return '—';
	const date = new Date(`${value.slice(0, 10)}T00:00:00`);
	return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
};
const emptySummary: CustomerSummary = { total: 0, new: 0, returning: 0, inactive: 0 };

export default function SellerCustomers({ stats = [], customers = [], customerSummary = emptySummary }: SellerCustomersProps) {
	const [search, setSearch] = useState('');
	const [statusFilter, setStatusFilter] = useState<'All Customers' | CustomerStatus>('All Customers');
	const [sortField, setSortField] = useState<SortField>('lastOrder');
	const [sortDescending, setSortDescending] = useState(true);
	const [page, setPage] = useState(1);
	const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
	const pageSize = 8;

	const filteredCustomers = useMemo(() => {
		const needle = search.trim().toLowerCase();
		const rows = customers.filter((customer) => {
			const matchesSearch = !needle || `${customer.name} ${customer.email}`.toLowerCase().includes(needle);
			const matchesStatus = statusFilter === 'All Customers' || customer.status === statusFilter;
			return matchesSearch && matchesStatus;
		});
		rows.sort((a, b) => {
			let comparison = 0;
			if (sortField === 'name') comparison = a.name.localeCompare(b.name);
			if (sortField === 'orders') comparison = a.orders - b.orders;
			if (sortField === 'spent') comparison = a.spent - b.spent;
			if (sortField === 'lastOrder') comparison = (a.lastOrder ?? '').localeCompare(b.lastOrder ?? '');
			return sortDescending ? -comparison : comparison;
		});
		return rows;
	}, [customers, search, statusFilter, sortField, sortDescending]);

	const pageCount = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
	const currentPage = Math.min(page, pageCount);
	const visibleCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

	const insights = useMemo(() => {
		const orderCount = customers.reduce((total, customer) => total + customer.orders, 0);
		const revenue = customers.reduce((total, customer) => total + customer.spent, 0);
		const returningRate = customerSummary.total ? (customerSummary.returning / customerSummary.total) * 100 : 0;
		return [
			{ label: 'Average order value', value: money(orderCount ? revenue / orderCount : 0), trend: '+8.4%', icon: ShoppingBag, values: [4, 6, 5, 9, 7, 11, 13] },
			{ label: 'Orders per customer', value: (customerSummary.total ? orderCount / customerSummary.total : 0).toFixed(1), trend: '+12.1%', icon: Users, values: [3, 5, 4, 7, 6, 9, 11] },
			{ label: 'Returning customer rate', value: `${returningRate.toFixed(1)}%`, trend: '+6.3%', icon: TrendingUp, values: [2, 4, 3, 6, 5, 8, 10] },
			{ label: 'Customer lifetime value', value: money(customerSummary.total ? revenue / customerSummary.total : 0), trend: '+9.2%', icon: Sparkles, values: [3, 4, 7, 6, 8, 10, 13] },
		];
	}, [customers, customerSummary]);

	const topCustomers = useMemo(() => [...customers].sort((a, b) => b.spent - a.spent).slice(0, 5), [customers]);
	const statusBreakdown = [
		{ name: 'New Customers', value: customerSummary.new, color: '#49aa73' },
		{ name: 'Returning Customers', value: customerSummary.returning, color: '#1f7a4a' },
		{ name: 'Inactive Customers', value: customerSummary.inactive, color: '#cbded2' },
	];

	function sortBy(field: SortField) {
		if (sortField === field) setSortDescending((current) => !current);
		else {
			setSortField(field);
			setSortDescending(field !== 'name');
		}
		setPage(1);
	}

	return (
		<>
			<Head title="Customers" />
			<PortalLayout role="seller" title="Customers" eyebrow="Customer monitoring">
				<div className="space-y-5">
					<header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
						<div>
							<p className="text-xs font-semibold text-[#27774a]">Customers</p>
							<h1 className="mt-1 text-2xl font-bold text-[#1d3327]">Customer Monitoring</h1>
							<p className="mt-1 text-sm text-[#728078]">Monitor your buyers, customer activity, and purchasing behavior.</p>
						</div>
					</header>

					<section aria-label="Customer statistics" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{stats.map((stat, index) => {
							const Icon = [Users, UserRound, BadgeCheck][index] ?? Users;
							return <StatCard key={stat.label} stat={stat} icon={Icon} />;
						})}
					</section>

					<section className="min-w-0 bg-white p-4 sm:p-5">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
							<div className="flex items-center gap-3">
								<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8f5ec] text-[#28784a]"><Users size={18} /></span>
								<div><h2 className="text-sm font-bold text-[#25372c]">Customer directory</h2><p className="mt-0.5 text-[10px] text-[#7d8b82]">Buyers</p></div>
							</div>
							<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
								<div className="flex flex-wrap gap-1 rounded-lg bg-[#f4f8f5] p-1">
									{(['All Customers', 'Returning', 'New'] as const).map((filter) => <button key={filter} type="button" onClick={() => { setStatusFilter(filter); setPage(1); }} className={`rounded-md px-2.5 py-1.5 text-[10px] font-semibold ${statusFilter === filter ? 'bg-white text-[#267748] shadow-sm' : 'text-[#748178] hover:text-[#267748]'}`}>{filter === 'New' ? 'New Customers' : filter}</button>)}
								</div>
								<label className="flex h-9 items-center gap-2 rounded-lg border border-[#dfe7e1] px-2.5 sm:w-52">
									<Search size={13} className="shrink-0 text-[#64786a]" />
									<input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search customers..." className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-[#929d96]" />
								</label>
								<label className="flex h-9 items-center gap-1.5 rounded-lg border border-[#dfe7e1] px-2.5 text-[10px] text-[#59695e]">
									<ArrowDownUp size={13} />
									<select value={sortField} onChange={(event) => { setSortField(event.target.value as SortField); setPage(1); }} className="bg-transparent outline-none">
										<option value="lastOrder">Last order</option><option value="name">Name</option><option value="orders">Orders</option><option value="spent">Total spent</option>
									</select>
								</label>
								<button type="button" onClick={() => { setSearch(''); setStatusFilter('All Customers'); setPage(1); }} className="h-9 rounded-lg border border-[#d5e3d9] px-3 text-[10px] font-semibold text-[#346848] hover:bg-[#f5faf6]">View all</button>
							</div>
						</div>
						<div className="mt-4 overflow-x-auto rounded-lg border border-[#edf1ee]">
							<table className="w-full min-w-[790px] text-left text-[11px]">
								<thead className="bg-[#f7faf8] text-[9px] text-[#748178]">
									<tr>
										<th className="px-3 py-3 font-semibold"><SortButton label="Customer" active={sortField === 'name'} descending={sortDescending} onClick={() => sortBy('name')} /></th>
										<th className="px-3 py-3 font-semibold">Email</th>
										<th className="px-3 py-3 text-center font-semibold"><SortButton label="Orders" active={sortField === 'orders'} descending={sortDescending} onClick={() => sortBy('orders')} /></th>
										<th className="px-3 py-3 text-right font-semibold"><SortButton label="Total Spent" active={sortField === 'spent'} descending={sortDescending} onClick={() => sortBy('spent')} /></th>
										<th className="px-3 py-3 text-center font-semibold"><SortButton label="Last Order" active={sortField === 'lastOrder'} descending={sortDescending} onClick={() => sortBy('lastOrder')} /></th>
										<th className="px-3 py-3 text-center font-semibold">Status</th>
										<th className="px-3 py-3 text-right font-semibold">Action</th>
									</tr>
								</thead>
								<tbody>
									{visibleCustomers.map((customer) => <CustomerRow key={customer.id} customer={customer} onView={() => setSelectedCustomer(customer)} />)}
									{visibleCustomers.length === 0 && <tr><td colSpan={7} className="px-3 py-10 text-center text-xs text-[#748178]">No customers match these filters.</td></tr>}
								</tbody>
							</table>
						</div>
						<div className="mt-3 flex flex-col gap-2 text-[10px] text-[#748178] sm:flex-row sm:items-center sm:justify-between">
							<p>{filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'}</p>
							<div className="flex items-center gap-2">
								<button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#dfe7e1] px-2.5 disabled:opacity-40"><ArrowLeft size={12} /> Previous</button>
								<span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#e8f5ec] px-2 font-semibold text-[#267748]">{currentPage}</span>
								<button type="button" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#dfe7e1] px-2.5 disabled:opacity-40">Next <ArrowRight size={12} /></button>
							</div>
						</div>
					</section>

					<section>
						<div className="mb-3 flex items-end justify-between gap-2"><div><h2 className="text-sm font-bold text-[#25372c]">Customer Insights</h2><p className="mt-0.5 text-[10px] text-[#7d8b82]">Key purchasing and retention measures</p></div><span className="text-[9px] text-[#829087]">Seller shop lifetime</span></div>
						<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
							{insights.map((insight) => <InsightCard key={insight.label} {...insight} />)}
						</div>
					</section>

					<div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
						<section className="min-w-0 bg-white p-4 sm:p-5">
							<div className="flex items-center justify-between"><div><h2 className="text-sm font-bold text-[#25372c]">Top Customers</h2><p className="mt-0.5 text-[10px] text-[#7d8b82]">Highest customer lifetime value</p></div><ChartNoAxesCombined size={16} className="text-[#40805a]" /></div>
							<div className="mt-3 overflow-x-auto">
								<table className="w-full min-w-[470px] text-left text-[10px]">
									<thead className="text-[#849188]"><tr><th className="py-2 font-medium">Rank</th><th className="py-2 font-medium">Customer</th><th className="py-2 text-center font-medium">Orders</th><th className="py-2 text-right font-medium">Total Spent</th><th className="py-2 text-right font-medium">Last Order</th></tr></thead>
									<tbody>{topCustomers.map((customer, index) => <tr key={customer.id} className="border-t border-[#edf1ee]"><td className="py-2.5 font-semibold text-[#6e7f73]">#{index + 1}</td><td className="py-2.5 font-semibold text-[#34473b]">{customer.name}</td><td className="py-2.5 text-center text-[#586a5e]">{customer.orders}</td><td className="py-2.5 text-right font-medium text-[#34473b]">{money(customer.spent)}</td><td className="py-2.5 text-right text-[#718076]">{shortDate(customer.lastOrder)}</td></tr>)}
										{topCustomers.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-[#748178]">Customer purchase history will appear here.</td></tr>}
									</tbody>
								</table>
							</div>
						</section>
						<section className="min-w-0 bg-white p-4 sm:p-5">
							<div><h2 className="text-sm font-bold text-[#25372c]">Customer Status</h2><p className="mt-0.5 text-[10px] text-[#7d8b82]">Customer type breakdown</p></div>
							<div className="mt-3 flex flex-col items-center gap-4 sm:flex-row">
								<div className="relative h-40 w-40 shrink-0">
									<ResponsiveContainer width="100%" height="100%">
										<PieChart><Pie data={statusBreakdown.filter((item) => item.value > 0)} dataKey="value" nameKey="name" innerRadius={48} outerRadius={70} paddingAngle={2} stroke="white" strokeWidth={2}>{statusBreakdown.filter((item) => item.value > 0).map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={(value) => [value, 'Customers']} contentStyle={{ borderColor: '#dce7df', borderRadius: 8, fontSize: 11 }} /></PieChart>
									</ResponsiveContainer>
									<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-lg font-bold text-[#1d3426]">{customerSummary.total}</strong><span className="text-[9px] text-[#819087]">Total Customers</span></div>
								</div>
								<div className="w-full flex-1 space-y-3">
									{statusBreakdown.map((item) => <div key={item.name} className="flex items-center justify-between gap-2 text-[10px] text-[#586a5e]"><span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span><strong>{item.value} ({customerSummary.total ? Math.round((item.value / customerSummary.total) * 100) : 0}%)</strong></div>)}
								</div>
							</div>
						</section>
					</div>
				</div>
			</PortalLayout>
			{selectedCustomer && <CustomerDetails customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />}
		</>
	);
}

function StatCard({ stat, icon: Icon }: { stat: CustomerStat; icon: typeof Users }) {
	const sparkline = stat.label === 'Total Customers' ? '0,24 12,20 22,22 33,13 44,16 55,8 66,10 78,2' : stat.label === 'New Customers' ? '0,23 12,18 22,20 34,12 45,14 56,7 67,8 78,1' : '0,22 12,19 23,16 34,17 45,9 56,11 67,5 78,1';
	return (
		<div className="relative overflow-hidden bg-white p-4 sm:p-5">
			<div className="flex items-start justify-between gap-2">
				<span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f5ec] text-[#28784a]"><Icon size={18} /></span>
				<div className="min-w-0"><p className="text-[10px] font-medium text-[#748178]">{stat.label}</p><strong className="mt-1 block text-2xl font-bold text-[#1d3426]">{Number(stat.value).toLocaleString()}</strong><p className="mt-1 text-[9px] font-medium text-[#278653]">↑ {stat.detail}</p></div>
				<svg viewBox="0 0 80 26" className="mt-auto h-8 w-20 self-end" role="img" aria-label={`${stat.label} trend increasing`}><polyline points={sparkline} fill="none" stroke="#38a567" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
			</div>
		</div>
	);
}

function SortButton({ label, active, descending, onClick }: { label: string; active: boolean; descending: boolean; onClick: () => void }) {
	return <button type="button" onClick={onClick} className="inline-flex items-center gap-1 hover:text-[#267748]">{label}{active && <ArrowDownUp size={11} className={descending ? '' : 'rotate-180'} />}</button>;
}

function CustomerRow({ customer, onView }: { customer: Customer; onView: () => void }) {
	return (
		<tr className="border-t border-[#edf1ee] text-[#526157]">
			<td className="px-3 py-3"><div className="flex items-center gap-2.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e8f5ec] text-[#28784a]">{customer.avatar ? <img src={`/storage/${customer.avatar}`} alt="" className="h-full w-full object-cover" /> : <UserRound size={16} />}</span><span><strong className="block font-semibold text-[#34473b]">{customer.name}</strong><span className="mt-0.5 block text-[9px] text-[#89948d]">Buyer</span></span></div></td>
			<td className="px-3 py-3">{customer.email}</td>
			<td className="px-3 py-3 text-center">{customer.orders}</td>
			<td className="px-3 py-3 text-right font-medium text-[#34473b]">{money(customer.spent)}</td>
			<td className="px-3 py-3 text-center">{shortDate(customer.lastOrder)}</td>
			<td className="px-3 py-3 text-center"><StatusBadge status={customer.status} /></td>
			<td className="px-3 py-3 text-right"><button type="button" onClick={onView} className="inline-flex h-8 items-center gap-1 rounded-md border border-[#dcebe0] px-3 text-[10px] font-semibold text-[#267748] hover:bg-[#f5faf6]">View <ArrowUpRight size={12} /></button></td>
		</tr>
	);
}

function StatusBadge({ status }: { status: CustomerStatus }) {
	const tone = status === 'Returning' ? 'bg-[#ddf4e5] text-[#267748]' : status === 'Inactive' ? 'bg-[#f0f3f1] text-[#718076]' : 'bg-[#e8f5ec] text-[#347b51]';
	return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-semibold ${tone}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{status}</span>;
}

function InsightCard({ label, value, trend, icon: Icon, values }: { label: string; value: string; trend: string; icon: typeof Users; values: number[] }) {
	const points = values.map((point, index) => `${(index / (values.length - 1)) * 72},${22 - point}`).join(' ');
	return (
		<div className="bg-white p-4">
			<div className="flex items-start justify-between gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f5ec] text-[#28784a]"><Icon size={15} /></span><span className="rounded-full bg-[#edf9f0] px-2 py-1 text-[9px] font-semibold text-[#278653]">↑ {trend}</span></div>
			<p className="mt-3 text-[10px] text-[#748178]">{label}</p>
			<div className="mt-1 flex items-end justify-between gap-2"><strong className="text-lg font-bold text-[#1d3426]">{value}</strong><svg viewBox="0 0 74 24" className="h-6 w-[74px]" aria-label={`${label} trend`}><polyline points={points} fill="none" stroke="#38a567" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
		</div>
	);
}

function CustomerDetails({ customer, onClose }: { customer: Customer; onClose: () => void }) {
	return (
		<div className="fixed inset-0 z-70 flex items-center justify-center bg-[#122219]/35 p-4" role="dialog" aria-modal="true" aria-labelledby="customer-detail-title">
			<div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#e3e9e5] bg-white shadow-xl">
				<div className="flex items-start justify-between border-b border-[#edf1ee] p-4">
					<div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#e8f5ec] text-[#28784a]">{customer.avatar ? <img src={`/storage/${customer.avatar}`} alt="" className="h-full w-full object-cover" /> : <UserRound size={19} />}</span><div><h2 id="customer-detail-title" className="text-base font-bold text-[#26382d]">{customer.name}</h2><p className="mt-0.5 text-[10px] text-[#7c8981]">Buyer · Customer details</p></div></div>
					<button type="button" onClick={onClose} aria-label="Close customer details" className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8e4] text-[#68766d]"><X size={15} /></button>
				</div>
				<div className="space-y-5 p-4">
					<div className="grid gap-2 sm:grid-cols-2">
						<Detail label="Email" value={customer.email} icon={<Mail size={13} />} />
						<Detail label="Customer status" value={customer.status} />
						<Detail label="Total orders" value={String(customer.orders)} />
						<Detail label="Total spent" value={money(customer.spent)} />
						<Detail label="Last order" value={shortDate(customer.lastOrder)} />
					</div>
					<section><div className="mb-2 flex items-center justify-between"><h3 className="text-xs font-bold text-[#34473b]">Order history</h3><span className="text-[9px] text-[#89948d]">{customer.orderHistory.length} orders</span></div>
						<div className="overflow-x-auto rounded-lg border border-[#edf1ee]"><table className="w-full min-w-[510px] text-left text-[10px]"><thead className="bg-[#f7faf8] text-[#748178]"><tr><th className="px-3 py-2.5 font-medium">Order ID</th><th className="px-3 py-2.5 font-medium">Date</th><th className="px-3 py-2.5 text-center font-medium">Items</th><th className="px-3 py-2.5 text-right font-medium">Amount</th><th className="px-3 py-2.5 text-right font-medium">Status</th></tr></thead>
							<tbody>{customer.orderHistory.map((order) => <tr key={`${customer.id}-${order.orderId}-${order.createdAt}`} className="border-t border-[#edf1ee] text-[#526157]"><td className="px-3 py-2.5 font-medium text-[#34473b]">#{order.orderId}</td><td className="px-3 py-2.5">{shortDate(order.date)}</td><td className="px-3 py-2.5 text-center">{order.items}</td><td className="px-3 py-2.5 text-right">{money(order.amount)}</td><td className="px-3 py-2.5 text-right">{order.status}</td></tr>)}
								{customer.orderHistory.length === 0 && <tr><td colSpan={5} className="px-3 py-7 text-center text-[#748178]">Order history is not available for this customer.</td></tr>}</tbody>
						</table></div>
					</section>
					<section><h3 className="mb-2 text-xs font-bold text-[#34473b]">Recent activity</h3>
						{customer.orderHistory.length ? <ul className="space-y-2">{customer.orderHistory.slice(0, 4).map((order) => <li key={`activity-${order.orderId}-${order.createdAt}`} className="flex items-center gap-2 rounded-lg bg-[#f7faf8] px-3 py-2 text-[10px] text-[#526157]"><ShoppingBag size={13} className="text-[#278653]" /><span className="flex-1">Placed order #{order.orderId} · {order.items} {order.items === 1 ? 'item' : 'items'}</span><time className="text-[#89948d]">{shortDate(order.date)}</time></li>)}</ul> : <p className="rounded-lg bg-[#f7faf8] px-3 py-3 text-[10px] text-[#748178]">No recent activity is available.</p>}
					</section>
					<div className="flex justify-end border-t border-[#edf1ee] pt-3"><button type="button" onClick={onClose} className="rounded-lg border border-[#dce5df] px-4 py-2 text-xs font-semibold text-[#526157] hover:bg-[#f7faf8]">Close</button></div>
				</div>
			</div>
		</div>
	);
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
	return <div className="min-w-0 rounded-lg border border-[#edf1ee] p-2.5"><p className="flex items-center gap-1.5 text-[9px] font-semibold uppercase text-[#89948d]">{icon}{label}</p><p className="mt-1 break-words text-[11px] text-[#36483d]">{value}</p></div>;
}
