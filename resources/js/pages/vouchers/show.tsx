import { PortalLayout } from '@/components/portal-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, BadgePercent, CalendarClock, CircleDollarSign, UsersRound } from 'lucide-react';

type Voucher = {
    id: number;
    name: string;
    code: string;
    type: string;
    discount_value: string;
    minimum_spend: string;
    maximum_discount: string | null;
    starts_at: string | null;
    expires_at: string | null;
    total_usage_limit: number | null;
    is_active: boolean;
    description: string | null;
    terms: string | null;
    products: { id: number; name: string; base_price: string; category?: { name: string } | null }[];
    categories: { id: number; name: string }[];
    sellers: { id: number; name: string }[];
    variants: { id: number; name: string; sku: string; product_id: number }[];
    claims: {
        id: number;
        status: string;
        claimed_at: string | null;
        user?: { name: string; email: string } | null;
        order?: { order_number: string } | null;
    }[];
    usages: {
        id: number;
        status: string;
        code_snapshot: string;
        discount_amount: string;
        used_at: string;
        user?: { name: string; email: string } | null;
        order?: { order_number: string } | null;
    }[];
};
type Props = {
    voucher: Voucher;
    isAdmin: boolean;
    stats: { claims: number; used: number; remaining: number | null; totalDiscount: number; usageRate: number };
    auth: { user: { name: string } };
};

function money(value: string | number) {
    return `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
}

export default function VoucherDetails() {
    const { voucher, isAdmin, stats } = usePage<Props>().props;
    const base = isAdmin ? '/admin/vouchers' : '/seller/vouchers';
    const used = voucher.usages.filter((usage) => usage.status === 'used');

    return (
        <>
            <Head title={`Voucher ${voucher.code}`} />
            <PortalLayout role={base.startsWith('/admin') ? 'admin' : 'seller'} title="Voucher details" eyebrow="Usage analytics">
                <Link href={base} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#1f7a42]">
                    <ArrowLeft size={17} /> Back to vouchers
                </Link>
                <header className="mb-6 flex flex-wrap items-center gap-4 rounded-2xl border border-[#dcebe0] bg-white p-5 sm:p-7">
                    <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#e6f7eb] text-[#1f7a42]">
                        <BadgePercent size={32} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <span
                            className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${voucher.is_active ? 'bg-[#e6f7eb] text-[#1f7a42]' : 'bg-[#edf0ed] text-[#66756b]'}`}
                        >
                            {voucher.is_active ? 'Active' : 'Disabled'}
                        </span>
                        <h1 className="font-display mt-2 text-2xl font-bold text-[#163b24]">{voucher.name}</h1>
                        <p className="text-sm text-[#647568]">
                            {voucher.code} · {voucher.type} · Minimum spend {money(voucher.minimum_spend)}
                        </p>
                    </div>
                    <p className="text-2xl font-extrabold text-[#1f7a42]">
                        {voucher.type === 'percentage'
                            ? `${voucher.discount_value}% OFF`
                            : voucher.type === 'free_shipping'
                              ? 'Free shipping'
                              : `${money(voucher.discount_value)} OFF`}
                    </p>
                </header>
                <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {(
                        [
                            ['Total claims', stats.claims, UsersRound],
                            ['Total used', stats.used, BadgePercent],
                            ['Remaining', stats.remaining ?? 'Unlimited', CalendarClock],
                            ['Discount given', money(stats.totalDiscount), CircleDollarSign],
                            ['Usage rate', `${stats.usageRate}%`, BadgePercent],
                        ] as [string, string | number, typeof BadgePercent][]
                    ).map(([label, value, Icon]) => (
                        <article key={label} className="rounded-xl border border-[#dcebe0] bg-white p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-[#647568]">{label}</span>
                                <Icon size={17} className="text-[#1f7a42]" />
                            </div>
                            <p className="mt-2 text-xl font-bold text-[#163b24]">{value}</p>
                        </article>
                    ))}
                </section>
                <div className="grid gap-5 xl:grid-cols-2">
                    <section className="rounded-xl border border-[#dcebe0] bg-white p-5">
                        <h2 className="font-display text-lg font-bold text-[#163b24]">Voucher information</h2>
                        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-xs text-[#819086]">Starts</dt>
                                <dd>{voucher.starts_at ? new Date(voucher.starts_at).toLocaleString() : 'Immediately'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-[#819086]">Expires</dt>
                                <dd>{voucher.expires_at ? new Date(voucher.expires_at).toLocaleString() : 'No expiration'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-[#819086]">Usage limit</dt>
                                <dd>{voucher.total_usage_limit ?? 'Unlimited'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-[#819086]">Maximum discount</dt>
                                <dd>{voucher.maximum_discount ? money(voucher.maximum_discount) : 'None'}</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-xs text-[#819086]">Applies to</dt>
                                <dd>
                                    {voucher.products.length
                                        ? voucher.products.map((product) => product.name).join(', ')
                                        : voucher.categories.length
                                          ? voucher.categories.map((category) => category.name).join(', ')
                                          : voucher.sellers.length
                                            ? voucher.sellers.map((seller) => seller.name).join(', ')
                                            : voucher.variants.length
                                              ? `${voucher.variants.length} selected variants`
                                              : 'All eligible products'}
                                </dd>
                            </div>
                        </dl>
                        {voucher.description && <p className="mt-4 text-sm text-[#52665a]">{voucher.description}</p>}
                        {voucher.terms && <p className="mt-3 border-t border-[#edf2ed] pt-3 text-xs text-[#647568]">{voucher.terms}</p>}
                    </section>
                    <section className="rounded-xl border border-[#dcebe0] bg-white p-5">
                        <h2 className="font-display text-lg font-bold text-[#163b24]">Claimed customers</h2>
                        <div className="mt-3 max-h-80 divide-y overflow-y-auto">
                            {voucher.claims.length ? (
                                voucher.claims.map((claim) => (
                                    <div key={claim.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold">{claim.user?.name ?? 'Deleted customer'}</p>
                                            <p className="truncate text-xs text-[#647568]">
                                                {claim.user?.email ?? 'No email'} ·{' '}
                                                {claim.claimed_at ? new Date(claim.claimed_at).toLocaleDateString() : 'Date unavailable'}
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-[#f1f6f1] px-2 py-1 text-[10px] font-bold uppercase">{claim.status}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="py-8 text-center text-sm text-[#819086]">No claims yet.</p>
                            )}
                        </div>
                    </section>
                    <section className="rounded-xl border border-[#dcebe0] bg-white p-5 xl:col-span-2">
                        <h2 className="font-display text-lg font-bold text-[#163b24]">Orders using this voucher</h2>
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full min-w-120 text-left text-sm">
                                <thead className="text-xs text-[#819086]">
                                    <tr>
                                        <th className="py-2">Order</th>
                                        <th>Customer</th>
                                        <th>Used</th>
                                        <th>Discount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {used.length ? (
                                        used.map((usage) => (
                                            <tr key={usage.id}>
                                                <td className="py-3 font-semibold">{usage.order?.order_number ?? 'Order unavailable'}</td>
                                                <td>{usage.user?.name ?? 'Deleted customer'}</td>
                                                <td>{new Date(usage.used_at).toLocaleString()}</td>
                                                <td>{money(usage.discount_amount)}</td>
                                                <td className="uppercase">{usage.status}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-[#819086]">
                                                No orders have used this voucher.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </PortalLayout>
        </>
    );
}
