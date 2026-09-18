import { PortalLayout } from '@/components/portal-layout';
import { claimVoucher, CustomerVoucher, getCustomerVouchers } from '@/lib/api';
import { Head, Link } from '@inertiajs/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Check, Gift, LoaderCircle, Ticket } from 'lucide-react';
import { useState } from 'react';

function money(value: string | number) {
    return `₱${Number(value).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
}

function VoucherCard({ voucher, onClaim, claiming }: { voucher: CustomerVoucher; onClaim: (id: number) => void; claiming: number | null }) {
    const isClaiming = claiming === voucher.id;
    const disabled = voucher.status !== 'available' || isClaiming;
    const label = isClaiming ? 'Claiming...' : voucher.status === 'claimed' ? 'Claimed' : voucher.status === 'fully_claimed' ? 'Fully Claimed' : voucher.status === 'expired' ? 'Expired' : voucher.status === 'inactive' ? 'Unavailable' : voucher.status === 'not_started' ? 'Not available yet' : 'Claim';
    const tone = voucher.status === 'available' ? 'bg-[#1f7a42] text-white hover:bg-[#163b24]' : 'bg-[#eaf7ee] text-[#6b8273]';

    return (
        <article className="rounded-3xl border border-[#def0e2] bg-white p-5 shadow-[0_10px_25px_rgba(22,59,36,0.04)]">
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf7ee] text-[#1f7a42]"><Ticket size={20} /></div>
                <span className="rounded-full bg-[#e6f7eb] px-2.5 py-1 text-xs font-bold text-[#2c7a3b]">{voucher.type === 'percent' ? `${voucher.value}% OFF` : `${money(voucher.value)} OFF`}</span>
            </div>
            <h2 className="font-display mt-4 text-2xl font-bold text-[#163b24]">{voucher.title}</h2>
            <p className="mt-1 text-sm text-[#647568]">{voucher.shop?.name ?? 'Marketplace offer'}</p>
            <div className="mt-4 space-y-1 text-xs text-[#6a7c70]">
                <p>Min. spend: {money(voucher.min_spend)}</p>
                {voucher.expires_at && <p>Valid until {new Date(voucher.expires_at).toLocaleDateString()}</p>}
                {voucher.status === 'fully_claimed' && <p className="font-bold text-[#a23b2d]">Maximum claims reached</p>}
            </div>
            <button type="button" disabled={disabled} onClick={() => onClaim(voucher.id)} className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${tone} disabled:cursor-not-allowed disabled:opacity-80`}>
                {voucher.status === 'claimed' && !isClaiming ? <Check size={15} /> : isClaiming ? <LoaderCircle size={15} className="animate-spin" /> : null}{label}
            </button>
        </article>
    );
}

export default function CustomerVouchers() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({ queryKey: ['customer-vouchers'], queryFn: getCustomerVouchers });
    const [claiming, setClaiming] = useState<number | null>(null);
    const [notice, setNotice] = useState('');
    const vouchers = data?.vouchers || [];
    const claimed = data?.claimed_vouchers || [];

    async function handleClaim(id: number) {
        setClaiming(id);
        setNotice('');
        try {
            await claimVoucher(id);
            setNotice('Voucher claimed! It has been added to your vouchers.');
        } catch (error: any) {
            const message = error?.response?.data?.message;
            setNotice(message === 'ALREADY_CLAIMED' ? 'Already Claimed' : message || 'Unable to claim voucher. Please try again.');
        } finally {
            await queryClient.invalidateQueries({ queryKey: ['customer-vouchers'] });
            setClaiming(null);
        }
    }

    return <><Head title="Vouchers" /><PortalLayout role="customer" title="Vouchers" eyebrow="Promotions and rewards">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.18em] text-[#2c9350] uppercase">Offers</p><h1 className="font-display mt-2 text-3xl font-bold text-[#163b24]">Vouchers</h1><p className="mt-2 max-w-2xl text-sm text-[#647568]">Claim once, save it to your account, and apply it to an eligible order later.</p></div><Link href={route('customer.settings')} className="inline-flex items-center gap-2 rounded-full border border-[#def0e2] bg-white px-4 py-2.5 text-sm font-semibold text-[#1b4332]">Back to settings</Link></div>
        {notice && <div className="mb-5 rounded-2xl bg-[#eaf7ee] px-4 py-3 text-sm font-semibold text-[#2c7a3b]">{notice}</div>}
        {isLoading ? <div className="rounded-3xl border border-[#def0e2] bg-white p-12 text-center text-[#647568]">Loading vouchers...</div> : <>
            <section><h2 className="mb-4 font-display text-xl font-bold text-[#163b24]">Available Vouchers ({vouchers.filter((v) => v.status !== 'claimed').length})</h2><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{vouchers.filter((v) => v.status !== 'claimed').map((voucher) => <VoucherCard key={voucher.id} voucher={voucher} onClaim={handleClaim} claiming={claiming} />)}</div></section>
            <section className="mt-10"><h2 className="mb-4 font-display text-xl font-bold text-[#163b24]">Your Claimed Vouchers ({claimed.length})</h2>{claimed.length ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{claimed.map((voucher) => <VoucherCard key={voucher.id} voucher={voucher} onClaim={handleClaim} claiming={claiming} />)}</div> : <div className="rounded-3xl border border-dashed border-[#cde8d2] bg-[#f7fcf8] p-8 text-center text-sm text-[#647568]">Claimed vouchers will appear here.</div>}</section>
        </>}
        {!isLoading && !vouchers.length && <section className="rounded-3xl border border-[#def0e2] bg-white p-12 text-center shadow-sm"><Gift size={38} className="mx-auto text-[#1f7a42]" /><h2 className="font-display mt-4 text-2xl font-bold text-[#163b24]">No vouchers available</h2><Link href={route('marketplace')} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1f7a42] px-5 py-3 text-sm font-bold text-white">Explore deals <ArrowRight size={15} /></Link></section>}
    </PortalLayout></>;
}
