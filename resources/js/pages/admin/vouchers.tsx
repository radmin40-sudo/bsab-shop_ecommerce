import { PortalLayout, StatCard } from '@/components/portal-layout';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

type Voucher = {
    id: number;
    code: string;
    type: string;
    value: string;
    shop?: { id: number; name: string } | null;
    expires_at?: string | null;
    usage_limit?: number | null;
    times_used: number;
};
type Shop = { id: number; name: string };
type Form = {
    code: string;
    type: string;
    value: string;
    shop_id: string;
    min_spend: string;
    max_discount: string;
    expires_at: string;
    usage_limit: string;
};
const blank: Form = { code: '', type: 'percent', value: '', shop_id: '', min_spend: '0', max_discount: '', expires_at: '', usage_limit: '' };
export default function Vouchers({ vouchers, shops }: { vouchers: Voucher[]; shops: Shop[] }) {
    const [editing, setEditing] = useState<Voucher | null>(null);
    const [open, setOpen] = useState(false);
    const form = useForm<Form>(blank);
    const show = (voucher?: Voucher) => {
        setEditing(voucher ?? null);
        setOpen(true);
        form.setData(
            voucher
                ? {
                      ...blank,
                      code: voucher.code,
                      type: voucher.type,
                      value: voucher.value,
                      shop_id: String(voucher.shop?.id ?? ''),
                      usage_limit: String(voucher.usage_limit ?? ''),
                  }
                : blank,
        );
        form.clearErrors();
    };
    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        };
        editing ? form.patch(route('admin.vouchers.update', editing.id), options) : form.post(route('admin.vouchers.store'), options);
    };
    return (
        <>
            <Head title="Vouchers" />
            <PortalLayout role="admin" title="Vouchers" eyebrow="Promotions">
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Active codes" value={String(vouchers.length)} detail="Platform and shop offers" />
                    <StatCard
                        label="Redemptions"
                        value={String(vouchers.reduce((sum, item) => sum + item.times_used, 0))}
                        detail="Total usage"
                        tone="green"
                    />
                    <StatCard
                        label="Platform offers"
                        value={String(vouchers.filter((item) => !item.shop).length)}
                        detail="Available across shops"
                        tone="warm"
                    />
                </div>
                <section className="mt-8 border border-[#dfe3dc] bg-white">
                    <div className="flex items-center justify-between border-b p-5">
                        <div>
                            <h2 className="font-serif text-2xl">Promotion codes</h2>
                            <p className="mt-1 text-sm text-[#657066]">Create and retire platform-wide discounts.</p>
                        </div>
                        <button onClick={() => show()} className="flex items-center gap-2 bg-[#1e2420] px-4 py-2.5 text-sm font-semibold text-white">
                            <Plus size={16} /> Add voucher
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-sm">
                            <thead className="bg-[#eef0e9] text-xs text-[#657066] uppercase">
                                <tr>
                                    <th className="px-5 py-3">Code</th>
                                    <th className="px-5 py-3">Offer</th>
                                    <th className="px-5 py-3">Scope</th>
                                    <th className="px-5 py-3">Usage</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf0eb]">
                                {vouchers.map((voucher) => (
                                    <tr key={voucher.id}>
                                        <td className="px-5 py-4 font-semibold">{voucher.code}</td>
                                        <td className="px-5 py-4">
                                            {voucher.value}
                                            {voucher.type === 'percent' ? '%' : ''} {voucher.type === 'fixed' ? 'off' : 'discount'}
                                        </td>
                                        <td className="px-5 py-4 text-[#657066]">{voucher.shop?.name ?? 'All shops'}</td>
                                        <td className="px-5 py-4">
                                            {voucher.times_used}
                                            {voucher.usage_limit ? ` / ${voucher.usage_limit}` : ''}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => show(voucher)}
                                                    className="flex items-center gap-1 border px-2.5 py-1.5 text-xs font-semibold"
                                                >
                                                    <Pencil size={13} /> Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        window.confirm(`Delete ${voucher.code}?`) &&
                                                        form.delete(route('admin.vouchers.destroy', voucher.id), { preserveScroll: true })
                                                    }
                                                    className="flex items-center gap-1 border border-[#eccac3] px-2.5 py-1.5 text-xs font-semibold text-[#a23b2d]"
                                                >
                                                    <Trash2 size={13} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e2420]/35 p-5">
                        <form onSubmit={submit} className="grid w-full max-w-lg gap-4 border bg-white p-6">
                            <h2 className="font-serif text-2xl">{editing ? 'Edit voucher' : 'New voucher'}</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="grid gap-2 text-sm font-semibold">
                                    Code
                                    <input
                                        required
                                        value={form.data.code}
                                        onChange={(event) => form.setData('code', event.target.value.toUpperCase())}
                                        className="border px-3 py-2.5 font-normal"
                                    />
                                </label>
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
                            </div>
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
                            {shops.length > 0 && (
                                <label className="grid gap-2 text-sm font-semibold">
                                    Shop scope
                                    <select
                                        value={form.data.shop_id}
                                        onChange={(event) => form.setData('shop_id', event.target.value)}
                                        className="border px-3 py-2.5 font-normal"
                                    >
                                        <option value="">All shops</option>
                                        {shops.map((shop) => (
                                            <option key={shop.id} value={shop.id}>
                                                {shop.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            )}
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
