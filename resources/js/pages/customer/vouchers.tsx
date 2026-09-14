import { PortalLayout } from '@/components/portal-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Gift, Sparkles, Ticket } from 'lucide-react';

type Voucher = {
    id: number;
    code: string;
    type: string;
    value: string;
    min_spend: string;
    expires_at?: string | null;
    shop?: { name: string } | null;
};

export default function CustomerVouchers({ vouchers = [] }: { vouchers?: Voucher[] }) {
    return (
        <>
            <Head title="Vouchers" />
            <PortalLayout role="customer" title="Vouchers" eyebrow="Promotions and rewards">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-bold tracking-[0.18em] text-[#2c9350] uppercase">Offers</p>
                        <h1 className="font-display mt-2 text-3xl font-bold text-[#163b24]">Vouchers</h1>
                        <p className="mt-2 max-w-2xl text-sm text-[#647568]">Save on your next order with active discounts and marketplace promos.</p>
                    </div>
                    <Link
                        href={route('customer.settings')}
                        className="inline-flex items-center gap-2 rounded-full border border-[#def0e2] bg-white px-4 py-2.5 text-sm font-semibold text-[#1b4332] transition hover:bg-[#f5fcf7]"
                    >
                        Back to settings
                    </Link>
                </div>

                {vouchers.length ? (
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {vouchers.map((voucher) => (
                            <article
                                key={voucher.id}
                                className="rounded-3xl border border-[#def0e2] bg-white p-5 shadow-[0_10px_25px_rgba(22,59,36,0.04)]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf7ee] text-[#1f7a42]">
                                        <Ticket size={20} />
                                    </div>
                                    <span className="rounded-full bg-[#e6f7eb] px-2.5 py-1 text-xs font-bold text-[#2c7a3b]">
                                        {voucher.type === 'percent' ? `${voucher.value}% off` : `₱${voucher.value} off`}
                                    </span>
                                </div>
                                <h2 className="font-display mt-4 text-2xl font-bold text-[#163b24]">{voucher.code}</h2>
                                <p className="mt-2 text-sm text-[#647568]">{voucher.shop?.name ?? 'Marketplace offer'}</p>
                                <div className="mt-4 space-y-1 text-xs text-[#6a7c70]">
                                    <p>Min. spend: ₱{Number(voucher.min_spend).toLocaleString()}</p>
                                    {voucher.expires_at && <p>Expires: {new Date(voucher.expires_at).toLocaleDateString()}</p>}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigator.clipboard?.writeText(voucher.code)}
                                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1b1a20] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#2c7a3b]"
                                >
                                    Copy code <Sparkles size={14} />
                                </button>
                            </article>
                        ))}
                    </div>
                ) : (
                    <section className="rounded-3xl border border-[#def0e2] bg-white p-12 text-center shadow-[0_10px_25px_rgba(22,59,36,0.04)]">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf7ee] text-[#1f7a42]">
                            <Gift size={28} />
                        </div>
                        <h2 className="font-display mt-5 text-2xl font-bold text-[#163b24]">No vouchers available</h2>
                        <p className="mt-2 text-sm text-[#647568]">New promos will appear here when they are live.</p>
                        <Link
                            href={route('marketplace')}
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#1f7a42] px-5 py-3 text-sm font-bold text-white"
                        >
                            Explore deals <ArrowRight size={15} />
                        </Link>
                    </section>
                )}
            </PortalLayout>
        </>
    );
}
