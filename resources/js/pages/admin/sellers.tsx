import { PortalLayout } from '@/components/portal-layout';
import { api, prepareSanctum } from '@/lib/api';
import { optimizeImage } from '@/lib/image-upload';
import { Head } from '@inertiajs/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Activity,
    ArrowRight,
    BriefcaseBusiness,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    Clock3,
    Eye,
    ImagePlus,
    MoreHorizontal,
    Package,
    Pencil,
    Plus,
    Search,
    Store,
    Trash2,
    UsersRound,
    X,
} from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

type SellerMetrics = { products: number; orders: number; sales: number; shop_visits: number | null };
type Seller = {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
    phone?: string | null;
    status?: string | null;
    created_at: string;
    shop?: { id: number; name: string; logo?: string | null; commission_rate?: string } | null;
    seller_profile?: { verification_status?: string | null } | null;
    seller_metrics?: SellerMetrics;
};
type SellerForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    shop_name: string;
    status: string;
    shop_image: File | null;
};
type SellerStats = { total: number; active: number; inactive: number; suspended: number; new_this_month: number };
type GrowthPoint = { label: string; value: number };
type SellersResponse = {
    data: Seller[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    stats: SellerStats;
    growth: GrowthPoint[];
    growth_has_data: boolean;
};
type MutationAction = 'suspend' | 'reactivate' | 'delete';

const emptyForm: SellerForm = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    shop_name: '',
    status: 'active',
    shop_image: null,
};

function statusClass(status?: string | null) {
    if (status === 'active') return 'bg-[#e4f7ed] text-[#25834d]';
    if (status === 'suspended') return 'bg-[#fff0ed] text-[#bd5144]';
    return 'bg-[#fff3dc] text-[#a66a17]';
}

function shopImageUrl(path?: string | null) {
    if (!path) return null;
    return path.startsWith('http') || path.startsWith('/') ? path : `/storage/${path}`;
}

function formatMoney(value?: number) {
    return `₱${new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value ?? 0)}`;
}

