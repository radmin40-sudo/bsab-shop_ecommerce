import { PortalLayout } from '@/components/portal-layout';
import { Head, useForm } from '@inertiajs/react';
import { optimizeImage } from '@/lib/image-upload';
import {
    BriefcaseBusiness,
    BookOpen,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Grid2X2,
    HeartPulse,
    House,
    ImagePlus,
    Laptop,
    Pencil,
    Plus,
    Search,
    ShoppingBasket,
    Shirt,
    Tags,
    Trash2,
    UsersRound,
    Volleyball,
    X,
} from 'lucide-react';
import type { FormEventHandler } from 'react';
import { useMemo, useState } from 'react';

type Category = {
    id: number;
    name: string;
    slug: string;
    image?: string | null;
    parent?: { id: number; name: string } | null;
    products_count: number;
};
type CategoryForm = { name: string; slug: string; parent_id: string; image: File | null };
const empty: CategoryForm = { name: '', slug: '', parent_id: '', image: null };
const pageSize = 9;

const categoryVisuals: Record<string, { Icon: typeof Tags; iconClass: string; tileClass: string }> = {
    beauty: { Icon: HeartPulse, iconClass: 'text-[#df7180]', tileClass: 'bg-[#fff0f2]' },
    books: { Icon: BookOpen, iconClass: 'text-[#3379ae]', tileClass: 'bg-[#edf5ff]' },
    electronics: { Icon: Laptop, iconClass: 'text-[#456577]', tileClass: 'bg-[#eef4f6]' },
    fashion: { Icon: Shirt, iconClass: 'text-[#3988bd]', tileClass: 'bg-[#eff7ff]' },
    groceries: { Icon: ShoppingBasket, iconClass: 'text-[#208b67]', tileClass: 'bg-[#eaf8f1]' },
    health: { Icon: HeartPulse, iconClass: 'text-[#20a270]', tileClass: 'bg-[#eaf8f1]' },
    home: { Icon: House, iconClass: 'text-[#236749]', tileClass: 'bg-[#eaf6ef]' },
    office: { Icon: BriefcaseBusiness, iconClass: 'text-[#236749]', tileClass: 'bg-[#eaf6ef]' },
    sports: { Icon: Volleyball, iconClass: 'text-[#ef762d]', tileClass: 'bg-[#fff3e9]' },
};

function categoryVisual(name: string) {
    return categoryVisuals[name.toLowerCase()] ?? { Icon: Tags, iconClass: 'text-[#278451]', tileClass: 'bg-[#eaf6ef]' };
}

