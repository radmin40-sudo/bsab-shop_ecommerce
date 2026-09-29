import { PortalLayout } from '@/components/portal-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CalendarClock, Copy, Plus, Search, TicketPercent, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

type TargetProduct = {
    id: number;
    name: string;
    base_price: string;
    sale_price?: string | null;
    stock_quantity: number;
    status: string;
    category?: { id: number; name: string } | null;
    shop?: { id: number; name: string } | null;
    images?: { path: string }[];
    variants?: { id: number; name: string; sku: string; stock_quantity: number; is_active: boolean }[];
};
type Voucher = {
    id: number;
    name: string;
    code: string;
    type: string;
    discount_value: string;
    minimum_spend: string;
    expires_at: string | null;
    starts_at: string | null;
    is_active: boolean;
    apply_to: string;
    claims_count: number;
    usages_count: number;
    products: { id: number; name: string; base_price: string; category_id: number }[];
    categories: { id: number; name: string }[];
    sellers: { id: number; name: string }[];
    variants: { id: number; name: string; sku: string; stock_quantity: number; product_id: number }[];
    variants: { id: number; name: string; sku: string; stock_quantity: number; product_id: number }[];
};
type PageProps = {
    vouchers: {
        data: Voucher[];
        current_page: number;
        last_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    categories: { id: number; name: string }[];
    sellers: { id: number; name: string }[];
    products: { data: TargetProduct[]; current_page: number; last_page: number; total: number };
    isAdmin: boolean;
    shop: { id: number; name: string } | null;
    filters: { search?: string; filter?: string; sort?: string };
    auth: { user: { name: string } };
};
type FormData = {
    name: string;
    code: string;
    type: string;
    discount_value: string;
    minimum_spend: string;
    maximum_discount: string;
    apply_to: string;
    customer_eligibility: string;
    starts_at: string;
    expires_at: string;
    total_usage_limit: string;
    per_customer_usage_limit: string;
    claim_limit: string;
    requires_claim: boolean;
    free_shipping: boolean;
    is_active: boolean;
    description: string;
    terms: string;
    seller_id: string;
    product_ids: number[];
    category_ids: number[];
    variant_ids: number[];
    seller_ids: number[];
};
const emptyForm: FormData = {
    name: '',
    code: '',
    type: 'fixed',
    discount_value: '',
    minimum_spend: '0',
    maximum_discount: '',
    apply_to: 'all',
    customer_eligibility: 'all',
    starts_at: '',
    expires_at: '',
    total_usage_limit: '',
    per_customer_usage_limit: '',
    claim_limit: '',
    requires_claim: false,
    free_shipping: false,
    is_active: true,
    description: '',
    terms: '',
    seller_id: '',
    product_ids: [],
    category_ids: [],
    variant_ids: [],
    seller_ids: [],
};

function money(value: string | number) {
    return `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
}

export default function VoucherManagement() {
    const { vouchers, categories, sellers, products: initialProducts, isAdmin, shop, filters } = usePage<PageProps>().props;
    const form = useForm<FormData>(emptyForm);
    const [editing, setEditing] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [productSellerFilter, setProductSellerFilter] = useState('');
    const [targetProducts, setTargetProducts] = useState(initialProducts);
    const basePath = isAdmin ? '/admin/vouchers' : '/seller/vouchers';

    useEffect(() => setTargetProducts(initialProducts), [initialProducts]);

    async function searchProducts(search = productSearch, categoryId = categoryFilter, page = 1, sellerId = productSellerFilter) {
        const query = new URLSearchParams({ product_search: search, category_id: categoryId, seller_id: sellerId, product_page: String(page) });
        const response = await fetch(`${basePath}/products?${query.toString()}`, {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        });
        if (response.ok) setTargetProducts(await response.json());
    }

    function openCreate() {
        setEditing(null);
        form.setData(emptyForm);
        form.clearErrors();
        setShowForm(true);
    }

    function openEdit(voucher: Voucher) {
        setEditing(voucher.id);
        form.setData({
            ...emptyForm,
            name: voucher.name,
            code: voucher.code,
            type: voucher.type,
            discount_value: voucher.discount_value,
            minimum_spend: voucher.minimum_spend,
            apply_to: voucher.apply_to,
            starts_at: voucher.starts_at?.slice(0, 16) ?? '',
            expires_at: voucher.expires_at?.slice(0, 16) ?? '',
            is_active: voucher.is_active,
            product_ids: voucher.products.map((item) => item.id),
            category_ids: voucher.categories.map((item) => item.id),
            seller_ids: voucher.sellers.map((item) => item.id),
            variant_ids: voucher.variants.map((item) => item.id),
        });
        form.clearErrors();
        setShowForm(true);
    }

    function submit(event: FormEvent) {
        event.preventDefault();
        const options = {
            onSuccess: () => {
                setShowForm(false);
                setEditing(null);
                form.setData(emptyForm);
            },
        };
        if (editing) form.patch(`${basePath}/${editing}`, options);
        else form.post(basePath, options);
    }

    function toggleTarget(field: 'product_ids' | 'category_ids' | 'seller_ids', id: number) {
        const current = form.data[field];
        form.setData(field, current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    }

    function runFilter(name: string, value: string) {
        router.get(basePath, { ...filters, [name]: value || undefined }, { preserveState: true, replace: true });
    }

    return (
        <>
            <Head title="Vouchers" />
            <PortalLayout role={isAdmin ? 'admin' : 'seller'} title="Vouchers" eyebrow="Discount management">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs font-bold tracking-[0.16em] text-[#328451] uppercase">BSAB-SHOP</p>
                        <h1 className="mt-1 text-3xl font-bold text-[#163b24]">Vouchers</h1>
                        <p className="mt-1 text-sm text-[#647568]">Create targeted discounts and track redemptions.</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1f7a42] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#163b24]"
                    >
                        <Plus size={17} /> Create voucher
                    </button>
                </div>

                <div className="mb-5 grid gap-3 rounded-2xl border border-[#dcebe0] bg-white p-4 sm:grid-cols-[1fr_auto_auto]">
                    <label className="relative">
                        <Search size={16} className="absolute top-3 left-3 text-[#819086]" />
                        <input
                            defaultValue={filters.search ?? ''}
                            onKeyDown={(event) => event.key === 'Enter' && runFilter('search', event.currentTarget.value)}
                            placeholder="Search voucher name or code"
                            className="w-full rounded-lg border border-[#dcebe0] py-2.5 pr-3 pl-9 text-sm outline-none focus:border-[#2c9350]"
                        />
                    </label>
                    <select
                        value={filters.filter ?? 'all'}
                        onChange={(event) => runFilter('filter', event.target.value)}
                        className="rounded-lg border border-[#dcebe0] bg-white px-3 py-2 text-sm"
                    >
                        <option value="all">All statuses</option>
                        <option value="active">Active</option>
                        <option value="unclaimed">Unclaimed</option>
                        <option value="expired">Expired</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="disabled">Disabled</option>
                    </select>
                    <select
                        value={filters.sort ?? 'newest'}
                        onChange={(event) => runFilter('sort', event.target.value)}
                        className="rounded-lg border border-[#dcebe0] bg-white px-3 py-2 text-sm"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="most_used">Most used</option>
                        <option value="expires">Expiration date</option>
                    </select>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                    {vouchers.data.map((voucher) => (
                        <article
                            key={voucher.id}
                            className="overflow-hidden rounded-2xl border border-[#dcebe0] bg-white shadow-[0_5px_18px_rgba(22,59,36,.05)]"
                        >
                            <div className="flex items-start gap-4 p-5">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#e6f7eb] text-[#23804a]">
                                    <TicketPercent size={29} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="font-display text-xl font-bold text-[#163b24]">
                                            {voucher.type === 'percentage'
                                                ? `${voucher.discount_value}% OFF`
                                                : voucher.type === 'free_shipping'
                                                  ? 'Free shipping'
                                                  : `${money(voucher.discount_value)} OFF`}
                                        </h2>
                                        <span
                                            className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${voucher.is_active ? 'bg-[#e6f7eb] text-[#1f7a42]' : 'bg-[#eef1ee] text-[#66756b]'}`}
                                        >
                                            {voucher.is_active ? 'Active' : 'Disabled'}
                                        </span>
                                    </div>
                                    <p className="mt-1 truncate text-sm font-semibold">{voucher.name}</p>
                                    <p className="mt-1 text-xs text-[#647568]">
                                        Min. spend {money(voucher.minimum_spend)} · Code <b className="text-[#1f7a42]">{voucher.code}</b>
                                    </p>
                                    <p className="mt-1 flex items-center gap-1 text-xs text-[#647568]">
                                        <CalendarClock size={13} />
                                        {voucher.expires_at ? `Expires ${new Date(voucher.expires_at).toLocaleString()}` : 'No expiration date'}
                                    </p>
                                    <p className="mt-2 text-xs text-[#647568]">
                                        {voucher.apply_to === 'products'
                                            ? `${voucher.products.length} selected products`
                                            : voucher.apply_to === 'categories'
                                              ? voucher.categories.map((category) => category.name).join(', ')
                                              : voucher.apply_to === 'sellers'
                                                ? voucher.sellers.map((seller) => seller.name).join(', ') || shop?.name
                                                : 'All eligible products'}
                                    </p>
                                    <Link
                                        href={`${basePath}/${voucher.id}`}
                                        className="mt-2 inline-block text-xs font-bold text-[#1f7a42] hover:underline"
                                    >
                                        View usage details
                                    </Link>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#edf2ed] px-5 py-3 text-xs text-[#647568]">
                                <span>
                                    {voucher.usages_count} used · {voucher.claims_count} claims
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        title={voucher.is_active ? 'Disable voucher' : 'Activate voucher'}
                                        onClick={() => router.post(`${basePath}/${voucher.id}/toggle`)}
                                        className="rounded-lg border border-[#dcebe0] p-2 hover:bg-[#f5fcf7]"
                                    >
                                        {voucher.is_active ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
                                    </button>
                                    <button
                                        title="Duplicate voucher"
                                        onClick={() => router.post(`${basePath}/${voucher.id}/duplicate`)}
                                        className="rounded-lg border border-[#dcebe0] p-2 hover:bg-[#f5fcf7]"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        onClick={() => openEdit(voucher)}
                                        className="rounded-lg border border-[#dcebe0] px-3 py-1.5 font-semibold hover:bg-[#f5fcf7]"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        title="Delete voucher"
                                        onClick={() => window.confirm(`Delete ${voucher.code}?`) && router.delete(`${basePath}/${voucher.id}`)}
                                        className="rounded-lg border border-[#f2d7d4] p-2 text-[#b3413a] hover:bg-[#fff6f5]"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
                {!vouchers.data.length && (
                    <p className="rounded-xl border border-dashed border-[#cfe1d3] py-14 text-center text-sm text-[#647568]">
                        No vouchers match these filters.
                    </p>
                )}
                <nav className="mt-5 flex flex-wrap justify-center gap-1" aria-label="Voucher pages">
                    {vouchers.links.map((link, index) => (
                        <button
                            key={`${link.label}-${index}`}
                            disabled={!link.url}
                            onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                            className={`rounded-lg px-3 py-2 text-sm ${link.active ? 'bg-[#1f7a42] text-white' : 'bg-white text-[#52665a]'} disabled:opacity-40`}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    ))}
                </nav>

                {showForm && (
                    <div
                        className="fixed inset-0 z-50 overflow-y-auto bg-[#10271b]/45 p-3 sm:p-8"
                        role="dialog"
                        aria-modal="true"
                        aria-label={editing ? 'Edit voucher' : 'Create voucher'}
                    >
                        <form onSubmit={submit} className="mx-auto my-4 max-w-5xl rounded-2xl bg-[#f8fcf8] shadow-2xl">
                            <header className="flex items-center justify-between border-b border-[#dcebe0] bg-white px-5 py-4 sm:px-7">
                                <div>
                                    <h2 className="text-xl font-bold text-[#163b24]">{editing ? 'Edit voucher' : 'Create voucher'}</h2>
                                    <p className="text-xs text-[#647568]">Configure discount, eligibility, limits, and target.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="rounded-lg p-2 hover:bg-[#eff7f0]"
                                    aria-label="Close"
                                >
                                    <X size={19} />
                                </button>
                            </header>
                            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
                                <label className="text-sm font-semibold">
                                    Voucher name
                                    <input
                                        required
                                        value={form.data.name}
                                        onChange={(e) => form.setData('name', e.target.value)}
                                        placeholder="Example: Weekend ₱100 off"
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5 placeholder:text-[#9aaa9f]"
                                    />
                                </label>
                                <label className="text-sm font-semibold">
                                    Code (blank generates one)
                                    <input
                                        value={form.data.code}
                                        onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                        placeholder="Example: BSAB100"
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5 uppercase placeholder:text-[#9aaa9f]"
                                    />
                                </label>
                                <label className="text-sm font-semibold">
                                    Voucher type
                                    <select
                                        value={form.data.type}
                                        onChange={(e) => form.setData('type', e.target.value)}
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5"
                                    >
                                        <option value="fixed">Fixed amount</option>
                                        <option value="percentage">Percentage</option>
                                        <option value="free_shipping">Free shipping</option>
                                    </select>
                                </label>
                                <label className="text-sm font-semibold">
                                    Discount value
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        disabled={form.data.type === 'free_shipping'}
                                        value={form.data.discount_value}
                                        onChange={(e) => form.setData('discount_value', e.target.value)}
                                        placeholder={form.data.type === 'percentage' ? 'Example: 10' : 'Example: 100'}
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5 placeholder:text-[#9aaa9f] disabled:bg-[#edf2ed]"
                                    />
                                </label>
                                <label className="text-sm font-semibold">
                                    Minimum spend
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.data.minimum_spend}
                                        onChange={(e) => form.setData('minimum_spend', e.target.value)}
                                        placeholder="Example: 500"
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5 placeholder:text-[#9aaa9f]"
                                    />
                                </label>
                                <label className="text-sm font-semibold">
                                    Maximum discount
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.data.maximum_discount}
                                        onChange={(e) => form.setData('maximum_discount', e.target.value)}
                                        placeholder="Example: 300"
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5 placeholder:text-[#9aaa9f]"
                                    />
                                </label>
                                <label className="text-sm font-semibold">
                                    Apply to
                                    <select
                                        value={form.data.apply_to}
                                        onChange={(e) => form.setData('apply_to', e.target.value)}
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5"
                                    >
                                        <option value="all">All products</option>
                                        <option value="categories">Selected categories</option>
                                        <option value="products">Selected products</option>
                                        <option value="variants">Selected variants</option>
                                        <option value="sellers">Selected seller/store</option>
                                    </select>
                                </label>
                                <label className="text-sm font-semibold">
                                    Customer eligibility
                                    <select
                                        value={form.data.customer_eligibility}
                                        onChange={(e) => form.setData('customer_eligibility', e.target.value)}
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5"
                                    >
                                        <option value="all">All customers</option>
                                        <option value="new_customer">New customers</option>
                                        <option value="first_order">First order</option>
                                    </select>
                                </label>
                                <label className="text-sm font-semibold">
                                    Starts at
                                    <input
                                        type="datetime-local"
                                        value={form.data.starts_at}
                                        onChange={(e) => form.setData('starts_at', e.target.value)}
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5"
                                    />
                                    <span className="mt-1 block text-xs font-normal text-[#819086]">Example: Sep 30, 2026 at 9:00 AM</span>
                                </label>
                                <label className="text-sm font-semibold">
                                    Expires at
                                    <input
                                        type="datetime-local"
                                        value={form.data.expires_at}
                                        onChange={(e) => form.setData('expires_at', e.target.value)}
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5"
                                    />
                                    <span className="mt-1 block text-xs font-normal text-[#819086]">Example: Oct 31, 2026 at 11:59 PM</span>
                                </label>
                                <label className="text-sm font-semibold">
                                    Total usage limit
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.data.total_usage_limit}
                                        onChange={(e) => form.setData('total_usage_limit', e.target.value)}
                                        placeholder="Example: 1000"
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5 placeholder:text-[#9aaa9f]"
                                    />
                                </label>
                                <label className="text-sm font-semibold">
                                    Per-customer usage limit
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.data.per_customer_usage_limit}
                                        onChange={(e) => form.setData('per_customer_usage_limit', e.target.value)}
                                        placeholder="Example: 1"
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5 placeholder:text-[#9aaa9f]"
                                    />
                                </label>
                                <label className="text-sm font-semibold">
                                    Claim limit
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.data.claim_limit}
                                        onChange={(e) => form.setData('claim_limit', e.target.value)}
                                        placeholder="Example: 500"
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5 placeholder:text-[#9aaa9f]"
                                    />
                                </label>
                                {isAdmin && (
                                    <label className="text-sm font-semibold">
                                        Seller/store
                                        <select
                                            value={form.data.seller_id}
                                            onChange={(e) => form.setData('seller_id', e.target.value)}
                                            className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5"
                                        >
                                            <option value="">Platform voucher</option>
                                            {sellers.map((seller) => (
                                                <option key={seller.id} value={seller.id}>
                                                    {seller.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                )}
                                {form.data.apply_to === 'categories' && (
                                    <fieldset className="rounded-xl border border-[#dcebe0] bg-white p-4 sm:col-span-2">
                                        <legend className="px-1 text-sm font-bold">Eligible categories</legend>
                                        <div className="grid gap-2 sm:grid-cols-3">
                                            {categories.map((category) => (
                                                <label key={category.id} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.data.category_ids.includes(category.id)}
                                                        onChange={() => toggleTarget('category_ids', category.id)}
                                                    />
                                                    {category.name}
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                )}
                                {form.data.apply_to === 'sellers' && (
                                    <fieldset className="rounded-xl border border-[#dcebe0] bg-white p-4 sm:col-span-2">
                                        <legend className="px-1 text-sm font-bold">Eligible sellers / stores</legend>
                                        <div className="grid gap-2 sm:grid-cols-3">
                                            {(isAdmin ? sellers : shop ? [shop] : []).map((seller) => (
                                                <label key={seller.id} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={form.data.seller_ids.includes(seller.id)}
                                                        onChange={() => toggleTarget('seller_ids', seller.id)}
                                                    />
                                                    {seller.name}
                                                </label>
                                            ))}
                                        </div>
                                    </fieldset>
                                )}
                                {(form.data.apply_to === 'products' || form.data.apply_to === 'variants') && (
                                    <fieldset className="rounded-xl border border-[#dcebe0] bg-white p-4 sm:col-span-2">
                                        <legend className="px-1 text-sm font-bold">
                                            {form.data.apply_to === 'products' ? 'Select products' : 'Select product variants'}
                                        </legend>
                                        <div className="mb-3 grid gap-2 sm:grid-cols-3">
                                            <input
                                                value={productSearch}
                                                onChange={(e) => setProductSearch(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchProducts())}
                                                placeholder="Search products"
                                                className="rounded-lg border border-[#dcebe0] px-3 py-2 text-sm"
                                            />
                                            <select
                                                value={categoryFilter}
                                                onChange={(e) => {
                                                    setCategoryFilter(e.target.value);
                                                    searchProducts(productSearch, e.target.value);
                                                }}
                                                className="rounded-lg border border-[#dcebe0] px-3 py-2 text-sm"
                                            >
                                                <option value="">All categories</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {isAdmin && (
                                                <select
                                                    value={productSellerFilter}
                                                    onChange={(e) => {
                                                        setProductSellerFilter(e.target.value);
                                                        searchProducts(productSearch, categoryFilter, 1, e.target.value);
                                                    }}
                                                    className="rounded-lg border border-[#dcebe0] px-3 py-2 text-sm"
                                                >
                                                    <option value="">All sellers</option>
                                                    {sellers.map((seller) => (
                                                        <option key={seller.id} value={seller.id}>
                                                            {seller.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                        <div className="max-h-64 divide-y overflow-y-auto">
                                            {targetProducts.data.map((product) => (
                                                <div key={product.id} className="py-2.5">
                                                    <label className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={form.data.product_ids.includes(product.id)}
                                                            disabled={form.data.apply_to === 'variants'}
                                                            onChange={() => toggleTarget('product_ids', product.id)}
                                                        />
                                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#e6f7eb]">
                                                            {product.images?.[0]?.path ? (
                                                                <img
                                                                    alt=""
                                                                    className="h-full w-full object-cover"
                                                                    src={
                                                                        product.images[0].path.startsWith('http') ||
                                                                        product.images[0].path.startsWith('/')
                                                                            ? product.images[0].path
                                                                            : `/storage/${product.images[0].path}`
                                                                    }
                                                                />
                                                            ) : (
                                                                <TicketPercent size={17} />
                                                            )}
                                                        </span>
                                                        <span className="min-w-0 flex-1">
                                                            <b className="block truncate text-sm">{product.name}</b>
                                                            <span className="block text-xs text-[#647568]">
                                                                {money(product.sale_price ?? product.base_price)} ·{' '}
                                                                {product.category?.name ?? 'Uncategorized'} · {product.shop?.name} ·{' '}
                                                                {product.stock_quantity > 0 ? 'In stock' : 'Out of stock'}
                                                            </span>
                                                        </span>
                                                    </label>
                                                    {form.data.apply_to === 'variants' && (
                                                        <div className="mt-2 ml-8 grid gap-2 sm:grid-cols-2">
                                                            {(product.variants ?? []).map((variant) => (
                                                                <label key={variant.id} className="flex items-center gap-2 text-xs text-[#52665a]">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={form.data.variant_ids.includes(variant.id)}
                                                                        onChange={() =>
                                                                            form.setData(
                                                                                'variant_ids',
                                                                                form.data.variant_ids.includes(variant.id)
                                                                                    ? form.data.variant_ids.filter((id) => id !== variant.id)
                                                                                    : [...form.data.variant_ids, variant.id],
                                                                            )
                                                                        }
                                                                    />
                                                                    {variant.name} · {variant.stock_quantity} in stock
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-3 flex items-center justify-between text-xs">
                                            <span>
                                                {form.data.apply_to === 'products'
                                                    ? `${form.data.product_ids.length} selected`
                                                    : `${form.data.variant_ids.length} selected`}{' '}
                                                · {targetProducts.total} products
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        form.setData('product_ids', [
                                                            ...new Set([
                                                                ...form.data.product_ids,
                                                                ...targetProducts.data.map((product) => product.id),
                                                            ]),
                                                        ])
                                                    }
                                                    className="text-[#1f7a42]"
                                                >
                                                    Select page
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        form.setData('product_ids', []);
                                                        form.setData('variant_ids', []);
                                                    }}
                                                    className="text-[#1f7a42]"
                                                >
                                                    Deselect all
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={targetProducts.current_page >= targetProducts.last_page}
                                                    onClick={() => searchProducts(productSearch, categoryFilter, targetProducts.current_page + 1)}
                                                    className="text-[#1f7a42]"
                                                >
                                                    Next page
                                                </button>
                                            </div>
                                        </div>
                                    </fieldset>
                                )}
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.data.requires_claim}
                                        onChange={(e) => form.setData('requires_claim', e.target.checked)}
                                    />
                                    Requires claim before use
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.data.is_active}
                                        onChange={(e) => form.setData('is_active', e.target.checked)}
                                    />
                                    Active immediately
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.data.free_shipping}
                                        onChange={(e) => form.setData('free_shipping', e.target.checked)}
                                    />
                                    Includes free shipping
                                </label>
                                <label className="text-sm font-semibold sm:col-span-2">
                                    Description
                                    <textarea
                                        value={form.data.description}
                                        onChange={(e) => form.setData('description', e.target.value)}
                                        placeholder="Example: Save on your next marketplace order."
                                        rows={2}
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5 placeholder:text-[#9aaa9f]"
                                    />
                                </label>
                                <label className="text-sm font-semibold sm:col-span-2">
                                    Terms and conditions
                                    <textarea
                                        value={form.data.terms}
                                        onChange={(e) => form.setData('terms', e.target.value)}
                                        placeholder="Example: One use per customer. Valid until the expiry date."
                                        rows={2}
                                        className="mt-1.5 w-full rounded-lg border border-[#dcebe0] bg-white px-3 py-2.5 placeholder:text-[#9aaa9f]"
                                    />
                                </label>
                            </div>
                            <footer className="flex justify-end gap-2 border-t border-[#dcebe0] bg-white px-5 py-4 sm:px-7">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="rounded-lg border border-[#dcebe0] px-4 py-2 text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={form.processing}
                                    className="rounded-lg bg-[#1f7a42] px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
                                >
                                    {form.processing ? 'Saving…' : editing ? 'Save changes' : 'Create voucher'}
                                </button>
                            </footer>
                        </form>
                    </div>
                )}
            </PortalLayout>
        </>
    );
}
