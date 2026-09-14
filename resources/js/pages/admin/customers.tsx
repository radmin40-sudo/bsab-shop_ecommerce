import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight, Mail, Search, ShoppingBag, UserRound, UsersRound } from 'lucide-react';
import { useMemo, useState } from 'react';

import { PortalLayout, StatCard } from '@/components/portal-layout';

type Customer = {
    id: number;
    name: string;
    email: string;
    status: string | null;
    created_at: string;
    orders_count: number;
};

export default function AdminCustomers({ customers }: { customers: Customer[] }) {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const filteredCustomers = useMemo(() => {
        const query = search.trim().toLowerCase();
        return customers.filter((customer) => {
            const matchesSearch = !query || customer.name.toLowerCase().includes(query) || customer.email.toLowerCase().includes(query);
            const matchesStatus = status === 'all' || (customer.status ?? 'active') === status;
            return matchesSearch && matchesStatus;
        });
    }, [customers, search, status]);
    const activeCustomers = customers.filter((customer) => (customer.status ?? 'active') === 'active').length;
    const customersWithOrders = customers.filter((customer) => customer.orders_count > 0).length;

    return (
        <>
            <Head title="Customer management" />
            <PortalLayout role="admin" title="Customer management" eyebrow="People and activity">
                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#b06b38] uppercase">Customer directory</p>
                        <h1 className="font-display mt-2 text-3xl font-bold tracking-tight text-[#173b27] sm:text-4xl">Know your customers.</h1>
                        <p className="mt-2 max-w-2xl text-sm text-[#6a7c70]">
                            Monitor customer activity, account health, and shopping engagement across the marketplace.
                        </p>
                    </div>
                    <Link
                        href="/admin/users"
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-[10px] border border-[#cbd8cc] bg-white px-4 text-sm font-semibold text-[#294231] transition hover:border-[#287e4a] hover:text-[#287e4a]"
                    >
                        Manage all users <ArrowUpRight size={15} />
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Total customers" value={String(customers.length)} detail="Registered shoppers" tone="green" />
                    <StatCard label="Active accounts" value={String(activeCustomers)} detail="Currently enabled" />
                    <StatCard label="Ordered before" value={String(customersWithOrders)} detail="Customers with orders" tone="warm" />
                </div>

                <section className="mt-6 overflow-hidden border bg-white">
                    <div className="border-b border-[#e1ebe0] p-5 sm:p-6">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                            <div>
                                <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-[#b06b38] uppercase">
                                    <UsersRound size={15} /> Directory
                                </p>
                                <h2 className="font-display mt-2 text-xl font-bold text-[#173b27]">All customers</h2>
                                <p className="mt-1 text-sm text-[#7a897d]">
                                    Showing {filteredCustomers.length} of {customers.length} customer accounts
                                </p>
                            </div>
                            <div className="flex w-full gap-2 lg:w-auto">
                                <div className="relative min-w-0 flex-1 lg:w-72">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-[#9aa69b]" />
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search name or email"
                                        className="w-full border border-[#ccd8ce] bg-[#fbfdfb] py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#287e4a]"
                                    />
                                </div>
                                <select
                                    value={status}
                                    onChange={(event) => setStatus(event.target.value)}
                                    className="border border-[#ccd8ce] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#287e4a]"
                                >
                                    <option value="all">All statuses</option>
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead className="bg-[#f1f6f0] text-[11px] tracking-[0.12em] text-[#718075] uppercase">
                                <tr>
                                    <th className="px-5 py-3 font-semibold">Customer</th>
                                    <th className="px-5 py-3 font-semibold">Account status</th>
                                    <th className="px-5 py-3 font-semibold">Orders</th>
                                    <th className="px-5 py-3 font-semibold">Joined</th>
                                    <th className="px-5 py-3 text-right font-semibold">Profile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf1eb]">
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer.id} className="transition hover:bg-[#fbfdfb]">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e3f1e3] text-[#287e4a]">
                                                    <UserRound size={17} />
                                                </span>
                                                <div>
                                                    <p className="font-semibold text-[#294231]">{customer.name}</p>
                                                    <p className="mt-0.5 flex items-center gap-1 text-xs text-[#829087]">
                                                        <Mail size={12} /> {customer.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${(customer.status ?? 'active') === 'active' ? 'bg-[#e3f1e3] text-[#287e4a]' : 'bg-[#fbe8e5] text-[#b34c40]'}`}
                                            >
                                                {customer.status ?? 'active'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="flex items-center gap-2 text-[#53665a]">
                                                <ShoppingBag size={15} className="text-[#a86618]" /> {customer.orders_count}{' '}
                                                {customer.orders_count === 1 ? 'order' : 'orders'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-[#718075]">{new Date(customer.created_at).toLocaleDateString()}</td>
                                        <td className="px-5 py-4 text-right">
                                            <Link
                                                href={`/admin/users?search=${encodeURIComponent(customer.email)}`}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-[#287e4a] hover:underline"
                                            >
                                                View account <ArrowUpRight size={13} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCustomers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-16 text-center text-sm text-[#718075]">
                                            No customers match the current filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </PortalLayout>
        </>
    );
}
