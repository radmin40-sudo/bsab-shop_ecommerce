import { Head } from '@inertiajs/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ImagePlus, Pencil, Plus, Search, Store, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

import { PortalLayout } from '@/components/portal-layout';
import { api, prepareSanctum } from '@/lib/api';

type Seller = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
    status?: string | null;
    shop?: { name: string; commission_rate?: string } | null;
};

type SellerForm = { name: string; email: string; password: string; phone: string; shop_name: string; commission_rate: string; avatar: File | null };
const emptyForm: SellerForm = { name: '', email: '', password: '', phone: '', shop_name: '', commission_rate: '10', avatar: null };

export default function Sellers() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState<Seller | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<SellerForm>(emptyForm);
    const [error, setError] = useState('');
    const sellersQuery = useQuery({ queryKey: ['admin-sellers'], queryFn: async () => (await api.get('/admin/sellers')).data });
    const sellers: Seller[] = sellersQuery.data?.data ?? [];
    const saveSeller = useMutation({
        mutationFn: async () => {
            await prepareSanctum();
            const payload = new FormData();
            payload.append('name', form.name);
            payload.append('phone', form.phone);
            payload.append('shop_name', form.shop_name);
            if (!editing) {
                payload.append('email', form.email);
                payload.append('password', form.password);
                payload.append('commission_rate', form.commission_rate);
            } else {
                payload.append('_method', 'PATCH');
            }
            if (form.avatar) payload.append('avatar', form.avatar);
            return editing ? api.post(`/admin/sellers/${editing.id}`, payload) : api.post('/admin/sellers', payload);
        },
        onSuccess: () => {
            setFormOpen(false);
            setEditing(null);
            setForm(emptyForm);
            setError('');
            queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
        },
        onError: (mutationError: any) => setError(mutationError.response?.data?.message || 'Unable to save seller.'),
    });
    const action = useMutation({
        mutationFn: async ({ seller, type }: { seller: Seller; type: 'suspend' | 'reactivate' | 'delete' }) => {
            await prepareSanctum();
            if (type === 'delete') return api.delete(`/admin/sellers/${seller.id}`);
            return api.post(`/admin/sellers/${seller.id}/${type}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-sellers'] }),
        onError: () => setError('Unable to update seller.'),
    });
    const visibleSellers = sellers.filter((seller) => {
        const query = search.trim().toLowerCase();
        return (
            !query ||
            seller.name.toLowerCase().includes(query) ||
            seller.email.toLowerCase().includes(query) ||
            seller.shop?.name.toLowerCase().includes(query)
        );
    });
    function openCreate() {
        setEditing(null);
        setForm(emptyForm);
        setError('');
        setFormOpen(true);
    }
    function openEdit(seller: Seller) {
        setEditing(seller);
        setForm({ ...emptyForm, name: seller.name, email: seller.email, phone: seller.phone ?? '', shop_name: seller.shop?.name ?? '' });
        setError('');
        setFormOpen(true);
    }
    function updateField(field: keyof SellerForm, value: string) {
        setForm((current) => ({ ...current, [field]: value }));
    }
    function updateAvatar(file: File | null) {
        setForm((current) => ({ ...current, avatar: file }));
    }
    function submit(event: FormEvent) {
        event.preventDefault();
        saveSeller.mutate();
    }

    return (
        <>
            <Head title="Seller management" />
            <PortalLayout role="admin" title="Seller management" eyebrow="Marketplace operations">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3 border border-[#dfe3dc] bg-white px-4 py-3 sm:w-80">
                        <Search size={17} className="text-[#657066]" />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search sellers"
                            className="w-full bg-transparent text-sm outline-none"
                        />
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center justify-center gap-2 bg-[#1e2420] px-4 py-3 text-sm font-semibold text-white"
                    >
                        <Plus size={17} /> Create seller
                    </button>
                </div>
                <section className="mt-6 overflow-x-auto border border-[#dfe3dc] bg-white">
                    <table className="w-full min-w-190 text-left text-sm">
                        <thead className="border-b border-[#dfe3dc] text-xs text-[#657066]">
                            <tr>
                                <th className="px-5 py-4 font-medium">Shop</th>
                                <th className="px-5 py-4 font-medium">Owner</th>
                                <th className="px-5 py-4 font-medium">Email</th>
                                <th className="px-5 py-4 font-medium">Status</th>
                                <th className="px-5 py-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sellersQuery.isLoading ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-sm text-[#657066]">
                                        Loading sellers...
                                    </td>
                                </tr>
                            ) : (
                                visibleSellers.map((seller) => (
                                    <tr key={seller.id} className="border-b border-[#edf0eb] last:border-0">
                                        <td className="px-5 py-5">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-9 w-9 items-center justify-center overflow-hidden bg-[#dce7d5]">
                                                    {seller.avatar ? (
                                                        <img src={`/storage/${seller.avatar}`} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Store size={16} />
                                                    )}
                                                </span>
                                                <span className="font-semibold">{seller.shop?.name ?? 'Unnamed shop'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-5 text-[#657066]">{seller.name}</td>
                                        <td className="px-5 py-5 text-[#657066]">{seller.email}</td>
                                        <td className="px-5 py-5">
                                            <span
                                                className={
                                                    seller.status === 'suspended'
                                                        ? 'text-xs font-semibold text-[#a23b2d]'
                                                        : 'text-xs font-semibold text-[#587447]'
                                                }
                                            >
                                                {seller.status ?? 'active'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-5">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEdit(seller)}
                                                    title="Edit seller"
                                                    aria-label="Edit seller"
                                                    className="border border-[#ccd3ca] p-2 hover:bg-[#eef0e9]"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        action.mutate({ seller, type: seller.status === 'suspended' ? 'reactivate' : 'suspend' })
                                                    }
                                                    title={seller.status === 'suspended' ? 'Reactivate seller' : 'Suspend seller'}
                                                    aria-label={seller.status === 'suspended' ? 'Reactivate seller' : 'Suspend seller'}
                                                    className="border border-[#ccd3ca] p-2 hover:bg-[#eef0e9]"
                                                >
                                                    <Check size={14} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        window.confirm(`Delete ${seller.name}?`) && action.mutate({ seller, type: 'delete' })
                                                    }
                                                    title="Delete seller"
                                                    aria-label="Delete seller"
                                                    className="border border-[#eccac3] p-2 text-[#a23b2d] hover:bg-[#f7e1dc]"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!sellersQuery.isLoading && visibleSellers.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-sm text-[#657066]">
                                        No sellers found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
                {formOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e2420]/35 p-5">
                        <div className="w-full max-w-lg border border-[#dfe3dc] bg-white p-6 shadow-2xl">
                            <div className="mb-6 flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-bold tracking-[0.18em] text-[#9a6b45] uppercase">
                                        {editing ? 'Edit seller' : 'New seller'}
                                    </p>
                                    <h2 className="mt-2 font-serif text-2xl">{editing ? 'Update seller' : 'Create a seller'}</h2>
                                </div>
                                <button onClick={() => setFormOpen(false)} aria-label="Close form">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={submit} className="grid gap-4">
                                <label className="grid gap-1 text-sm font-semibold">
                                    Owner name
                                    <input
                                        required
                                        value={form.name}
                                        onChange={(event) => updateField('name', event.target.value)}
                                        className="border border-[#ccd3ca] px-3 py-2 font-normal"
                                    />
                                </label>
                                <label className="grid gap-1 text-sm font-semibold">
                                    Email
                                    <input
                                        required
                                        type="email"
                                        disabled={!!editing}
                                        value={form.email}
                                        onChange={(event) => updateField('email', event.target.value)}
                                        className="border border-[#ccd3ca] px-3 py-2 font-normal disabled:bg-[#f1f2ef]"
                                    />
                                </label>
                                {!editing && (
                                    <label className="grid gap-1 text-sm font-semibold">
                                        Password <span className="font-normal text-[#657066]">(optional, minimum 12 characters)</span>
                                        <input
                                            type="password"
                                            minLength={12}
                                            value={form.password}
                                            onChange={(event) => updateField('password', event.target.value)}
                                            className="border border-[#ccd3ca] px-3 py-2 font-normal"
                                        />
                                    </label>
                                )}
                                <label className="grid gap-1 text-sm font-semibold">
                                    Shop name
                                    <input
                                        required
                                        value={form.shop_name}
                                        onChange={(event) => updateField('shop_name', event.target.value)}
                                        className="border border-[#ccd3ca] px-3 py-2 font-normal"
                                    />
                                </label>
                                <label className="grid gap-1 text-sm font-semibold">
                                    Phone
                                    <input
                                        value={form.phone}
                                        onChange={(event) => updateField('phone', event.target.value)}
                                        className="border border-[#ccd3ca] px-3 py-2 font-normal"
                                    />
                                </label>
                                <label className="grid gap-1 text-sm font-semibold">
                                    Profile image
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#dce7d5] text-[#587447]">
                                            {form.avatar ? (
                                                <img
                                                    src={URL.createObjectURL(form.avatar)}
                                                    alt="Selected profile"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : editing?.avatar ? (
                                                <img src={`/storage/${editing.avatar}`} alt={editing.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <ImagePlus size={20} />
                                            )}
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={(event) => updateAvatar(event.target.files?.[0] ?? null)}
                                            className="min-w-0 text-sm font-normal"
                                        />
                                    </div>
                                    <span className="font-normal text-[#657066]">JPG, PNG, or WebP up to 2 MB.</span>
                                </label>
                                {error && <p className="text-sm text-[#a23b2d]">{error}</p>}
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormOpen(false)}
                                        className="border border-[#ccd3ca] px-4 py-2 text-sm font-semibold"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        disabled={saveSeller.isPending}
                                        className="bg-[#1e2420] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                                    >
                                        {saveSeller.isPending ? 'Saving...' : editing ? 'Save changes' : 'Create seller'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </PortalLayout>
        </>
    );
}
