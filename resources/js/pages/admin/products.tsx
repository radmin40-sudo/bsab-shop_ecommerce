import { PortalLayout } from '@/components/portal-layout';
import { Head, router } from '@inertiajs/react';
import {
    Check,
    CheckCheck,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Eye,
    FileText,
    Image as ImageIcon,
    Package,
    Search,
    ShieldCheck,
    Tags,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type Product = {
    id: number;
    name: string;
    sku: string;
    status: string;
    base_price: string | number;
    stock_quantity: number;
    created_at: string;
    images?: { path: string; is_primary: boolean }[];
    shop?: { name: string } | null;
    category?: { name: string } | null;
    variants?: { name: string; stock_quantity: number }[];
    options?: { name: string; values?: { value: string }[] }[];
};

type ProductMetrics = {
    total: number;
    published: number;
    pending: number;
    drafts: number;
    addedThisMonth: number;
};

type SortKey = 'newest' | 'oldest' | 'name' | 'price' | 'stock';
type StatusFilter = 'all' | 'published' | 'pending' | 'draft' | 'rejected';
type StockFilter = 'all' | 'in_stock' | 'out_of_stock' | 'low_stock';

function money(value: number | string) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(Number(value) || 0);
}

function statusClass(status: string) {
    if (status === 'published') return 'bg-[#e2f7ed] text-[#21834d]';
    if (status === 'rejected') return 'bg-[#fff0ed] text-[#bf4b3c]';
    if (status === 'draft') return 'bg-[#edf2f0] text-[#617168]';
    return 'bg-[#fff1c2] text-[#90660d]';
}

function Trend({ values, positive = true }: { values: number[]; positive?: boolean }) {
    const max = Math.max(...values, 1);
    const coords = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * 100},${27 - (value / max) * 22}`).join(' ');

    return (
        <div className="flex min-w-0 items-center gap-2">
            <svg viewBox="0 0 100 30" className="h-7 w-[68px] shrink-0" aria-hidden="true">
                <polyline points={coords} fill="none" stroke={positive ? '#29a66a' : '#d39b32'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={`0,30 ${coords} 100,30`} fill={positive ? '#c9f0dd' : '#fff0c7'} fillOpacity=".55" stroke="none" />
            </svg>
            <span className={`whitespace-nowrap text-[9px] font-semibold ${positive ? 'text-[#278b55]' : 'text-[#a8771a]'}`}>
                {positive ? '↑' : '•'} {values.at(-1) ?? 0} this month
            </span>
        </div>
    );
}

function ProductImage({ product, className = 'h-11 w-11' }: { product: Product; className?: string }) {
    const image = product.images?.find((item) => item.is_primary) ?? product.images?.[0];
    const src = image?.path
        ? image.path.startsWith('http') || image.path.startsWith('/') ? image.path : `/storage/${image.path}`
        : null;

    return (
        <span className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#edf6f0] text-[#347d54] ${className}`}>
            {src ? <img src={src} alt={product.name} className="h-full w-full object-cover" /> : <ImageIcon size={17} />}
        </span>
    );
}