function StatCard({ label, value, detail, Icon }: { label: string; value: number; detail: string; Icon: typeof Store }) {
    return (
        <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e4ebe6] bg-white p-3.5 shadow-[0_3px_13px_rgba(31,70,48,0.045)]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-[#258553]"><Icon size={18} /></span>
            <div className="min-w-0 flex-1">
                <p className="truncate text-[10px] font-medium text-[#607166]">{label}</p>
                <strong className="mt-0.5 block text-xl leading-none text-[#1c4b3d]">{value}</strong>
                <p className="mt-1 truncate text-[9px] text-[#829087]">{detail}</p>
            </div>
            <svg viewBox="0 0 100 30" className="hidden h-7 w-14 shrink-0 sm:block" aria-hidden="true">
                <polyline points="0,26 16,21 30,24 48,14 61,17 77,8 100,2" fill="none" stroke="#299462" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
}

function ShopAvatar({ seller, size = 'h-12 w-12' }: { seller: Seller; size?: string }) {
    const image = shopImageUrl(seller.shop?.logo) ?? shopImageUrl(seller.avatar);
    return (
        <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#edf6f0] text-[#328152] ${size}`}>
            {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <Store size={18} />}
        </span>
    );
}

export default function Sellers() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);
    const [viewing, setViewing] = useState<Seller | null>(null);
    const [editing, setEditing] = useState<Seller | null>(null);
    const [formOpen, setFormOpen] = useState(false);
    const [form, setForm] = useState<SellerForm>(emptyForm);
    const [deleting, setDeleting] = useState<Seller | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const timer = window.setTimeout(() => {
            setQuery(search);
            setPage(1);
        }, 300);
        return () => window.clearTimeout(timer);
    }, [search]);

    const sellersQuery = useQuery<SellersResponse>({
        queryKey: ['admin-sellers', query, status, sort, page],
        queryFn: async () => (await api.get('/admin/sellers', { params: { search: query || undefined, status, sort, page } })).data,
    });
    const sellers = sellersQuery.data?.data ?? [];
    const stats = sellersQuery.data?.stats;
    const growth = sellersQuery.data?.growth ?? [];

    const saveSeller = useMutation({
        mutationFn: async () => {
            await prepareSanctum();
            const payload = new FormData();
            payload.append('name', form.name);
            payload.append('email', form.email);
            payload.append('phone', form.phone);
            payload.append('shop_name', form.shop_name);
            payload.append('status', form.status);
            if (!editing) {
                payload.append('password', form.password);
                payload.append('password_confirmation', form.password_confirmation);
            } else {
                payload.append('_method', 'PATCH');
            }
            if (form.shop_image) payload.append('shop_image', form.shop_image);
            return editing
                ? api.post(`/admin/sellers/${editing.id}`, payload)
                : api.post('/admin/sellers', payload);
        },
        onSuccess: async (response) => {
            const savedSeller = response.data as Seller;
            setViewing((current) => current?.id === savedSeller.id ? savedSeller : current);
            setFormOpen(false);
            setEditing(null);
            setForm(emptyForm);
            setError('');
            await queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
        },
        onError: (mutationError: { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }) => {
            const validationErrors = Object.values(mutationError.response?.data?.errors ?? {}).flat();
            setError(validationErrors[0] ?? mutationError.response?.data?.message ?? 'Unable to save seller.');
        },
    });

    const sellerAction = useMutation({
        mutationFn: async ({ seller, action }: { seller: Seller; action: MutationAction }) => {
            await prepareSanctum();
            if (action === 'delete') return api.delete(`/admin/sellers/${seller.id}`);
            return api.post(`/admin/sellers/${seller.id}/${action}`);
        },
        onSuccess: async (_, variables) => {
            if (variables.action === 'delete') {
                setDeleting(null);
                setViewing(null);
            } else if (viewing?.id === variables.seller.id) {
                setViewing({ ...viewing, status: variables.action === 'suspend' ? 'suspended' : 'active' });
            }
            setError('');
            await queryClient.invalidateQueries({ queryKey: ['admin-sellers'] });
        },
        onError: () => setError('Unable to update seller. Please try again.'),
    });

    function openCreate() {
        setEditing(null);
        setForm(emptyForm);
        setError('');
        setFormOpen(true);
    }

    function openEdit(seller: Seller) {
        setEditing(seller);
        setForm({
            ...emptyForm,
            name: seller.name,
            email: seller.email,
            phone: seller.phone ?? '',
            shop_name: seller.shop?.name ?? '',
            status: seller.status ?? 'active',
        });
        setError('');
        setFormOpen(true);
    }

    function closeForm() {
        setFormOpen(false);
        setEditing(null);
        setForm(emptyForm);
        setError('');
    }

    function updateField<K extends keyof SellerForm>(field: K, value: SellerForm[K]) {
        setForm((current) => ({ ...current, [field]: value }));
    }

    async function updateShopImage(file: File | null) {
        const optimized = file ? await optimizeImage(file, { maxWidth: 800, maxHeight: 800 }) : null;
        setForm((current) => ({ ...current, shop_image: optimized }));
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        saveSeller.mutate();
    }

    const handleStatusFilter = (value: string) => {
        setStatus(value);
        setPage(1);
    };
    const firstItem = sellers.length ? (page - 1) * (sellersQuery.data?.per_page ?? 20) + 1 : 0;
    const lastItem = (page - 1) * (sellersQuery.data?.per_page ?? 20) + sellers.length;

    return (
        <>
            <Head title="Seller Management" />
            <PortalLayout role="admin" title="Seller management" eyebrow="Marketplace operations">
                <div className="mb-4 flex min-w-0 flex-col justify-between gap-3 sm:mb-5 sm:flex-row sm:items-end">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#16834b]">‹ &nbsp; Sellers</p>
                        <h1 className="mt-1 text-2xl leading-tight font-bold tracking-tight text-[#174c3e] sm:text-[29px]">Sellers</h1>
                        <p className="mt-1 text-xs leading-5 text-[#6a7c70]">Manage marketplace sellers and their shop accounts.</p>
                    </div>
                    <button type="button" onClick={openCreate} className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#188747] px-4 text-xs font-semibold text-white transition hover:bg-[#126d39] sm:w-auto">
                        <Plus size={15} /> Create seller
                    </button>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Total sellers" value={stats?.total ?? 0} detail="All marketplace accounts" Icon={Store} />
                    <StatCard label="Active sellers" value={stats?.active ?? 0} detail="Currently active" Icon={UsersRound} />
                    <StatCard label="Inactive sellers" value={stats?.inactive ?? 0} detail="Inactive accounts" Icon={Clock3} />
                    <StatCard label="New sellers this month" value={stats?.new_this_month ?? 0} detail="Joined this month" Icon={Activity} />
                </div>

                <section className="mt-3 overflow-hidden rounded-xl border border-[#e4ebe6] bg-white shadow-[0_3px_13px_rgba(31,70,48,0.045)]">
                    <div className="flex flex-col gap-2.5 border-b border-[#edf1ee] p-3 sm:flex-row sm:flex-wrap sm:items-center sm:p-4">
                        <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#dce5df] bg-white px-2.5 focus-within:border-[#2a8b52] sm:min-w-56">
                            <Search size={14} className="shrink-0 text-[#748279]" />
                            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search sellers..." className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-[#99a39d]" />
                            {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search" className="text-[#829087]"><X size={13} /></button>}
                        </label>
                        <FilterSelect value={status} ariaLabel="Filter seller status" onChange={handleStatusFilter} options={[['all', 'All statuses'], ['active', 'Active'], ['inactive', 'Inactive'], ['suspended', 'Suspended']]} />
                        <FilterSelect value={sort} ariaLabel="Sort sellers" onChange={(value) => { setSort(value); setPage(1); }} options={[['newest', 'Newest first'], ['oldest', 'Oldest first'], ['name', 'Name A–Z']]} />
                    </div>
                    <div className="overflow-x-auto px-3 pb-2.5 sm:px-4">
                        <table className="w-full min-w-[740px] text-left text-[10px]">
                            <thead className="border-b border-[#eaf0ec] bg-[#f5faf7] text-[9px] font-semibold text-[#668073]">
                                <tr><th className="px-3 py-2.5">Shop</th><th className="px-3 py-2.5">Owner</th><th className="px-3 py-2.5">Email</th><th className="px-3 py-2.5">Status</th><th className="px-3 py-2.5 text-right">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf1ee]">
                                {sellersQuery.isLoading ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-[10px] text-[#819087]">Loading sellers...</td></tr>
                                ) : sellersQuery.isError ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-[10px] text-[#b54238]">Unable to load sellers. Please refresh and try again.</td></tr>
                                ) : sellers.map((seller) => (
                                    <tr key={seller.id} className="hover:bg-[#fbfdfb]">
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <ShopAvatar seller={seller} />
                                                <span className="min-w-0"><strong className="block truncate text-[10px] text-[#405449]">{seller.shop?.name ?? 'Unnamed shop'}</strong><span className="mt-0.5 block truncate text-[8px] text-[#89968e]">{seller.shop?.name ?? 'Shop account'}</span></span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#edf4ef] text-[#52725c]">{seller.avatar ? <img src={shopImageUrl(seller.avatar) ?? ''} alt="" className="h-full w-full object-cover" /> : <UsersRound size={13} />}</span><span className="font-medium text-[#516258]">{seller.name}</span></div>
                                        </td>
                                        <td className="px-3 py-2.5 text-[#64746a]">{seller.email}</td>
                                        <td className="px-3 py-2.5"><span className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-semibold capitalize ${statusClass(seller.status)}`}>{seller.status ?? 'active'}</span></td>
                                        <td className="px-3 py-2.5">
                                            <div className="flex justify-end gap-1.5">
                                                <button type="button" aria-label={`View ${seller.shop?.name ?? seller.name}`} title="View seller" onClick={() => setViewing(seller)} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dbe9df] text-[#328152] hover:bg-[#edf8f1]"><Eye size={13} /></button>
                                                <button type="button" aria-label={`Edit ${seller.shop?.name ?? seller.name}`} title="Edit seller" onClick={() => openEdit(seller)} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dbe9df] text-[#328152] hover:bg-[#edf8f1]"><Pencil size={13} /></button>
                                                <button type="button" aria-label={`Delete ${seller.shop?.name ?? seller.name}`} title="Delete seller" onClick={() => setDeleting(seller)} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#f1ddda] text-[#c04c42] hover:bg-[#fff4f2]"><Trash2 size={13} /></button>
                                                <button type="button" aria-label={`More actions for ${seller.shop?.name ?? seller.name}`} title={seller.status === 'suspended' ? 'Reactivate seller' : 'Suspend seller'} onClick={() => sellerAction.mutate({ seller, action: seller.status === 'suspended' ? 'reactivate' : 'suspend' })} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dbe9df] text-[#718077] hover:bg-[#f3f8f4]"><MoreHorizontal size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!sellersQuery.isLoading && !sellersQuery.isError && sellers.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-[10px] text-[#819087]">No sellers match these filters.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col gap-2 border-t border-[#edf1ee] px-3 py-2.5 text-[9px] text-[#748279] sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <p>Showing {firstItem}–{lastItem} of {sellersQuery.data?.total ?? 0} sellers</p>
                        <div className="flex items-center justify-between gap-1 sm:justify-end">
                            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="inline-flex h-7 items-center gap-1 rounded-md px-2 hover:bg-[#f3f8f4] disabled:opacity-40"><ChevronLeft size={13} /> Previous</button>
                            <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-[#188747] px-2 font-semibold text-white">{sellersQuery.data?.current_page ?? page}</span>
                            <button type="button" disabled={page >= (sellersQuery.data?.last_page ?? 1)} onClick={() => setPage((current) => current + 1)} className="inline-flex h-7 items-center gap-1 rounded-md px-2 hover:bg-[#f3f8f4] disabled:opacity-40">Next <ChevronRight size={13} /></button>
                        </div>
                    </div>
                </section>

                <section className="mt-3 grid min-w-0 gap-2.5 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,.8fr)]">
                    <div className="grid gap-2.5 sm:grid-cols-2">
                        <StatCard label="Total sellers" value={stats?.total ?? 0} detail="Marketplace accounts" Icon={Store} />
                        <StatCard label="Active sellers" value={stats?.active ?? 0} detail="Currently active" Icon={UsersRound} />
                        <StatCard label="Inactive sellers" value={stats?.inactive ?? 0} detail="Inactive accounts" Icon={Clock3} />
                        <StatCard label="New sellers this month" value={stats?.new_this_month ?? 0} detail="Joined this month" Icon={Activity} />
                    </div>
                    <section className="min-w-0 rounded-xl border border-[#e4ebe6] bg-white p-3.5 shadow-[0_3px_13px_rgba(31,70,48,0.045)] sm:p-4">
                        <div className="flex items-start justify-between gap-3"><div><h2 className="text-sm font-bold text-[#25372c]">Seller Activity</h2><p className="mt-0.5 text-[9px] text-[#7d8b82]">Seller registrations over the last 30 days</p></div><Activity size={15} className="text-[#328152]" /></div>
                        {sellersQuery.data?.growth_has_data ? (
                            <div className="mt-3">
                                <SellerGrowthChart points={growth} />
                            </div>
                        ) : (
                            <div className="mt-3 flex h-32 items-center justify-center rounded-lg bg-[#f8fbf9] text-center text-[9px] text-[#829087]">No seller growth activity recorded in the last 30 days.</div>
                        )}
                    </section>
                </section>

                {formOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10271b]/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
                        <form onSubmit={submit} className="grid max-h-[90vh] w-full max-w-lg gap-3.5 overflow-y-auto rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-2xl sm:p-5">
                            <div className="flex items-start justify-between border-b border-[#edf1ee] pb-3">
                                <div><h2 className="text-base font-bold text-[#26382d]">{editing ? 'Edit seller' : 'Create seller'}</h2><p className="mt-1 text-[10px] text-[#7c8981]">{editing ? 'Update the shop and owner account.' : 'Create a new seller and shop account.'}</p></div>
                                <button type="button" aria-label="Close seller form" onClick={closeForm} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8e4] text-[#68766d]"><X size={15} /></button>
                            </div>
                            <FormField label="Shop name" required value={form.shop_name} onChange={(value) => updateField('shop_name', value)} />
                            <FormField label="Owner name" required value={form.name} onChange={(value) => updateField('name', value)} />
                            <FormField label="Email address" required type="email" value={form.email} onChange={(value) => updateField('email', value)} />
                            {!editing && <>
                                <FormField label="Password" required type="password" minLength={12} value={form.password} onChange={(value) => updateField('password', value)} />
                                <FormField label="Confirm password" required type="password" minLength={12} value={form.password_confirmation} onChange={(value) => updateField('password_confirmation', value)} />
                            </>}
                            <label className="grid gap-1.5 text-[10px] font-semibold text-[#4e6055]">Status
                                <select value={form.status} onChange={(event) => updateField('status', event.target.value)} className="h-9 rounded-lg border border-[#dce5df] bg-white px-3 text-xs font-normal outline-none focus:border-[#2a8b52]"><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select>
                            </label>
                            <label className="grid gap-1.5 text-[10px] font-semibold text-[#4e6055]">Shop image
                                <span className="flex items-center gap-3 rounded-lg border border-[#e6ede8] p-2.5">
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eaf6ef] text-[#328152]">{form.shop_image ? <img src={URL.createObjectURL(form.shop_image)} alt="Selected shop" className="h-full w-full object-cover" /> : editing?.shop?.logo ? <img src={shopImageUrl(editing.shop.logo) ?? ''} alt={editing.shop.name} className="h-full w-full object-cover" /> : <ImagePlus size={18} />}</span>
                                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={async (event) => updateShopImage(event.target.files?.[0] ?? null)} className="min-w-0 text-[10px] font-normal text-[#64746a]" />
                                </span>
                                <span className="font-normal text-[9px] text-[#829087]">JPG, PNG, or WebP up to 2 MB.</span>
                            </label>
                            {error && <p role="alert" className="rounded-lg border border-[#f0d2cd] bg-[#fff4f2] px-3 py-2 text-[9px] text-[#a64135]">{error}</p>}
                            <div className="flex justify-end gap-2 border-t border-[#edf1ee] pt-3">
                                <button type="button" onClick={closeForm} className="h-9 rounded-lg border border-[#dce5df] px-3.5 text-[10px] font-semibold text-[#63746a] hover:bg-[#f7faf8]">Cancel</button>
                                <button disabled={saveSeller.isPending} className="h-9 rounded-lg bg-[#188747] px-4 text-[10px] font-semibold text-white hover:bg-[#126d39] disabled:opacity-60">{saveSeller.isPending ? 'Saving…' : editing ? 'Save changes' : 'Create seller'}</button>
                            </div>
                        </form>
                    </div>
                )}

                {viewing && <SellerDetails seller={viewing} onClose={() => setViewing(null)} onEdit={() => openEdit(viewing)} onStatus={() => sellerAction.mutate({ seller: viewing, action: viewing.status === 'suspended' ? 'reactivate' : 'suspend' })} />}

                {deleting && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#10271b]/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !sellerAction.isPending) setDeleting(null); }}>
                        <section role="alertdialog" aria-modal="true" aria-labelledby="delete-seller-title" className="w-full max-w-sm rounded-xl border border-[#e4ebe6] bg-white p-5 shadow-2xl">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0ed] text-[#c04c42]"><Trash2 size={18} /></span>
                            <h2 id="delete-seller-title" className="mt-3 text-sm font-bold text-[#26382d]">Delete seller?</h2>
                            <p className="mt-1 text-[10px] leading-5 text-[#718077]">Are you sure you want to delete this seller account?</p>
                            {error && <p role="alert" className="mt-2 text-[9px] text-[#b54238]">{error}</p>}
                            <div className="mt-4 flex justify-end gap-2">
                                <button type="button" disabled={sellerAction.isPending} onClick={() => setDeleting(null)} className="h-8 rounded-lg border border-[#dce5df] px-3 text-[10px] font-semibold text-[#63746a]">Cancel</button>
                                <button type="button" disabled={sellerAction.isPending} onClick={() => sellerAction.mutate({ seller: deleting, action: 'delete' })} className="h-8 rounded-lg bg-[#c5483d] px-3 text-[10px] font-semibold text-white disabled:opacity-60">{sellerAction.isPending ? 'Deleting…' : 'Delete seller'}</button>
                            </div>
                        </section>
                    </div>
                )}
            </PortalLayout>
        </>
    );
}

function FilterSelect({ value, onChange, options, ariaLabel }: { value: string; onChange: (value: string) => void; options: [string, string][]; ariaLabel: string }) {
    return (
        <label className="flex h-9 min-w-0 items-center gap-1.5 rounded-lg border border-[#dce5df] bg-white px-2.5 text-[9px] text-[#526157]">
            <span className="sr-only">{ariaLabel}</span>
            <select value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 appearance-none bg-transparent outline-none">{options.map(([optionValue, label]) => <option key={optionValue} value={optionValue}>{label}</option>)}</select>
            <ChevronDown size={12} className="shrink-0 text-[#7a8d82]" />
        </label>
    );
}

function FormField({ label, value, onChange, required = false, type = 'text', minLength }: { label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; minLength?: number }) {
    return <label className="grid gap-1.5 text-[10px] font-semibold text-[#4e6055]">{label}<input required={required} type={type} minLength={minLength} value={value} onChange={(event) => onChange(event.target.value)} className="h-9 rounded-lg border border-[#dce5df] px-3 text-xs font-normal outline-none focus:border-[#2a8b52]" /></label>;
}

function SellerGrowthChart({ points }: { points: GrowthPoint[] }) {
    const values = points.map((point) => Number.isFinite(point.value) ? point.value : 0);
    const max = Math.max(...values, 1);
    const coords = points.map((point, index) => `${(index / Math.max(points.length - 1, 1)) * 600},${145 - (values[index] / max) * 120}`).join(' ');
    const step = Math.max(1, Math.ceil(points.length / 5));
    return <div><svg viewBox="0 0 600 160" className="h-32 w-full" role="img" aria-label="Seller registrations for the last 30 days" preserveAspectRatio="none">{[25, 65, 105, 145].map((y) => <line key={y} x1="0" x2="600" y1={y} y2={y} stroke="#edf2ee" strokeDasharray="3 5" />)}<polyline points={`0,155 ${coords} 600,155`} fill="#34a874" fillOpacity=".1" stroke="none" /><polyline points={coords} fill="none" stroke="#25945b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />{points.map((point, index) => <circle key={point.label} cx={(index / Math.max(points.length - 1, 1)) * 600} cy={145 - (values[index] / max) * 120} r="3" fill="#fff" stroke="#25945b" strokeWidth="2" vectorEffect="non-scaling-stroke"><title>{`${point.label}: ${values[index]} sellers`}</title></circle>)}</svg><div className="mt-1 flex justify-between text-[8px] text-[#7e8e83]">{points.filter((_, index) => index % step === 0 || index === points.length - 1).map((point) => <span key={point.label}>{point.label}</span>)}</div></div>;
}

function SellerDetails({ seller, onClose, onEdit, onStatus }: { seller: Seller; onClose: () => void; onEdit: () => void; onStatus: () => void }) {
    const metrics = seller.seller_metrics;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10271b]/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="seller-details-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#e4ebe6] bg-white shadow-2xl">
                <div className="flex items-start justify-between border-b border-[#edf1ee] p-4">
                    <div className="flex min-w-0 items-center gap-3"><ShopAvatar seller={seller} size="h-12 w-12" /><div className="min-w-0"><h2 id="seller-details-title" className="truncate text-base font-bold text-[#26382d]">{seller.shop?.name ?? 'Unnamed shop'}</h2><p className="mt-1 truncate text-[10px] text-[#7c8981]">Seller account #{seller.id}</p></div></div>
                    <button type="button" aria-label="Close seller details" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e2e8e4] text-[#68766d]"><X size={15} /></button>
                </div>
                <div className="space-y-4 p-4">
                    <div className="grid gap-2 sm:grid-cols-2">
                        <Info label="Owner" value={seller.name} Icon={UsersRound} /><Info label="Email" value={seller.email} Icon={UsersRound} />
                        <Info label="Status" value={seller.status ?? 'active'} Icon={Activity} /><Info label="Shop" value={seller.shop?.name ?? 'Unnamed shop'} Icon={Store} />
                    </div>
                    <div><h3 className="mb-2 text-[10px] font-bold text-[#43574a]">Shop performance</h3><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <Performance label="Products" value={metrics ? String(metrics.products) : '—'} Icon={Package} />
                        <Performance label="Orders" value={metrics ? String(metrics.orders) : '—'} Icon={BriefcaseBusiness} />
                        <Performance label="Total sales" value={metrics ? formatMoney(metrics.sales) : '—'} Icon={CircleDollarSign} />
                        <Performance label="Shop visits" value={metrics?.shop_visits === null || metrics?.shop_visits === undefined ? 'Not tracked' : metrics.shop_visits.toLocaleString()} Icon={Eye} />
                    </div></div>
                    <div className="flex justify-end gap-2 border-t border-[#edf1ee] pt-3">
                        <button type="button" onClick={onStatus} className="h-8 rounded-lg border border-[#dce5df] px-3 text-[9px] font-semibold text-[#557060]">{seller.status === 'suspended' ? 'Reactivate' : 'Suspend'}</button>
                        <button type="button" onClick={onEdit} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#188747] px-3 text-[9px] font-semibold text-white"><Pencil size={12} /> Edit seller</button>
                    </div>
                </div>
            </section>
        </div>
    );
}

function Info({ label, value, Icon }: { label: string; value: string; Icon: typeof Store }) {
    return <div className="min-w-0 rounded-lg border border-[#edf1ee] p-2.5"><p className="flex items-center gap-1.5 text-[8px] font-semibold uppercase text-[#89948d]"><Icon size={11} />{label}</p><p className="mt-1 break-words text-[10px] capitalize text-[#36483d]">{value}</p></div>;
}

function Performance({ label, value, Icon }: { label: string; value: string; Icon: typeof Store }) {
    return <div className="min-w-0 rounded-lg bg-[#f7faf8] p-2.5"><span className="flex items-center gap-1.5 text-[8px] text-[#718077]"><Icon size={11} className="text-[#348454]" />{label}</span><strong className="mt-1 block truncate text-[11px] text-[#254c3b]">{value}</strong></div>;
}
