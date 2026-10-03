import { PortalLayout } from '@/components/portal-layout';
import { api, prepareSanctum } from '@/lib/api';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { CalendarDays, Check, TicketPercent } from 'lucide-react';
import { useState } from 'react';

type Voucher = {
    id: number;
    name: string;
    code: string;
    type: string;
    discount_value: string;
    minimum_spend: string;
    expires_at: string | null;
    is_active: boolean;
    requires_claim: boolean;
};
type Claim = { id: number; voucher_id: number; status: 'claimed' | 'used' | 'expired' | 'cancelled'; voucher: Voucher };
type Props = { claims: Claim[]; available: Voucher[] };

function currency(value: string | number) {
    return `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 0 })}`;
}

export default function CustomerVouchers() {
    const { claims, available } = usePage<Props>().props;
    const [tab, setTab] = useState<'active' | 'expired'>('active');
    const [claimedIds, setClaimedIds] = useState(claims.filter((claim) => claim.status === 'claimed').map((claim) => claim.voucher_id));
    const [busyId, setBusyId] = useState<number | null>(null);
    const [notice, setNotice] = useState('');
    const claimedVoucherIds = new Set(claimedIds);
    const activeClaims = claims.filter(
        (claim) =>
            claim.status === 'claimed' && claim.voucher?.is_active && (!claim.voucher.expires_at || new Date(claim.voucher.expires_at) > new Date()),
    );
    const expiredClaims = claims.filter(
        (claim) =>
            claim.status === 'expired' ||
            !claim.voucher?.is_active ||
            (claim.voucher?.expires_at && new Date(claim.voucher.expires_at) <= new Date()),
    );
    const unclaimed = available.filter((voucher) => voucher.requires_claim && !claimedVoucherIds.has(voucher.id));
    const activeWithoutClaim = available.filter((voucher) => !voucher.requires_claim);
    const entries =
        tab === 'active'
            ? [...activeClaims.map((claim) => claim.voucher), ...activeWithoutClaim, ...unclaimed]
            : expiredClaims.map((claim) => claim.voucher);

    async function claimVoucher(voucher: Voucher) {
        setBusyId(voucher.id);
        setNotice('');
        try {
            await prepareSanctum();
            await api.post(`/customer/vouchers/${voucher.id}/claim`);
            setClaimedIds((ids) => [...ids, voucher.id]);
            router.reload({ only: ['claims'] });
            setNotice(`${voucher.code} claimed.`);
        } catch (error: any) {
            setNotice(error?.response?.data?.message || 'Unable to claim this voucher.');
        } finally {
            setBusyId(null);
        }
    }

    return (
        <>
            <Head title="My vouchers" />
            <PortalLayout role="customer" title="My vouchers">
                <header className="relative mb-6 overflow-hidden rounded-2xl border border-[#d9eedf] bg-[#e7f8eb] p-6 sm:p-8">
                    <div className="relative z-10 max-w-xl">
                        <p className="text-xs font-bold tracking-[0.16em] text-[#2c7a3b] uppercase">BSAB-SHOP</p>
                        <h1 className="font-display mt-1 text-3xl font-bold text-[#123e2b] sm:text-4xl">My Vouchers</h1>
                        <p className="mt-2 text-sm text-[#3d6650]">Save more, shop better with BSAB-SHOP.</p>
                    </div>
                    <TicketPercent size={100} className="absolute right-7 bottom-3 hidden -rotate-12 text-[#23804a]/20 sm:block" />
                </header>
                <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-[#dcebe0] bg-white p-1.5">
                    {(
                        [
                            ['active', 'Active', activeClaims.length + activeWithoutClaim.length + unclaimed.length],
                            ['expired', 'Expired', expiredClaims.length],
                        ] as const
                    ).map(([key, label, count]) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`flex items-center justify-center gap-2 rounded-lg px-2 py-3 text-xs font-bold sm:text-sm ${tab === key ? 'bg-[#16894f] text-white' : 'text-[#52665a] hover:bg-[#f4fbf5]'}`}
                        >
                            {label}
                            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab === key ? 'bg-white/20' : 'bg-[#e6f7eb]'}`}>{count}</span>
                        </button>
                    ))}
                </div>
                {notice && (
                    <p role="status" className="mb-4 rounded-lg bg-[#edf8ef] px-4 py-3 text-sm font-semibold text-[#1f7a42]">
                        {notice}
                    </p>
                )}
                {entries.length ? (
                    <div className="grid gap-3 xl:grid-cols-2">
                        {entries.map((voucher, index) => {
                            const expired = tab === 'expired';
                            const claimed = claimedVoucherIds.has(voucher.id);
                            return (
                                <article
                                    key={`${voucher.id}-${index}`}
                                    className={`rounded-2xl border bg-white p-4 shadow-[0_4px_16px_rgba(22,59,36,.04)] sm:p-5 ${expired ? 'border-[#e1e5e1] opacity-60' : 'border-[#dcebe0]'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#e8f8ec] text-[#16894f]">
                                            <TicketPercent size={32} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xl font-extrabold text-[#123e2b]">
                                                {voucher.type === 'percentage'
                                                    ? `${voucher.discount_value}% OFF`
                                                    : voucher.type === 'free_shipping'
                                                      ? 'Free Shipping'
                                                      : `${currency(voucher.discount_value)} OFF`}
                                            </p>
                                            <p className="mt-1 text-sm text-[#3d6650]">Min. spend {currency(voucher.minimum_spend)}</p>
                                            <p className="mt-1 flex items-center gap-1 text-xs text-[#647568]">
                                                <CalendarDays size={13} />
                                                {voucher.expires_at
                                                    ? `Valid until ${new Date(voucher.expires_at).toLocaleDateString()}`
                                                    : 'No expiration'}
                                            </p>
                                            <p className="mt-2 inline-block rounded-full border border-dashed border-[#9dc7a7] px-3 py-1 text-xs text-[#315640]">
                                                Code: <b>{voucher.code}</b>
                                            </p>
                                        </div>
                                        {expired ? (
                                            <span className="rounded-full bg-[#edf0ed] px-3 py-2 text-xs font-bold text-[#728077]">Expired</span>
                                        ) : voucher.requires_claim && !claimed ? (
                                            <button
                                                disabled={busyId === voucher.id}
                                                onClick={() => claimVoucher(voucher)}
                                                className="rounded-full bg-[#16894f] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                                            >
                                                {busyId === voucher.id ? 'Claiming…' : 'Claim'}
                                            </button>
                                        ) : claimed ? (
                                            <span className="flex items-center gap-1 text-xs font-bold text-[#16894f]">
                                                <Check size={15} /> Claimed
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={async () => {
                                                    try {
                                                        await prepareSanctum();
                                                        await api.post('/customer/cart/voucher', { code: voucher.code });
                                                        router.visit('/customer/cart');
                                                    } catch (error: any) {
                                                        setNotice(
                                                            error?.response?.data?.message ||
                                                                'Add an eligible item to your cart before using this voucher.',
                                                        );
                                                    }
                                                }}
                                                className="rounded-full bg-[#16894f] px-4 py-2.5 text-sm font-bold text-white"
                                            >
                                                Use Now
                                            </button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-[#cfe1d3] bg-white py-16 text-center">
                        <TicketPercent className="mx-auto text-[#72ae82]" size={34} />
                        <p className="mt-3 font-semibold text-[#315640]">No vouchers in this tab yet.</p>
                        <Link href="/customer/products" className="mt-4 inline-block text-sm font-bold text-[#1f7a42]">
                            Continue shopping
                        </Link>
                    </div>
                )}
            </PortalLayout>
        </>
    );
}