export default function AdminProducts({
    products,
    metrics,
    categories,
}: {
    products: Product[];
    metrics: ProductMetrics;
    categories: string[];
}) {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');
    const [status, setStatus] = useState<StatusFilter>('all');
    const [stock, setStock] = useState<StockFilter>('all');
    const [sort, setSort] = useState<SortKey>('newest');
    const [page, setPage] = useState(1);
    const [selected, setSelected] = useState<number[]>([]);
    const [viewing, setViewing] = useState<Product | null>(null);
    const pageSize = 8;
    const pending = products.filter((product) => product.status === 'pending');

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLowerCase();
        return products.filter((product) => {
            const matchesSearch = !query || [product.name, product.sku, product.shop?.name, product.category?.name].some((value) => value?.toLowerCase().includes(query));
            const matchesCategory = category === 'all' || product.category?.name === category;
            const matchesStatus = status === 'all' || product.status === status;
            const matchesStock = stock === 'all'
                || (stock === 'in_stock' && product.stock_quantity > 0)
                || (stock === 'out_of_stock' && product.stock_quantity <= 0)
                || (stock === 'low_stock' && product.stock_quantity > 0 && product.stock_quantity < 5);
            return matchesSearch && matchesCategory && matchesStatus && matchesStock;
        }).sort((a, b) => {
            if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            if (sort === 'name') return a.name.localeCompare(b.name);
            if (sort === 'price') return Number(a.base_price) - Number(b.base_price);
            if (sort === 'stock') return a.stock_quantity - b.stock_quantity;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }, [products, search, category, status, stock, sort]);

    const pageCount = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const visibleProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const allVisibleSelected = visibleProducts.length > 0 && visibleProducts.every((product) => selected.includes(product.id));

    const update = (product: Product, nextStatus: 'published' | 'rejected') => {
        router.patch(route('admin.products.update', product.id), { status: nextStatus }, { preserveScroll: true });
    };
    const approveSelected = () => {
        const ids = selected.filter((id) => pending.some((product) => product.id === id));
        if (ids.length) {
            router.patch(route('admin.products.approve-selected'), { product_ids: ids }, {
                preserveScroll: true,
                onSuccess: () => setSelected([]),
            });
        }
    };
    const approveAll = () => {
        router.patch(route('admin.products.approve-all'), {}, { preserveScroll: true });
    };
    const toggleSelected = (id: number) => {
        setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    };
    const setAllVisible = () => {
        setSelected((current) => allVisibleSelected
            ? current.filter((id) => !visibleProducts.some((product) => product.id === id))
            : [...new Set([...current, ...visibleProducts.map((product) => product.id)])]);
    };

    return (
        <>
            <Head title="Product Management" />
            <PortalLayout role="admin" title="Product moderation" eyebrow="Catalog operations">
                <div className="mb-4 flex min-w-0 flex-col justify-between gap-3 sm:mb-5 sm:flex-row sm:items-end">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#16834b]">‹ &nbsp; Products</p>
                        <h1 className="mt-1 text-2xl leading-tight font-bold tracking-tight text-[#174c3e] sm:text-[29px]">Product Management</h1>
                        <p className="mt-1 text-xs leading-5 text-[#6a7c70]">Manage your product catalog, approval status, and inventory.</p>
                    </div>
                    <a href="#product-catalog" className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#188747] px-4 text-xs font-semibold text-white transition hover:bg-[#126d39] sm:w-auto">
                        <span className="text-base leading-none">+</span> Add product
                    </a>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: 'Total products', value: metrics.total, detail: `${metrics.addedThisMonth} added this month`, Icon: Package, values: [1, 2, 2, 4, 3, 5, 6], positive: true },
                        { label: 'Published', value: metrics.published, detail: 'Live in the storefront', Icon: Eye, values: [1, 2, 3, 3, 4, 5, 6], positive: true },
                        { label: 'Awaiting approval', value: metrics.pending, detail: 'Not published yet', Icon: Clock3, values: [5, 4, 4, 3, 3, 2, metrics.pending], positive: false },
                        { label: 'Drafts', value: metrics.drafts, detail: 'Seller work in progress', Icon: FileText, values: [1, 1, 2, 2, 1, 1, metrics.drafts], positive: true },
                    ].map(({ label, value, detail, Icon, values, positive }) => (
                        <div key={label} className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e4ebe6] bg-white p-3.5 shadow-[0_3px_13px_rgba(31,70,48,0.045)]">
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${label === 'Awaiting approval' ? 'bg-[#fff6df] text-[#aa7817]' : 'bg-[#eaf6ef] text-[#258553]'}`}><Icon size={18} /></span>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[10px] font-medium text-[#607166]">{label}</p>
                                <p className="mt-0.5 text-xl leading-none font-bold text-[#1c4b3d]">{value}</p>
                                <p className="mt-1 truncate text-[9px] text-[#829087]">{detail}</p>
                            </div>
                            <div className="hidden min-w-0 flex-col items-end gap-1.5 sm:flex"><Trend values={values} positive={positive} /><span className="rounded-full bg-[#fff5d9] px-2 py-0.5 text-[8px] font-semibold text-[#a87617]">{label === 'Awaiting approval' ? 'Not published yet' : label === 'Drafts' ? 'Seller work in progress' : ''}</span></div>
                        </div>
                    ))}
                </div>

                <section className="mt-3 overflow-hidden rounded-xl border border-[#e4ebe6] bg-white shadow-[0_3px_13px_rgba(31,70,48,0.045)]">
                    <div className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
                        <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf6ef] text-[#258553]"><ShieldCheck size={22} /></span>
                            <div>
                                <h2 className="text-sm font-bold text-[#25372c]">Moderation queue</h2>
                                <p className="mt-0.5 text-[10px] text-[#7d8b82]">Approve products before customers can buy them.</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            disabled={!pending.length}
                            onClick={approveAll}
                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#188747] px-4 text-[10px] font-semibold text-white transition hover:bg-[#126d39] disabled:cursor-not-allowed disabled:bg-[#e5ece7] disabled:text-[#8b998d]"
                        >
                            <CheckCheck size={14} /> Approve all products
                        </button>
                    </div>
                    <div className="overflow-x-auto px-3 pb-3 sm:px-4">
                        <table className="w-full min-w-[720px] text-left text-[10px]">
                            <thead className="bg-[#eff8f3] text-[9px] font-semibold tracking-wide text-[#6a8a78] uppercase">
                                <tr>
                                    <th className="px-3 py-2">Image</th><th className="px-3 py-2">Product</th><th className="px-3 py-2">Shop</th><th className="px-3 py-2">Category</th><th className="px-3 py-2">Status</th><th className="px-3 py-2 text-right">Decision</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf1ee]">
                                {pending.length ? pending.slice(0, 5).map((product) => (
                                    <tr key={product.id} className="hover:bg-[#fbfdfb]">
                                        <td className="px-3 py-2"><ProductImage product={product} className="h-10 w-10" /></td>
                                        <td className="max-w-52 px-3 py-2"><p className="truncate font-semibold text-[#34493c]">{product.name}</p><p className="mt-0.5 truncate text-[8px] text-[#89968e]">{product.sku}</p></td>
                                        <td className="max-w-36 truncate px-3 py-2 text-[#64746a]">{product.shop?.name ?? 'Unknown shop'}</td>
                                        <td className="px-3 py-2 text-[#64746a]">{product.category?.name ?? 'Uncategorized'}</td>
                                        <td className="px-3 py-2"><span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold capitalize ${statusClass(product.status)}`}>{product.status}</span></td>
                                        <td className="px-3 py-2"><div className="flex justify-end gap-1.5">
                                            <button type="button" onClick={() => update(product, 'published')} className="inline-flex h-7 items-center gap-1 rounded-md border border-[#cce7d5] px-2.5 text-[9px] font-semibold text-[#27844f] hover:bg-[#edf8f1]"><Check size={12} /> Approve</button>
                                            <button type="button" onClick={() => update(product, 'rejected')} className="inline-flex h-7 items-center gap-1 rounded-md border border-[#f3d5d0] px-2.5 text-[9px] font-semibold text-[#c24e43] hover:bg-[#fff4f2]"><X size={12} /> Reject</button>
                                        </div></td>
                                    </tr>
                                )) : <tr><td colSpan={6} className="py-7 text-center text-[10px] text-[#819087]"><CheckCheck size={17} className="mx-auto mb-1 text-[#3c9661]" />No products are waiting for approval.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section id="product-catalog" className="mt-3 overflow-hidden rounded-xl border border-[#e4ebe6] bg-white shadow-[0_3px_13px_rgba(31,70,48,0.045)]">
                    <div className="flex flex-col gap-2.5 border-b border-[#edf1ee] p-3 sm:flex-row sm:flex-wrap sm:items-center sm:p-4">
                        <label className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#dce5df] bg-white px-2.5 focus-within:border-[#2a8b52] sm:min-w-48">
                            <Search size={14} className="shrink-0 text-[#748279]" />
                            <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search products..." className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-[#99a39d]" />
                        </label>
                        <FilterSelect label="All Categories" value={category} options={[['all', 'All Categories'], ...categories.map((item) => [item, item] as [string, string])]} onChange={(value) => { setCategory(value); setPage(1); }} />
                        <FilterSelect label="All Status" value={status} options={[['all', 'All Status'], ['published', 'Published'], ['pending', 'Pending'], ['draft', 'Draft'], ['rejected', 'Rejected']]} onChange={(value) => { setStatus(value as StatusFilter); setPage(1); }} />
                        <FilterSelect label="All Stock" value={stock} options={[['all', 'All Stock'], ['in_stock', 'In stock'], ['low_stock', 'Low stock (<5)'], ['out_of_stock', 'Out of stock']]} onChange={(value) => { setStock(value as StockFilter); setPage(1); }} />
                        {selected.length > 0 && <button type="button" onClick={approveSelected} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-[#e8f5ec] px-3 text-[10px] font-semibold text-[#27834d] hover:bg-[#dff0e5]"><CheckCheck size={13} /> Approve selected ({selected.length})</button>}
                        <label className="flex h-9 items-center gap-2 rounded-lg border border-[#dce5df] bg-white px-3 text-[10px] text-[#64746a] sm:ml-auto">
                            <span className="whitespace-nowrap">Sort by:</span><select value={sort} onChange={(event) => { setSort(event.target.value as SortKey); setPage(1); }} className="max-w-32 bg-transparent outline-none"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="name">Name</option><option value="price">Price</option><option value="stock">Stock</option></select><ChevronDown size={12} />
                        </label>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-left text-[9px]">
                            <thead className="border-b border-[#edf1ee] text-[#7a8d82]">
                                <tr>
                                    <th className="w-8 px-3 py-2"><input aria-label="Select all visible products" type="checkbox" checked={allVisibleSelected} onChange={setAllVisible} className="accent-[#21874f]" /></th>
                                    <th className="px-2 py-2 font-medium">Image</th><th className="px-2 py-2 font-medium">Product Name</th><th className="px-2 py-2 font-medium">SKU</th><th className="px-2 py-2 font-medium">Shop</th><th className="px-2 py-2 font-medium">Category</th><th className="px-2 py-2 font-medium">Variant</th><th className="px-2 py-2 text-right font-medium">Price</th><th className="px-2 py-2 text-center font-medium">Stock</th><th className="px-2 py-2 text-center font-medium">Status</th><th className="px-3 py-2 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf1ee]">
                                {visibleProducts.map((product) => {
                                    const variantSummary = product.options?.map((option) => {
                                        const values = option.values?.map((item) => item.value).filter(Boolean) ?? [];
                                        return values.length ? `${option.name}: ${values.slice(0, 3).join(', ')}` : '';
                                    }).filter(Boolean).slice(0, 2).join('; ') || product.variants?.slice(0, 2).map((variant) => variant.name).join(', ') || '—';

                                    return (
                                        <tr key={product.id} className="hover:bg-[#fbfdfb]">
                                            <td className="px-3 py-2.5"><input aria-label={`Select ${product.name}`} type="checkbox" checked={selected.includes(product.id)} onChange={() => toggleSelected(product.id)} className="accent-[#21874f]" /></td>
                                            <td className="px-2 py-2.5"><ProductImage product={product} className="h-10 w-10 rounded-md" /></td>
                                            <td className="max-w-36 px-2 py-2.5"><p className="truncate font-semibold text-[#34493c]">{product.name}</p><p className="mt-0.5 text-[8px] text-[#89968e]">Product #{product.id}</p></td>
                                            <td className="max-w-32 px-2 py-2.5"><span className="block truncate text-[#78877e]">{product.sku}</span></td>
                                            <td className="max-w-28 px-2 py-2.5"><span className="block truncate text-[#64746a]">{product.shop?.name ?? 'Unknown shop'}</span></td>
                                            <td className="max-w-24 px-2 py-2.5 text-[#64746a]">{product.category?.name ?? 'Uncategorized'}</td>
                                            <td className="max-w-36 px-2 py-2.5"><span className="line-clamp-2 text-[#64746a]">{variantSummary}</span></td>
                                            <td className="px-2 py-2.5 text-right font-semibold text-[#405449]">{money(product.base_price)}</td>
                                            <td className="px-2 py-2.5 text-center text-[#64746a]">{product.stock_quantity}</td>
                                            <td className="px-2 py-2.5 text-center"><span className={`inline-flex rounded-full px-2.5 py-1 text-[8px] font-semibold capitalize ${statusClass(product.status)}`}>{product.status}</span></td>
                                            <td className="px-3 py-2.5"><div className="flex justify-end gap-1.5">
                                                <button type="button" aria-label={`View ${product.name}`} title="View details" onClick={() => setViewing(product)} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dbe9df] text-[#328152] hover:bg-[#edf8f1]"><Eye size={13} /></button>
                                                {product.status !== 'published' && <button type="button" aria-label={`Approve ${product.name}`} title="Approve product" onClick={() => update(product, 'published')} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dbe9df] text-[#328152] hover:bg-[#edf8f1]"><Check size={13} /></button>}
                                                {product.status !== 'rejected' && <button type="button" aria-label={`Reject ${product.name}`} title="Reject product" onClick={() => update(product, 'rejected')} className="flex h-7 w-7 items-center justify-center rounded-md border border-[#f1ddda] text-[#bd5144] hover:bg-[#fff4f2]"><X size={13} /></button>}
                                            </div></td>
                                        </tr>
                                    );
                                })}
                                {visibleProducts.length === 0 && <tr><td colSpan={11} className="py-12 text-center text-[10px] text-[#819087]"><Package size={18} className="mx-auto mb-1 text-[#83a18d]" />No products match these filters.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col gap-2 border-t border-[#edf1ee] px-3 py-2.5 text-[9px] text-[#748279] sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <p>Showing {filteredProducts.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} products</p>
                        <div className="flex items-center justify-between gap-1 sm:justify-end">
                            <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[#6e7e74] hover:bg-[#f3f8f4] disabled:opacity-40"><ChevronLeft size={13} /> Previous</button>
                            <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-[#188747] px-2 font-semibold text-white">{currentPage}</span>
                            <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[#6e7e74] hover:bg-[#f3f8f4] disabled:opacity-40">Next <ChevronRight size={13} /></button>
                        </div>
                    </div>
                </section>

                {viewing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10271b]/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewing(null); }}>
                        <section role="dialog" aria-modal="true" aria-labelledby="product-details-title" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[#e4ebe6] bg-white shadow-2xl">
                            <div className="flex items-start justify-between border-b border-[#edf1ee] p-4">
                                <div><h2 id="product-details-title" className="text-base font-bold text-[#26382d]">Product details</h2><p className="mt-1 text-[10px] text-[#7c8981]">Catalog record #{viewing.id}</p></div>
                                <button type="button" aria-label="Close product details" onClick={() => setViewing(null)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8e4] text-[#68766d]"><X size={15} /></button>
                            </div>
                            <div className="space-y-4 p-4">
                                <div className="flex items-center gap-3 rounded-lg bg-[#f8fbf9] p-3">
                                    <ProductImage product={viewing} className="h-16 w-16 rounded-md" />
                                    <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#314438]">{viewing.name}</p><p className="mt-1 text-[10px] text-[#7e8982]">{viewing.sku}</p></div>
                                </div>
                                <div className="grid gap-2 sm:grid-cols-2">
                                    {[
                                        ['Shop', viewing.shop?.name ?? 'Unknown shop'],
                                        ['Category', viewing.category?.name ?? 'Uncategorized'],
                                        ['Price', money(viewing.base_price)],
                                        ['Available stock', String(viewing.stock_quantity)],
                                        ['Status', viewing.status],
                                        ['Created', new Date(viewing.created_at).toLocaleDateString()],
                                    ].map(([label, value]) => <div key={label} className="rounded-lg border border-[#edf1ee] p-2.5"><p className="text-[9px] font-semibold uppercase text-[#89948d]">{label}</p><p className="mt-1 break-words text-[11px] text-[#36483d]">{value}</p></div>)}
                                </div>
                                <div className="flex justify-end gap-2 border-t border-[#edf1ee] pt-3">
                                    {viewing.status === 'pending' && <button type="button" onClick={() => { update(viewing, 'published'); setViewing(null); }} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#188747] px-3 text-[10px] font-semibold text-white"><Check size={13} /> Approve</button>}
                                    {viewing.status !== 'rejected' && <button type="button" onClick={() => { update(viewing, 'rejected'); setViewing(null); }} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#f1ddda] px-3 text-[10px] font-semibold text-[#bd5144]"><X size={13} /> Reject</button>}
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </PortalLayout>
        </>
    );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void }) {
    return (
        <label className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-[#dce5df] bg-white px-2.5 text-[10px] text-[#526157] sm:min-w-[132px]">
            <span className="sr-only">{label}</span>
            {label === 'All Categories' ? <Tags size={13} className="shrink-0 text-[#577963]" /> : label === 'All Status' ? <ShieldCheck size={13} className="shrink-0 text-[#577963]" /> : <Package size={13} className="shrink-0 text-[#577963]" />}
            <select value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 appearance-none bg-transparent outline-none">
                {options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}
            </select>
            <ChevronDown size={12} className="shrink-0 text-[#7a8d82]" />
        </label>
    );
}