function slugify(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function CategoryIcon({ category }: { category: Category }) {
    const visual = categoryVisual(category.name);
    const Icon = visual.Icon;
    return (
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg ${visual.tileClass} ${visual.iconClass}`}>
            {category.image
                ? <img src={category.image.startsWith('http') || category.image.startsWith('/') ? category.image : `/storage/${category.image}`} alt="" className="h-full w-full object-cover" />
                : <Icon size={16} strokeWidth={2.3} />}
        </span>
    );
}

function StatCard({ label, value, detail, Icon }: { label: string; value: number; detail: string; Icon: typeof Tags }) {
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

export default function Categories({ categories }: { categories: Category[] }) {
    const [editing, setEditing] = useState<Category | null>(null);
    const [open, setOpen] = useState(false);
    const [deleting, setDeleting] = useState<Category | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const form = useForm<CategoryForm>(empty);
    const deleteForm = useForm({});

    const filteredCategories = useMemo(() => {
        const query = search.trim().toLowerCase();
        return categories.filter((category) => !query || category.name.toLowerCase().includes(query) || category.slug.toLowerCase().includes(query));
    }, [categories, search]);
    const pageCount = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
    const currentPage = Math.min(page, pageCount);
    const visibleCategories = filteredCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    const productCount = categories.reduce((sum, category) => sum + category.products_count, 0);
    const rootCount = categories.filter((category) => !category.parent).length;

    const show = (category?: Category) => {
        setEditing(category ?? null);
        setOpen(true);
        form.setData(category
            ? { name: category.name, slug: category.slug, parent_id: String(category.parent?.id ?? ''), image: null }
            : empty);
        form.clearErrors();
    };
    const closeForm = () => {
        setOpen(false);
        setEditing(null);
        form.reset();
        form.clearErrors();
    };
    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: closeForm,
        };
        if (editing) {
            form.post(`/admin/categories/${editing.id}`, options);
        } else {
            form.post(route('admin.categories.store'), options);
        }
    };
    const deleteCategory = () => {
        if (!deleting) return;
        deleteForm.delete(`/admin/categories/${deleting.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleting(null),
        });
    };

    return (
        <>
            <Head title="Categories" />
            <PortalLayout role="admin" title="Categories" eyebrow="Category management">
                <div className="mb-4 flex min-w-0 flex-col justify-between gap-3 sm:mb-5 sm:flex-row sm:items-end">
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#16834b]">‹ &nbsp; Categories</p>
                        <h1 className="mt-1 text-2xl leading-tight font-bold tracking-tight text-[#174c3e] sm:text-[29px]">Categories</h1>
                        <p className="mt-1 text-xs leading-5 text-[#6a7c70]">Organize products into storefront categories.</p>
                    </div>
                    <button type="button" onClick={() => show()} className="inline-flex h-9 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#188747] px-4 text-xs font-semibold text-white transition hover:bg-[#126d39] sm:w-auto">
                        <Plus size={15} /> Add category
                    </button>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Categories" value={categories.length} detail="Across the marketplace" Icon={Grid2X2} />
                    <StatCard label="Category groups" value={rootCount} detail="Organized storefront groups" Icon={UsersRound} />
                    <StatCard label="Products assigned" value={productCount} detail="Across all categories" Icon={ShoppingBasket} />
                    <StatCard label="Root categories" value={rootCount} detail="Top-level categories" Icon={Tags} />
                </div>

                <section className="mt-3 overflow-hidden rounded-xl border border-[#e4ebe6] bg-white shadow-[0_3px_13px_rgba(31,70,48,0.045)]">
                    <div className="flex flex-col justify-between gap-3 border-b border-[#edf1ee] p-3.5 sm:flex-row sm:items-center sm:p-4">
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-[#25372c]">Category groups</h2>
                            <p className="mt-0.5 text-[9px] text-[#7d8b82]">Organize products into storefront categories.</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <label className="flex h-9 min-w-0 items-center gap-2 rounded-lg border border-[#dce5df] bg-white px-2.5 focus-within:border-[#2a8b52] sm:w-48">
                                <Search size={14} className="shrink-0 text-[#748279]" />
                                <input
                                    value={search}
                                    onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                                    placeholder="Search categories..."
                                    aria-label="Search categories..."
                                    className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-[#99a39d]"
                                />
                                {search && <button type="button" onClick={() => { setSearch(''); setPage(1); }} aria-label="Clear search" className="text-[#829087]"><X size={13} /></button>}
                            </label>
                            <button type="button" onClick={() => show()} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#188747] px-3.5 text-[10px] font-semibold text-white transition hover:bg-[#126d39]">
                                <Plus size={14} /> Add category
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto px-3 pb-2.5 sm:px-4">
                        <table className="w-full min-w-165 text-left text-[10px]">
                            <thead className="border-b border-[#eaf0ec] bg-[#f5faf7] text-[9px] font-semibold text-[#668073]">
                                <tr>
                                    <th className="px-3 py-2.5">Image</th>
                                    <th className="px-3 py-2.5">Name</th>
                                    <th className="px-3 py-2.5">Slug</th>
                                    <th className="px-3 py-2.5">Parent</th>
                                    <th className="px-3 py-2.5">Products</th>
                                    <th className="px-3 py-2.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf1ee]">
                                {visibleCategories.map((category) => (
                                    <tr key={category.id} className="hover:bg-[#fbfdfb]">
                                        <td className="px-3 py-1.5"><CategoryIcon category={category} /></td>
                                        <td className="px-3 py-1.5 font-semibold text-[#405449]">{category.name}</td>
                                        <td className="px-3 py-1.5 text-[#6d7e73]">{category.slug}</td>
                                        <td className="px-3 py-1.5 text-[#64746a]">{category.parent?.name ?? 'Root'}</td>
                                        <td className="px-3 py-1.5 text-[#53655a]">{category.products_count}</td>
                                        <td className="px-3 py-1.5">
                                            <div className="flex justify-end gap-1.5">
                                                <button type="button" onClick={() => show(category)} aria-label={`Edit ${category.name}`} title="Edit category" className="flex h-7 w-7 items-center justify-center rounded-md border border-[#dbe9df] text-[#328152] transition hover:bg-[#edf8f1]"><Pencil size={13} /></button>
                                                <button type="button" onClick={() => setDeleting(category)} aria-label={`Delete ${category.name}`} title="Delete category" className="flex h-7 w-7 items-center justify-center rounded-md border border-[#f1ddda] text-[#c04c42] transition hover:bg-[#fff4f2]"><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {visibleCategories.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-[10px] text-[#819087]"><Tags size={18} className="mx-auto mb-1 text-[#83a18d]" />No categories match your search.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col gap-2 border-t border-[#edf1ee] px-3 py-2.5 text-[9px] text-[#748279] sm:flex-row sm:items-center sm:justify-between sm:px-4">
                        <p>Showing {filteredCategories.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filteredCategories.length)} of {filteredCategories.length} categories</p>
                        <div className="flex items-center justify-between gap-1 sm:justify-end">
                            <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[#6e7e74] hover:bg-[#f3f8f4] disabled:opacity-40"><ChevronLeft size={13} /> Previous</button>
                            <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-[#188747] px-2 font-semibold text-white">{currentPage}</span>
                            <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[#6e7e74] hover:bg-[#f3f8f4] disabled:opacity-40">Next <ChevronRight size={13} /></button>
                        </div>
                    </div>
                </section>

                {open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10271b]/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
                        <form onSubmit={submit} className="grid max-h-[90vh] w-full max-w-lg gap-4 overflow-y-auto rounded-xl border border-[#e4ebe6] bg-white p-4 shadow-2xl sm:p-5">
                            <div className="flex items-start justify-between border-b border-[#edf1ee] pb-3">
                                <div><h2 className="text-base font-bold text-[#26382d]">{editing ? 'Edit category' : 'Add Category'}</h2><p className="mt-1 text-[10px] text-[#7c8981]">Create a storefront category.</p></div>
                                <button type="button" aria-label="Close category form" onClick={closeForm} className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e2e8e4] text-[#68766d]"><X size={15} /></button>
                            </div>
                            <label className="grid gap-1.5 text-[10px] font-semibold text-[#4e6055]">Category name
                                <input required maxLength={255} value={form.data.name} onChange={(event) => { const name = event.target.value; form.setData((current) => ({ ...current, name, slug: current.slug === slugify(current.name) || !current.slug ? slugify(name) : current.slug })); }} className="h-9 rounded-lg border border-[#dce5df] px-3 text-xs font-normal outline-none focus:border-[#2a8b52]" />
                                {form.errors.name && <span className="text-[9px] text-[#b54238]">{form.errors.name}</span>}
                            </label>
                            <label className="grid gap-1.5 text-[10px] font-semibold text-[#4e6055]">Slug
                                <input required maxLength={255} value={form.data.slug} onChange={(event) => form.setData('slug', slugify(event.target.value))} className="h-9 rounded-lg border border-[#dce5df] px-3 text-xs font-normal outline-none focus:border-[#2a8b52]" />
                                {form.errors.slug && <span className="text-[9px] text-[#b54238]">{form.errors.slug}</span>}
                            </label>
                            <label className="grid gap-1.5 text-[10px] font-semibold text-[#4e6055]">Parent category
                                <span className="relative">
                                    <select value={form.data.parent_id} onChange={(event) => form.setData('parent_id', event.target.value)} className="h-9 w-full appearance-none rounded-lg border border-[#dce5df] bg-white px-3 pr-8 text-xs font-normal outline-none focus:border-[#2a8b52]">
                                        <option value="">Root category</option>
                                        {categories.filter((item) => item.id !== editing?.id).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                                    </select>
                                    <ChevronDown size={13} className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[#7a8d82]" />
                                </span>
                                {form.errors.parent_id && <span className="text-[9px] text-[#b54238]">{form.errors.parent_id}</span>}
                            </label>
                            <label className="grid gap-1.5 text-[10px] font-semibold text-[#4e6055]">Category image
                                <span className="flex items-center gap-3 rounded-lg border border-[#e6ede8] p-2.5">
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#eaf6ef] text-[#328152]">
                                        {form.data.image
                                            ? <img src={URL.createObjectURL(form.data.image)} alt="Selected category" className="h-full w-full object-cover" />
                                            : editing?.image
                                                ? <img src={editing.image.startsWith('http') || editing.image.startsWith('/') ? editing.image : `/storage/${editing.image}`} alt={editing.name} className="h-full w-full object-cover" />
                                                : <ImagePlus size={18} />}
                                    </span>
                                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={async (event) => {
                                        const file = event.target.files?.[0];
                                        form.setData('image', file ? await optimizeImage(file, { maxWidth: 1200, maxHeight: 1200 }) : null);
                                    }} className="min-w-0 text-[10px] font-normal text-[#64746a]" />
                                </span>
                                <span className="font-normal text-[9px] text-[#829087]">JPG, PNG, or WebP up to 2 MB.</span>
                                {form.errors.image && <span className="text-[9px] text-[#b54238]">{form.errors.image}</span>}
                            </label>
                            <div className="flex justify-end gap-2 border-t border-[#edf1ee] pt-3">
                                <button type="button" onClick={closeForm} className="h-9 rounded-lg border border-[#dce5df] px-3.5 text-[10px] font-semibold text-[#63746a] hover:bg-[#f7faf8]">Cancel</button>
                                <button disabled={form.processing} className="h-9 rounded-lg bg-[#188747] px-4 text-[10px] font-semibold text-white hover:bg-[#126d39] disabled:opacity-60">{form.processing ? 'Saving…' : 'Save category'}</button>
                            </div>
                        </form>
                    </div>
                )}

                {deleting && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#10271b]/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleteForm.processing) setDeleting(null); }}>
                        <section role="alertdialog" aria-modal="true" aria-labelledby="delete-category-title" className="w-full max-w-sm rounded-xl border border-[#e4ebe6] bg-white p-5 shadow-2xl">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff0ed] text-[#c04c42]"><Trash2 size={18} /></span>
                            <h2 id="delete-category-title" className="mt-3 text-sm font-bold text-[#26382d]">Delete category?</h2>
                            <p className="mt-1 text-[10px] leading-5 text-[#718077]">Are you sure you want to delete this category?</p>
                            {deleteForm.errors.category && <p role="alert" className="mt-2 text-[9px] text-[#b54238]">{deleteForm.errors.category}</p>}
                            <div className="mt-4 flex justify-end gap-2">
                                <button type="button" disabled={deleteForm.processing} onClick={() => setDeleting(null)} className="h-8 rounded-lg border border-[#dce5df] px-3 text-[10px] font-semibold text-[#63746a] hover:bg-[#f7faf8]">Cancel</button>
                                <button type="button" disabled={deleteForm.processing} onClick={deleteCategory} className="h-8 rounded-lg bg-[#c5483d] px-3 text-[10px] font-semibold text-white hover:bg-[#a83b32] disabled:opacity-60">{deleteForm.processing ? 'Deleting…' : 'Delete'}</button>
                            </div>
                        </section>
                    </div>
                )}
            </PortalLayout>
        </>
    );
}
