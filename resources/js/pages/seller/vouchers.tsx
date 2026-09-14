import { PortalLayout, StatCard } from '@/components/portal-layout';
import { Head, useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type Voucher = { id: number; code: string; type: string; value: string; usage_limit?: number | null; times_used: number };
type Form = { code: string; type: string; value: string; min_spend: string; max_discount: string; expires_at: string; usage_limit: string };
const blank: Form = { code: '', type: 'percent', value: '', min_spend: '0', max_discount: '', expires_at: '', usage_limit: '' };
export default function SellerVouchers({ vouchers }: { vouchers: Voucher[] }) {
    const [open, setOpen] = useState(false);
    const form = useForm<Form>(blank);
    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        form.post(route('seller.vouchers.store'), {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    };
    return (
        <>
            <Head title="Shop vouchers" />
            <PortalLayout role="seller" title="Shop vouchers" eyebrow="Promotions">
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Your vouchers" value={String(vouchers.length)} detail="Shop-scoped offers" />
                    <StatCard
                        label="Redemptions"
                        value={String(vouchers.reduce((sum, item) => sum + item.times_used, 0))}
                        detail="Total usage"
                        tone="green"
                    />
                    <StatCard label="Active codes" value={String(vouchers.length)} detail="Available to customers" tone="warm" />
                </div>
                <section className="mt-8 border border-[#dfe3dc] bg-white">
                    <div className="flex items-center justify-between border-b p-5">
                        <div>
                            <h2 className="font-serif text-2xl">Your promotion codes</h2>
                            <p className="mt-1 text-sm text-[#657066]">These offers apply only to products from your shop.</p>
                        </div>
                        <button
                            onClick={() => setOpen(true)}
                            className="flex items-center gap-2 bg-[#1e2420] px-4 py-2.5 text-sm font-semibold text-white"
                        >
                            <Plus size={16} /> Add voucher
                        </button>
                    </div>
                    <div className="divide-y">
                        {vouchers.map((voucher) => (
                            <div key={voucher.id} className="flex items-center justify-between p-5">
                                <div>
                                    <p className="font-semibold">{voucher.code}</p>
                                    <p className="mt-1 text-sm text-[#657066]">
                                        {voucher.value}
                                        {voucher.type === 'percent' ? '%' : ''} {voucher.type === 'fixed' ? 'off' : 'discount'} · {voucher.times_used}
                                        {voucher.usage_limit ? ` / ${voucher.usage_limit}` : ''} uses
                                    </p>
                                </div>
                                <button
                                    onClick={() =>
                                        window.confirm(`Delete ${voucher.code}?`) &&
                                        form.delete(route('seller.vouchers.destroy', voucher.id), { preserveScroll: true })
                                    }
                                    className="flex items-center gap-1 border border-[#eccac3] px-2.5 py-1.5 text-xs font-semibold text-[#a23b2d]"
                                >
                                    <Trash2 size={13} /> Delete
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e2420]/35 p-5">
                        <form onSubmit={submit} className="grid w-full max-w-lg gap-4 border bg-white p-6">
                            <h2 className="font-serif text-2xl">New shop voucher</h2>
                            <label className="grid gap-2 text-sm font-semibold">
                                Code
                                <input
                                    required
                                    value={form.data.code}
                                    onChange={(event) => form.setData('code', event.target.value.toUpperCase())}
                                    className="border px-3 py-2.5 font-normal"
                                />
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="grid gap-2 text-sm font-semibold">
                                    Type
                                    <select
                                        value={form.data.type}
                                        onChange={(event) => form.setData('type', event.target.value)}
                                        className="border px-3 py-2.5 font-normal"
                                    >
                                        <option value="percent">Percent</option>
                                        <option value="fixed">Fixed amount</option>
                                    </select>
                                </label>
                                <label className="grid gap-2 text-sm font-semibold">
                                    Value
                                    <input
                                        required
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={form.data.value}
                                        onChange={(event) => form.setData('value', event.target.value)}
                                        className="border px-3 py-2.5 font-normal"
                                    />
                                </label>
                            </div>
                            <label className="grid gap-2 text-sm font-semibold">
                                Usage limit
                                <input
                                    type="number"
                                    min="1"
                                    value={form.data.usage_limit}
                                    onChange={(event) => form.setData('usage_limit', event.target.value)}
                                    className="border px-3 py-2.5 font-normal"
                                />
                            </label>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setOpen(false)} className="border px-4 py-2 text-sm">
                                    Cancel
                                </button>
                                <button disabled={form.processing} className="bg-[#1e2420] px-4 py-2 text-sm font-semibold text-white">
                                    Save voucher
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </PortalLayout>
        </>
    );
}
