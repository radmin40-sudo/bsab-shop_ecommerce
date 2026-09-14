import { PortalLayout, StatCard } from '@/components/portal-layout';
import { Head, useForm } from '@inertiajs/react';
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

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

export default function Categories({ categories }: { categories: Category[] }) {
    const [editing, setEditing] = useState<Category | null>(null);
    const [open, setOpen] = useState(false);
    const form = useForm<CategoryForm>(empty);
    const show = (category?: Category) => {
        setEditing(category ?? null);
        setOpen(true);
        form.setData(category ? { name: category.name, slug: category.slug, parent_id: String(category.parent?.id ?? ''), image: null } : empty);
        form.clearErrors();
    };
    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setOpen(false);
                setEditing(null);
                form.reset();
            },
        };
        if (editing) {
            form.post(`/admin/categories/${editing.id}`, options);
        } else {
            form.post(route('admin.categories.store'), options);
        }
    };
    return (
        <>
            <Head title="Categories" />
            <PortalLayout role="admin" title="Categories" eyebrow="Category management">
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard label="Categories" value={String(categories.length)} detail="Category groups" />
                    <StatCard
                        label="Products assigned"
                        value={String(categories.reduce((sum, item) => sum + item.products_count, 0))}
                        detail="Across all categories"
                        tone="green"
                    />
                    <StatCard
                        label="Root categories"
                        value={String(categories.filter((item) => !item.parent).length)}
                        detail="Top-level categories"
                        tone="warm"
                    />
                </div>
                <section className="mt-8 border border-[#dfe3dc] bg-white">
                    <div className="flex items-center justify-between border-b border-[#dfe3dc] p-5">
                        <div>
                            <h2 className="font-serif text-2xl">Category groups</h2>
                            <p className="mt-1 text-sm text-[#657066]">Organize products into storefront categories.</p>
                        </div>
                        <button onClick={() => show()} className="flex items-center gap-2 bg-[#1e2420] px-4 py-2.5 text-sm font-semibold text-white">
                            <Plus size={16} /> Add category
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-160 text-left text-sm">
                            <thead className="bg-[#eef0e9] text-xs text-[#657066] uppercase">
                                <tr>
                                    <th className="px-5 py-3">Image</th>
                                    <th className="px-5 py-3">Name</th>
                                    <th className="px-5 py-3">Slug</th>
                                    <th className="px-5 py-3">Parent</th>
                                    <th className="px-5 py-3">Products</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf0eb]">
                                {categories.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-5 py-4">
                                            <span className="flex h-11 w-11 items-center justify-center overflow-hidden bg-[#e6f7eb] text-[#2c7a3b]">
                                                {category.image ? (
                                                    <img
                                                        src={`/storage/${category.image}`}
                                                        alt={category.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <ImagePlus size={18} />
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 font-semibold">{category.name}</td>
                                        <td className="px-5 py-4 text-[#657066]">{category.slug}</td>
                                        <td className="px-5 py-4 text-[#657066]">{category.parent?.name ?? 'Root'}</td>
                                        <td className="px-5 py-4">{category.products_count}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => show(category)}
                                                    className="flex items-center gap-1 border px-2.5 py-1.5 text-xs font-semibold"
                                                >
                                                    <Pencil size={13} /> Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        window.confirm(`Delete ${category.name}?`) &&
                                                        form.delete(`/admin/categories/${category.id}`, { preserveScroll: true })
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
                {open ? (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e2420]/35 p-5">
                        <form onSubmit={submit} className="grid w-full max-w-lg gap-4 border bg-white p-6">
                            <h2 className="font-serif text-2xl">{editing ? 'Edit category' : 'New category'}</h2>
                            {(['name', 'slug'] as const).map((field) => (
                                <label key={field} className="grid gap-2 text-sm font-semibold">
                                    {field === 'name' ? 'Name' : 'Slug'}
                                    <input
                                        required
                                        value={form.data[field]}
                                        onChange={(event) => form.setData(field, event.target.value)}
                                        className="border px-3 py-2.5 font-normal outline-none"
                                    />
                                    {form.errors[field] && <span className="text-xs text-[#a23b2d]">{form.errors[field]}</span>}
                                </label>
                            ))}
                            <label className="grid gap-2 text-sm font-semibold">
                                Parent category
                                <select
                                    value={form.data.parent_id}
                                    onChange={(event) => form.setData('parent_id', event.target.value)}
                                    className="border px-3 py-2.5 font-normal"
                                >
                                    <option value="">No parent</option>
                                    {categories
                                        .filter((item) => item.id !== editing?.id)
                                        .map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                </select>
                                {form.errors.parent_id && <span className="text-xs text-[#a23b2d]">{form.errors.parent_id}</span>}
                            </label>
                            <label className="grid gap-2 text-sm font-semibold">
                                Category image
                                <div className="flex items-center gap-3">
                                    <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden bg-[#e6f7eb] text-[#2c7a3b]">
                                        {form.data.image ? (
                                            <img
                                                src={URL.createObjectURL(form.data.image)}
                                                alt="Selected category"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : editing?.image ? (
                                            <img src={`/storage/${editing.image}`} alt={editing.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <ImagePlus size={20} />
                                        )}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(event) => form.setData('image', event.target.files?.[0] ?? null)}
                                        className="min-w-0 text-sm font-normal"
                                    />
                                </div>
                                <span className="font-normal text-[#657066]">JPG, PNG, or WebP up to 2 MB.</span>
                                {form.errors.image && <span className="text-xs text-[#a23b2d]">{form.errors.image}</span>}
                            </label>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOpen(false);
                                        setEditing(null);
                                        form.reset();
                                        form.clearErrors();
                                    }}
                                    className="border px-4 py-2 text-sm"
                                >
                                    Cancel
                                </button>
                                <button disabled={form.processing} className="bg-[#1e2420] px-4 py-2 text-sm font-semibold text-white">
                                    Save category
                                </button>
                            </div>
                        </form>
                    </div>
                ) : null}
            </PortalLayout>
        </>
    );
}
